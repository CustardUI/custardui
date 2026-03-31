import { placeholderManager } from '$features/placeholder/placeholder-manager';
import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';
import type { Config, ConfigSectionKey, State, ToggleConfig } from '$lib/types/index';
import { isValidConfigSection } from '$lib/types/index';
import type { AdaptationConfig } from '$features/adaptation/types';

/**
 * Store for managing the application's configuration and user state.
 * Handles:
 * - Loading and storing static configuration.
 * - Managing mutable user state (toggles, tabs, placeholders).
 * - Computing default states based on configuration.
 */
export class ActiveStateStore {
  /**
   * Static configuration loaded at startup.
   */
  config = $state<Config>({});

  /**
   * Explicit order of sections derived from the initial configuration JSON.
   */
  configSectionOrder = $state<ConfigSectionKey[]>([]);

  /**
   * Mutable application state representing user choices.
   * Use actions like `setMarkedTab` or `setToggles` to modify this.
   */
  state = $state<State>({
    shownToggles: [],
    peekToggles: [],
    tabs: {},
    placeholders: {},
  });

  constructor(initialConfig: Config = {}) {
    if (Object.keys(initialConfig).length > 0) {
      this.init(initialConfig);
    } else {
      this.state = this.computeDefaultState();
    }
  }

  /**
   * Initialize with real configuration.
   */
  init(config: Config) {
    Object.assign(this.config, config);
    this.configSectionOrder = Object.keys(config).filter(isValidConfigSection);
    
    // Compute new defaults and merge
    const newState = this.computeDefaultState();
    
    // Reset state to computed defaults.
    // Overriding with URL state happens later via applyDifferenceInState().
    this.state.shownToggles = newState.shownToggles ?? [];
    this.state.peekToggles = newState.peekToggles ?? [];
    this.state.tabs = newState.tabs ?? {};
    this.state.placeholders = newState.placeholders ?? {};
  }

  // --- Actions ---

  /**
   * Set the marked tab for a specific tab group.
   * This syncs across all tab groups with the same ID.
   * @param groupId The ID of the tab group.
   * @param tabId The ID of the tab to mark.
   */
  setMarkedTab(groupId: string, tabId: string) {
    if (!this.state.tabs) this.state.tabs = {};
    this.state.tabs[groupId] = tabId;
    
    const phUpdate = placeholderManager.calculatePlaceholderFromTabSelected(groupId, tabId, this.config);
    if (phUpdate) {
      this.setPlaceholder(phUpdate.key, phUpdate.value);
    }
  }

  /**
   * Update the visibility of toggles.
   * @param shown List of IDs for toggles in "Show" state.
   * @param peek List of IDs for toggles in "Peek" state.
   */
  setToggles(shown: string[], peek: string[]) {
    this.state.shownToggles = shown;
    this.state.peekToggles = peek;
  }

  /**
   * Update the visibility state of a specific toggle.
   * Handled internally so UI components (like Modal) don't need to mutate arrays directly.
   * @param toggleId The ID of the toggle.
   * @param value The new visibility state.
   */
  updateToggleState(toggleId: string, value: 'show' | 'hide' | 'peek') {
    const currentShown = this.state.shownToggles || [];
    const currentPeek = this.state.peekToggles || [];

    const newShown = currentShown.filter((id) => id !== toggleId);
    const newPeek = currentPeek.filter((id) => id !== toggleId);

    if (value === 'show') newShown.push(toggleId);
    if (value === 'peek') newPeek.push(toggleId);

    this.setToggles(newShown, newPeek);
  }

  /**
   * Set a specific placeholder value.
   * @param key The ID/name of the placeholder.
   * @param value The value to set.
   */
  setPlaceholder(key: string, value: string) {
    if (!this.state.placeholders) this.state.placeholders = {};
    this.state.placeholders[key] = value;
  }

  // --- State Application ---

