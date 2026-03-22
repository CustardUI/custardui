import type { ConfigFile, State } from '$lib/types/index';
import type { AdaptationConfig } from '$features/adaptation/types';

import { PersistenceManager } from './utils/persistence';
import { IconSettingsStore } from '$features/settings/stores/icon-settings-store.svelte';
import { URLStateManager } from '$features/url/url-state-manager';
import { AdaptationManager } from '$features/adaptation/adaptation-manager';

import { FocusService } from '$features/focus/services/focus-service.svelte';
import { activeStateStore } from './stores/active-state-store.svelte';
import { elementStore } from './stores/element-store.svelte';
import { uiStore } from './stores/ui-store.svelte';
import { placeholderManager } from '$features/placeholder/placeholder-manager';
import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';
import { labelManager } from '$features/labels/label-manager';
import { colorSchemeStore } from '$lib/stores/color-scheme-store.svelte';
import { PlaceholderBinder } from '$features/placeholder/placeholder-binder';
import { adaptationStore } from '$features/adaptation/stores/adaptation-store.svelte';

/**
 * Strips site-managed state (toggles and placeholders) before persisting.
 * Site-managed values are controlled by the site/adaptation and should never
 * accumulate in localStorage.
 */
function stripSiteManaged(state: State): State {
  // Strip siteManaged toggle values
  const siteManagedToggleIds = new Set(
    (activeStateStore.config.toggles ?? [])
      .filter((t) => t.siteManaged)
      .map((t) => t.toggleId),
  );
  const shownToggles = (state.shownToggles ?? []).filter((id) => !siteManagedToggleIds.has(id));
  const peekToggles = (state.peekToggles ?? []).filter((id) => !siteManagedToggleIds.has(id));

  // Strip siteManaged placeholder keys
  const placeholders: Record<string, string> = {};
  for (const [key, value] of Object.entries(state.placeholders ?? {})) {
    const def = placeholderRegistryStore.get(key);
    if (!def?.siteManaged) placeholders[key] = value;
  }

  return { ...state, shownToggles, peekToggles, placeholders };
}

export interface RuntimeOptions {
  configFile: ConfigFile;
  rootEl?: HTMLElement | undefined;
  storageKey?: string | undefined;
  adaptationConfig?: AdaptationConfig | null;
}

/**
 * The reactive runtime for CustardUI. Manages the full lifecycle: initialization,
 * state resolution, reactive side-effects (URL sync, persistence), DOM observation, and teardown.
 * Components (Toggle, TabGroup) are self-contained and self-managing via the global store.
 */
export class AppRuntime {
  private rootEl: HTMLElement;
  public persistenceManager: PersistenceManager;
  private focusService: FocusService;
  public iconSettingsStore: IconSettingsStore;

  private observer?: MutationObserver;
  private destroyEffectRoot?: () => void;
  private onHashChange?: () => void;

  constructor(opt: RuntimeOptions) {
    this.rootEl = opt.rootEl || document.body;
    this.persistenceManager = new PersistenceManager(opt.storageKey);
    this.iconSettingsStore = new IconSettingsStore(this.persistenceManager);

    // Initialize all store singletons with config
    this.initStores(opt.configFile);

    // Initialize adaptation store
    adaptationStore.init(opt.adaptationConfig ?? null);

    // Initial State Resolution:
    // URL (Sparse Override) > Persistence (Full) > Adaptation Preset > Config Default
    this.resolveInitialState(opt.adaptationConfig ?? null);

    // Resolve Exclusions
    this.focusService = new FocusService(this.rootEl, {
      shareExclusions: opt.configFile.config?.shareExclusions || {},
    });
  }

  /**
   * Initialize all stores with configuration from the config file.
   * Populates the singleton sub-stores with real data.
   */
  private initStores(configFile: ConfigFile) {
    const config = configFile.config || {};
    const settings = configFile.settings?.panel || {};

    // Process Global Placeholders from Config
    placeholderManager.registerConfigPlaceholders(config);

    // Initialize ActiveStateStore with config
    activeStateStore.init(config);

    // Register tab-group placeholders AFTER global config placeholders to preserve precedence
    placeholderManager.registerTabGroupPlaceholders(config);

    // Register label definitions
    labelManager.registerConfigLabels(config);

    // Initialize color scheme for site for general color resolution
    // Ensure any previous listeners cleaned up before re-initializing
    colorSchemeStore.destroy();
    colorSchemeStore.init(configFile.colorScheme ?? 'light');

    // Initialize UI Options from Settings
    uiStore.setUIOptions({
      showTabGroups: settings.showTabGroups ?? true,
      showReset: settings.showReset ?? true,
      title: settings.title ?? 'Customize View',
      description: settings.description ?? '',
    });
  }

