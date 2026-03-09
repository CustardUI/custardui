import type { AssetsManager } from '$features/render/assets';
import { elementStore } from './element-store.svelte';
import { activeStateStore } from './active-state-store.svelte';
import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';

/**
 * Cross-cutting derived state that combines data from multiple sub-stores.
 * Holds only computed/derived values and assetsManager — no mutable application state.
 */
class DerivedStateStore {
  assetsManager = $state<AssetsManager | undefined>(undefined);

  // Menu toggles are those that are either global or
  // local but present and registered in the DOM
  menuToggles = $derived.by(() => {
    if (!activeStateStore.config.toggles) return [];
    return activeStateStore.config.toggles.filter(
      (t) => !t.isLocal || elementStore.detectedToggles.has(t.toggleId),
    );
  });

  menuTabGroups = $derived.by(() => {
    if (!activeStateStore.config.tabGroups) return [];
    return activeStateStore.config.tabGroups.filter(
      (g) => !g.isLocal || elementStore.detectedTabGroups.has(g.groupId),
    );
  });

  hiddenToggleIds = $derived.by(() => {
    const shown = activeStateStore.state.shownToggles ?? [];
    const peek = activeStateStore.state.peekToggles ?? [];
    return [...elementStore.detectedToggles].filter(
      (id) => !shown.includes(id) && !peek.includes(id),
    );
  });

  hasVisiblePlaceholders = $derived.by(() => {
    return placeholderRegistryStore.definitions.some((d) => {
      if (d.hiddenFromSettings) return false;
      if (d.isLocal) {
        return elementStore.detectedPlaceholders.has(d.name);
      }
      return true;
    });
  });

  hasMenuOptions = $derived(
    this.menuToggles.length > 0 ||
      this.menuTabGroups.length > 0 ||
      this.hasVisiblePlaceholders,
  );

  setAssetsManager(manager: AssetsManager) {
    this.assetsManager = manager;
  }
}

export const derivedStore = new DerivedStateStore();