  /**
   * Replaces the full application state (e.g. from persistence).
   *
   * Precedence model:
   * 1. Start from computed defaults for toggles and tabs.
   * 2. Layer in the incoming `newState`, sanitizing toggles, tabs, and user-settable placeholders.
   * 3. For placeholders, use the CURRENT state as the base (preserving adaptation defaults) 
   *    and merge user-persisted values on top.
   * 4. Sync any tab-group-derived placeholders that weren't explicitly set.
   *
   * @param newState The persisted state to restore.
   */
  applyState(newState: State) {
    const defaults = this.computeDefaultState();

    const validatedTabs = this.filterValidTabs(newState.tabs ?? {});
    const validatedPlaceholders = placeholderManager.filterUserSettablePlaceholders(newState.placeholders ?? {});
    
    // For site-managed toggles, we use the current state (which includes adaptation defaults).
    // For user-settable toggles, we use the incoming newState (if present) or fall back to defaults.
    const validatedShownToggles = [
      ...this.filterNonSiteManagedToggleIds(this.filterValidToggles(newState.shownToggles ?? defaults.shownToggles ?? [])),
      ...this.filterSiteManagedToggleIds(this.state.shownToggles ?? []),
    ];
    const validatedPeekToggles = [
      ...this.filterNonSiteManagedToggleIds(this.filterValidToggles(newState.peekToggles ?? defaults.peekToggles ?? [])),
      ...this.filterSiteManagedToggleIds(this.state.peekToggles ?? []),
    ];

    this.state = {
      shownToggles: validatedShownToggles,
      peekToggles: validatedPeekToggles,
      tabs: { ...(defaults.tabs ?? {}), ...validatedTabs },
      // Use current state as base so adaptation defaults (layered before this call)
      // are preserved; user-persisted values still win on top.
      placeholders: { ...(this.state.placeholders ?? {}), ...validatedPlaceholders },
    };

    // Sync derived placeholders for any tabs that shifted (and aren't explicitly overridden).
    this.syncPlaceholdersFromTabs(validatedPlaceholders);
  }

  /**
   * Applies a sparse delta on top of the current state (e.g. from URL parameters).
   *
   * Semantics:
   * - Only toggles explicitly mentioned in the delta are affected;
   *   unmentioned toggles retain their current visibility.
   * - Tab and placeholder entries in the delta are merged into (not replacing) current state.
   * - Incoming tab IDs are validated against the config; invalid entries are dropped.
   * - Incoming placeholder keys are validated against the registry; invalid keys are dropped.
   * - After tab merges, tab-group-derived placeholders are automatically synced
   *   unless the delta explicitly provides a value for them.
   *
   * @param deltaState Partial state describing only the changes to apply.
   */
  applyDifferenceInState(deltaState: State) {
    this.applyToggleDelta(deltaState);
    this.applyTabsDelta(deltaState.tabs ?? {});
    this.applyPlaceholdersDelta(deltaState.placeholders ?? {});
  }

  /**
   * Applies adaptation preset on top of the config defaults, before persisted state.
   * User choices applied later via applyState() will override these.
   *
   * @param preset The preset section from the adaptation config
   */
  applyAdaptationDefaults(preset: AdaptationConfig['preset']): void {
    if (!preset) return;

    if (preset.toggles) {
      this.applyToggleMap(preset.toggles);
    }

    if (preset.tabs) {
      const validated = this.filterValidTabs(preset.tabs);
      if (!this.state.tabs) this.state.tabs = {};
      Object.assign(this.state.tabs, validated);
    }

    if (preset.placeholders) {
      const validated = placeholderManager.filterValidPlaceholders(preset.placeholders);
      if (!this.state.placeholders) this.state.placeholders = {};
      Object.assign(this.state.placeholders, validated);
    }
  }

  /**
   * Resets the application state to the computed defaults.
   */
  reset() {
    this.state = this.computeDefaultState();
  }


  public computeDefaultState(): State {
    const shownToggles: string[] = [];
    const peekToggles: string[] = [];
    const tabs: Record<string, string> = {};
    const placeholders: Record<string, string> = {};

    // 1. Process toggles
    for (const toggle of (this.config.toggles ?? [])) {
      if (toggle.default === 'peek') {
        peekToggles.push(toggle.toggleId);
      } else if (toggle.default === 'hide') {
        // Start hidden — not in shown or peek lists
      } else {
        shownToggles.push(toggle.toggleId);
      }
    }

    // 2. Process tab groups
    for (const group of (this.config.tabGroups ?? [])) {
      let defaultTabId = group.default;
      if (!defaultTabId) {
        defaultTabId = group.tabs?.[0]?.tabId;
      }

      if (!defaultTabId) continue;

      tabs[group.groupId] = defaultTabId;

      if (!group.placeholderId) continue;

      // Priority: config-owned placeholders (source: 'config') always win.
      // Even if they have no defaultValue, they should not be seeded from a tab.
      const definition = placeholderRegistryStore.get(group.placeholderId);
      if (definition?.source === 'config') continue;

      const tabConfig = group.tabs.find((t) => t.tabId === defaultTabId);
      if (tabConfig && placeholders[group.placeholderId] === undefined) {
        placeholders[group.placeholderId] = tabConfig.placeholderValue ?? '';
      }
    }

    // 3. Seed site-managed (siteManaged) defaults.
    // These are set by adaptations when active, and fall back to defaultValue when no adaptation is active.
    // This is intentionally separate from regular user-settable placeholder defaults (see PR #206).
    for (const def of placeholderRegistryStore.definitions) {
      if (def.siteManaged && def.defaultValue !== undefined && def.defaultValue !== '') {
        placeholders[def.name] = def.defaultValue;
      }
    }

    return { shownToggles, peekToggles, tabs, placeholders };
  }

