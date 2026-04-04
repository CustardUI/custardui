<script lang="ts">
  import { onMount, onDestroy, getContext } from 'svelte';
  import { type ResolvedUIManagerOptions, type RuntimeCallbacks, RUNTIME_CALLBACKS_CTX } from './types';
  import { ICON_SETTINGS_CTX, type IconSettingsStore } from '$features/settings/stores/icon-settings-store.svelte';
  import { activeStateStore } from '$lib/stores/active-state-store.svelte';
  import { elementStore } from '$lib/stores/element-store.svelte';
  import { uiStore } from '$lib/stores/ui-store.svelte';
  import { derivedStore } from '$lib/stores/derived-store.svelte';

  import IntroCallout from '$features/settings/IntroCallout.svelte';
  import SettingsIcon from '$features/settings/SettingsIcon.svelte';
  import Modal from '$features/settings/Modal.svelte';
  import { showToast } from '$features/notifications/stores/toast-store.svelte';
  import { shareStore, type SelectionMode } from '$features/share/stores/share-store.svelte';
  import { focusStore } from '$features/focus/stores/focus-store.svelte';
  import { DEFAULT_EXCLUDED_TAGS, DEFAULT_EXCLUDED_IDS } from '$features/share/constants';
  import Toast from '$features/notifications/components/Toast.svelte';
  import ShareOverlay from '$features/share/ShareOverlay.svelte';
  import FocusBanner from '$features/focus/FocusBanner.svelte';

  import { UrlActionRouter } from '$features/url/url-action-router.svelte';
  import { IntroManager } from '$features/settings/intro-manager.svelte';
  import { colorSchemeStore } from '$lib/stores/color-scheme-store.svelte';

  let { options } = $props<{
    options: ResolvedUIManagerOptions;
  }>();

  const { persistenceManager, resetToDefault } = getContext<RuntimeCallbacks>(RUNTIME_CALLBACKS_CTX);
  const iconSettingsStore = getContext<IconSettingsStore>(ICON_SETTINGS_CTX);

  // --- Derived State ---
  const storeConfig = $derived(activeStateStore.config);
  const settingsEnabled = $derived(options.settingsEnabled);

  // --- Services ---
  const introManager = new IntroManager(persistenceManager, () => options.callout);
  const router = new UrlActionRouter({
    onOpenModal: openModal,
    onStartShare: handleStartShare,
    checkSettingsEnabled: () => settingsEnabled,
  });

  // --- UI State ---
  let isModalOpen = $state(false);

  // --- Computed Props ---

  // Share Configuration
  const shareExclusions = $derived(storeConfig.shareExclusions || {});
  const excludedTags = $derived([...DEFAULT_EXCLUDED_TAGS, ...(shareExclusions.tags || [])]);
  const excludedIds = $derived([...DEFAULT_EXCLUDED_IDS, ...(shareExclusions.ids || [])]);

  // --- Initialization ---

  onMount(() => {
    router.init();

    return () => router.destroy();
  });

  // --- Effects ---

  $effect(() => {
    introManager.init(elementStore.hasElementsOnCurrentPage, settingsEnabled);
  });

  // onDestroy (not $effect cleanup) so the attribute is never briefly absent during transitions.
  $effect(() => {
    document.documentElement.setAttribute('data-cv-theme', colorSchemeStore.isDark ? 'dark' : 'light');
  });

  onDestroy(() => {
    document.documentElement.removeAttribute('data-cv-theme');
  });

  // --- Modal Actions ---

  function openModal() {
    if (!settingsEnabled) return;
    introManager.dismiss();
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }

  function handleReset() {
    resetToDefault();
    iconSettingsStore.resetPositionAndCollapseState();
    showToast('Settings reset to default');
  }

  function handleStartShare(mode: SelectionMode = 'highlight') {
    closeModal();
    focusStore.exit();
    shareStore.setSelectionMode(mode);
    shareStore.toggleActive(true);
  }

  // --- Icon Visibility ---
  const shouldShowIcon = $derived(
    settingsEnabled &&
    !iconSettingsStore.isDismissed &&
    (derivedStore.hasMenuOptions || uiStore.uiOptions.showTabGroups || isModalOpen),
  );
</script>

