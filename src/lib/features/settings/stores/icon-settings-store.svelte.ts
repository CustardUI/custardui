import type { PersistenceManager } from '$lib/utils/persistence';

const COLLAPSED_KEY = 'cv-settings-icon-collapsed';
const OFFSET_KEY = 'cv-settings-icon-offset';

export const ICON_SETTINGS_CTX = Symbol('icon-settings');

/**
 * Owns all icon UI state (collapsed, vertical offset) with persistence baked in.
 * Constructed by AppRuntime (which owns PersistenceManager) and injected via Svelte context.
 */
export class IconSettingsStore {
  isPeeking = $state(false);
  offset = $state(0);

  constructor(private persistence: PersistenceManager) {
    const savedCollapsed = persistence.getItem(COLLAPSED_KEY);
    if (savedCollapsed !== null) {
      this.isPeeking = savedCollapsed === 'true';
    } else if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.isPeeking = true;
    }

    const savedOffset = persistence.getItem(OFFSET_KEY);
    if (savedOffset !== null) {
      this.offset = parseFloat(savedOffset);
    }
  }

  setCollapsed(value: boolean): void {
    this.isPeeking = value;
    this.persistence.setItem(COLLAPSED_KEY, value.toString());
  }

  setOffset(value: number): void {
    this.offset = value;
    this.persistence.setItem(OFFSET_KEY, value.toString());
  }

  clearOffset(): void {
    this.offset = 0;
    this.persistence.removeItem(OFFSET_KEY);
  }
}