  // --- Private Helpers ---

  /**
   * Finds a toggle in the configuration using a case-insensitive ID match.
   * @param toggleId The ID to search for.
   * @returns The matched toggle configuration, or undefined if not found.
   */
  private getToggleConfigFromConfig(toggleId: string): ToggleConfig | undefined {
    return this.config.toggles?.find((t) => t.toggleId.toLowerCase() === toggleId.toLowerCase());
  }

  /**
   * Applies a map of toggleId → visibility to the current state.
   * Removes each mentioned toggle from both lists, then re-adds to the correct one.
   * Warns and drops unknown IDs (consistent with filterValidToggles).
   */
  private applyToggleMap(toggleMap: Record<string, 'show' | 'hide' | 'peek'>): void {
    for (const [toggleId, visibility] of Object.entries(toggleMap)) {
      const match = this.getToggleConfigFromConfig(toggleId);
      if (!match) {
        console.warn(`[CustardUI] Toggle "${toggleId}" is not in the config and will be ignored.`);
        continue;
      }

      const canonical = match.toggleId;

      // Remove from both lists
      this.state.shownToggles = (this.state.shownToggles ?? []).filter((id) => id !== canonical);
      this.state.peekToggles = (this.state.peekToggles ?? []).filter((id) => id !== canonical);

      // Re-add to correct list
      if (visibility === 'show') {
        this.state.shownToggles.push(canonical);
      } else if (visibility === 'peek') {
        this.state.peekToggles.push(canonical);
      }
      // 'hide' means absent from both lists — already handled above
    }
  }

  /**
   * Applies the toggle portion of a delta state.
   * Toggles explicitly reassigned in the delta are moved to their new state;
   * all others retain their current visibility.
   */
  private applyToggleDelta(deltaState: State) {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const toShow = new Set(this.filterNonSiteManagedToggleIds(this.filterValidToggles(deltaState.shownToggles ?? [])));
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const toPeek = new Set(this.filterNonSiteManagedToggleIds(this.filterValidToggles(deltaState.peekToggles ?? [])));
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const toHide = new Set(this.filterNonSiteManagedToggleIds(this.filterValidToggles(deltaState.hiddenToggles ?? [])));
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const allMentioned = new Set([...toShow, ...toPeek, ...toHide]);

    const newShown = (this.state.shownToggles ?? []).filter((id) => !allMentioned.has(id));
    const newPeek = (this.state.peekToggles ?? []).filter((id) => !allMentioned.has(id));

    newShown.push(...toShow);
    newPeek.push(...toPeek);
    // Hidden toggles are simply absent from both shown and peek lists

    this.state.shownToggles = newShown;
    this.state.peekToggles = newPeek;
  }

  /**
   * Merges a tab delta into the current state.
   * Validates each incoming groupId and tabId against the configuration.
   * Invalid entries are dropped with a warning; valid entries override the current selection.
   * After merging, tab-group-derived placeholders are synced.
   */
  private applyTabsDelta(deltaTabs: Record<string, string>) {
    const validatedTabs = this.filterValidTabs(deltaTabs);

    if (!this.state.tabs) this.state.tabs = {};
    Object.assign(this.state.tabs, validatedTabs);

    // Sync tab-derived placeholders for any tabs that changed.
    // Placeholders are NOT passed as explicit overrides here, so all tab-derived ones will sync.
    this.syncPlaceholdersFromTabs({});
  }

  /**
   * Merges a placeholder delta into the current state.
   * Only registered placeholder keys are accepted; others are dropped with a warning.
   * Explicit placeholder values override any tab-derived value (winning over syncPlaceholdersFromTabs).
   */
  private applyPlaceholdersDelta(deltaPlaceholders: Record<string, string>) {
    const validatedPlaceholders = placeholderManager.filterUserSettablePlaceholders(deltaPlaceholders);

    if (!this.state.placeholders) this.state.placeholders = {};
    Object.assign(this.state.placeholders, validatedPlaceholders);
  }