<div class="cv-widget-root" data-cv-share-ignore>
  <!-- Intro Callout -->
  {#if introManager.showCallout && settingsEnabled}
    <IntroCallout
      position={options.icon.position}
      message={options.callout?.message}
      enablePulse={options.callout?.enablePulse}
      backgroundColor={options.callout?.backgroundColor}
      textColor={options.callout?.textColor}
      onclose={() => introManager.dismiss()}
    />
  {/if}

  <!-- Toast Container -->
  <Toast />

  {#if shareStore.isActive}
    <ShareOverlay {excludedTags} {excludedIds} />
  {/if}

  <FocusBanner />

  <!-- Widget Icon: Only specific to Settings -->
  {#if shouldShowIcon && options.icon.show}
    <SettingsIcon
      position={options.icon.position}
      title={uiStore.uiOptions.title}
      pulse={introManager.showPulse}
      onclick={openModal}
      iconColor={options.icon?.color}
      backgroundColor={options.icon?.backgroundColor}
      opacity={options.icon?.opacity}
      scale={options.icon?.scale}
    />
  {/if}

  <!-- Modal: Only specific to Settings -->
  {#if settingsEnabled && isModalOpen}
    <Modal
      onclose={closeModal}
      onreset={handleReset}
      onstartShare={handleStartShare}
    />
  {/if}
</div>

<style>
  /* --cv-* defaults (light) — on :root so custom properties cascade into all shadow DOM */
  :global(:root) {
    --cv-bg: white;
    --cv-text: rgba(0, 0, 0, 0.9);
    --cv-text-secondary: rgba(0, 0, 0, 0.6);
    --cv-border: rgba(0, 0, 0, 0.1);
    --cv-bg-hover: rgba(0, 0, 0, 0.05);

    --cv-primary: #3e84f4;
    --cv-primary-hover: #2563eb;

    --cv-danger: #dc2626;
    --cv-danger-bg: rgba(220, 38, 38, 0.1);

    --cv-shadow: rgba(0, 0, 0, 0.25);

    --cv-input-bg: white;
    --cv-input-border: rgba(0, 0, 0, 0.15);
    --cv-switch-bg: rgba(0, 0, 0, 0.1);
    --cv-switch-knob: white;

    --cv-modal-icon-bg: rgba(0, 0, 0, 0.08);
    --cv-icon-bg: rgba(255, 255, 255, 0.92);
    --cv-icon-color: rgba(0, 0, 0, 0.9);

    --cv-focus-ring: rgba(62, 132, 244, 0.2);

    --cv-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);

    --cv-modal-radius: 0.75rem;
    --cv-card-radius: 0.5rem;
    --cv-section-label-transform: uppercase;
  }

  /* Dark Theme — triggered by data-cv-theme="dark" on <html> */
  :global(:root[data-cv-theme='dark']) {
    --cv-bg: #101722;
    --cv-text: #e2e8f0;
    --cv-text-secondary: rgba(255, 255, 255, 0.6);
    --cv-border: rgba(255, 255, 255, 0.1);
    --cv-bg-hover: rgba(255, 255, 255, 0.05);

    --cv-primary: #3e84f4;
    --cv-primary-hover: #60a5fa;

    --cv-danger: #f87171;
    --cv-danger-bg: rgba(248, 113, 113, 0.1);

    --cv-shadow: rgba(0, 0, 0, 0.5);

    --cv-input-bg: #1e293b;
    --cv-input-border: rgba(255, 255, 255, 0.1);
    --cv-switch-bg: rgba(255, 255, 255, 0.1);
    --cv-switch-knob: #e2e8f0;

    --cv-modal-icon-bg: rgba(255, 255, 255, 0.08);
    --cv-icon-bg: #1e293b;
    --cv-icon-color: #e2e8f0;

    --cv-focus-ring: rgba(62, 132, 244, 0.5);
    --cv-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);

    --cv-modal-radius: 0.75rem;
    --cv-card-radius: 0.5rem;
    --cv-section-label-transform: uppercase;
  }

  /* Fixed zero-size overlay — pointer-events none so clicks pass through to the page */
  :global(.cv-widget-root) {
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    z-index: 9999;
    pointer-events: none;
    font-family: inherit;
  }

  /* Interactive children need pointer-events restored */
  :global(.cv-widget-root > *) {
    pointer-events: auto;
  }

  /* ShareOverlay manages its own pointer-events internally */
  :global(.cv-widget-root .cv-share-overlay) {
    pointer-events: none;
  }

  :global(.cv-hidden) {
    display: none !important;
  }
</style>