  /**
   * Resolves the starting application state by layering sources:
   *
   * 1. **Baseline**: `ActiveStateStore` initializes with defaults from the config file.
   * 2. **Adaptation Preset**: If an adaptation is active, its preset is applied
   *    on top of the config defaults (before persisted state, so user choices can win).
   * 3. **Persistence**: If local storage has a saved state, it replaces the baseline (`applyState`).
   * 4. **URL Overrides**: If the URL contains parameters (`?t-show=X`), these are applied
   *    as **sparse overrides** (`applyDifferenceInState`). Toggles not mentioned in the URL
   *    retain their values from persistence/defaults.
   */
  private resolveInitialState(adaptationConfig: AdaptationConfig | null) {
    // 1. Apply adaptation preset on top of config defaults (before persisted state)
    if (adaptationConfig?.preset) {
      activeStateStore.applyAdaptationDefaults(adaptationConfig.preset);
      if (adaptationConfig.preset.labels) {
        labelManager.applyAdaptationOverrides(adaptationConfig.preset.labels);
      }
    }

    // 2. Apply persisted base state on top of defaults (user choices win over adaptation defaults).
    const persistedState = this.persistenceManager.getPersistedState();
    if (persistedState) {
      activeStateStore.applyState(persistedState);
    }

    // 3. Layer URL delta on top, then clear the URL parameters so they don't persist
    const urlDelta = URLStateManager.parseURL();
    if (urlDelta) {
      activeStateStore.applyDifferenceInState(urlDelta);
      URLStateManager.clearURL();
    }

    // 4. Restore UI preferences
    const navPref = this.persistenceManager.getPersistedTabNavVisibility();
    if (navPref !== null) {
      uiStore.isTabGroupNavHeadingVisible = navPref;
    }
  }

  /**
   * Starts the CustardUI execution engine.
   *
   * Components (Toggle, TabGroup) self-register during their mount lifecycle.
   * This method starts the global observers for DOM changes and reactive state side-effects.
   */
  public start() {
    this.scanDOM();
    this.startComponentObserver();
    this.startGlobalReactivity();
  }

  // --- Execution Helpers ---

  /**
   * Performs an initial, non-reactive scan of the DOM for placeholders.
   */
  private scanDOM() {
    // Clear previous page detections if any (SPA support)
    elementStore.clearDetectedPlaceholders();
    PlaceholderBinder.scanAndHydrate(this.rootEl);
  }

  /**
   * Sets up global reactivity using `$effect.root` for persistence and placeholder binding.
   */
  private startGlobalReactivity() {
    this.destroyEffectRoot = $effect.root(() => {
      // Automatic Persistence
      $effect(() => {
        this.persistenceManager.persistState(stripSiteManaged(activeStateStore.state));
        this.persistenceManager.persistTabNavVisibility(uiStore.isTabGroupNavHeadingVisible);
      });

      // Automatic Placeholder Updates
      $effect(() => {
        PlaceholderBinder.updateAll(activeStateStore.state.placeholders ?? {});
      });
    });

    // When the user navigates to a hash anchor (#section), the hash indicator
    // (#/id) is replaced by the browser. Re-run the indicator logic so it
    // falls back to ?adapt=id for the now-occupied hash.
    const activeAdaptationId = adaptationStore.activeConfig?.id;
    if (activeAdaptationId) {
      this.onHashChange = () => {
        AdaptationManager.rewriteUrlIndicator(activeAdaptationId);
      };
      window.addEventListener('hashchange', this.onHashChange);
    }
  }

  /**
   * Sets up a MutationObserver to detect content added dynamically to the page
   * (e.g. by other scripts, lazy loading, or client-side routing).
   */
  private startComponentObserver() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        mutation.addedNodes.forEach((node) => this.handleForPlaceholders(node));
      }
    });

    // Observe the entire document tree for changes
    this.observer.observe(this.rootEl, { childList: true, subtree: true });
  }

  /**
   * Processes a newly added DOM node to check for and hydrate placeholders.
   */
  private handleForPlaceholders(node: Node) {
    // Skip our own custom elements to avoid unnecessary scanning
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName === 'CV-PLACEHOLDER' || el.tagName === 'CV-PLACEHOLDER-INPUT') {
        return;
      }
    }

    // Case 1: A new HTML element was added (e.g. via innerHTML or appendChild).
    // Recursively scan inside for any new placeholders.
    if (node.nodeType === Node.ELEMENT_NODE) {
      PlaceholderBinder.scanAndHydrate(node as HTMLElement);
    }
    // Case 2: A raw text node was added directly.
    // Check looks like a variable `[[...]]` to avoid unnecessary scans of plain text.
    else if (
      node.nodeType === Node.TEXT_NODE &&
      node.parentElement &&
      node.nodeValue?.includes('[[') &&
      node.nodeValue?.includes(']]')
    ) {
      // Re-scan parent to properly wrap text node in reactive span.
      PlaceholderBinder.scanAndHydrate(node.parentElement);
    }
  }

  // --- Public APIs for Widget/Other ---

  public resetToDefault() {
    this.persistenceManager.clearAll();
    activeStateStore.reset();
    // Re-apply adaptation preset so adaptation-controlled placeholders are not wiped by reset.
    if (adaptationStore.activeConfig?.preset) {
      activeStateStore.applyAdaptationDefaults(adaptationStore.activeConfig.preset);
    }
    uiStore.reset();
    uiStore.isTabGroupNavHeadingVisible = true;
  }

  public destroy() {
    this.observer?.disconnect();
    this.destroyEffectRoot?.();
    this.focusService.destroy();
    if (this.onHashChange) {
      window.removeEventListener('hashchange', this.onHashChange);
    }
  }
}