  /**
   * Removes toggle IDs belonging to siteManaged toggles.
   * Used to prevent user-supplied state (URL, localStorage) from overriding site-controlled toggles.
   */
  private filterNonSiteManagedToggleIds(ids: string[]): string[] {
    return ids.filter((id) => !this.isSiteManaged(id));
  }

  /**
   * Returns only the toggle IDs that are siteManaged.
   */
  private filterSiteManagedToggleIds(ids: string[]): string[] {
    return ids.filter((id) => this.isSiteManaged(id));
  }

  /**
   * Checks if a toggle is siteManaged.
   */
  private isSiteManaged(toggleId: string): boolean {
    const toggle = this.config.toggles?.find((t) => t.toggleId === toggleId);
    return !!toggle?.siteManaged;
  }

  /**
   * Validates an incoming tab record against the configuration.
   * Drops any groupId that doesn't exist in `config.tabGroups`,
   * and any tabId that doesn't exist within that group.
   *
   * @param incomingTabs Raw tab record (e.g. from a URL or persistence).
   * @returns A filtered record containing only valid groupId → tabId pairs.
   */
  private filterValidTabs(incomingTabs: Record<string, string>): Record<string, string> {
    const valid: Record<string, string> = {};

    for (const [groupId, tabId] of Object.entries(incomingTabs)) {
      const group = this.config.tabGroups?.find((g) => g.groupId.toLowerCase() === groupId.toLowerCase());
      if (!group) {
        console.warn(`[CustardUI] Tab group "${groupId}" is not in the config and will be ignored.`);
        continue;
      }

      const matchedTab = group.tabs.find((t) => t.tabId.toLowerCase() === tabId.toLowerCase());
      if (!matchedTab) {
        console.warn(`[CustardUI] Tab "${tabId}" is not in group "${group.groupId}" and will be ignored.`);
        continue;
      }

      valid[group.groupId] = matchedTab.tabId;
    }

    return valid;
  }

  /**
   * Validates an incoming list of toggle IDs against the configuration.
   * Invalid IDs are dropped with a warning.
   */
  private filterValidToggles(incomingToggles: string[]): string[] {
    if (!this.config.toggles || this.config.toggles.length === 0) {
      incomingToggles.forEach((id) =>
        console.warn(`[CustardUI] Toggle "${id}" is not in the config and will be ignored.`),
      );
      return [];
    }

    const valid: string[] = [];

    for (const toggleId of incomingToggles) {
      const match = this.getToggleConfigFromConfig(toggleId);
      if (!match) {
        console.warn(`[CustardUI] Toggle "${toggleId}" is not in the config and will be ignored.`);
        continue;
      }
      valid.push(match.toggleId);
    }

    return valid;
  }

  /**
   * Recalculates tab-group-derived placeholders for any tab group that hasn't been
   * explicitly overridden in the `explicitPlaceholders` map.
   *
   * Skip rules (to avoid overwriting intentional values):
   * - If the placeholder was explicitly included in the incoming state, skip it.
   * - If the placeholder is owned by `config` (not a tab group), skip it.
   *
   * @param explicitPlaceholders Placeholders that were explicitly set in the incoming state.
   */
  private syncPlaceholdersFromTabs(explicitPlaceholders: Record<string, string>) {
    if (!this.config.tabGroups) return;

    for (const group of this.config.tabGroups) {
      const phId = group.placeholderId;
      if (!phId) continue;

      // Explicit URL/persistence value wins — don't overwrite it with the tab-derived value.
      if (explicitPlaceholders[phId] !== undefined) continue;

      // Config-owned placeholders are not tab-derived — don't synchronize them.
      const definition = placeholderRegistryStore.get(phId);
      if (definition?.source === 'config') continue;

      // Calculate the tab-derived value for the currently active tab.
      const activeTabId = this.state.tabs?.[group.groupId];
      if (!activeTabId) continue;

      const phUpdate = placeholderManager.calculatePlaceholderFromTabSelected(group.groupId, activeTabId, this.config);
      if (phUpdate) {
        this.setPlaceholder(phUpdate.key, phUpdate.value);
      }
    }
  }
}

export const activeStateStore = new ActiveStateStore();
