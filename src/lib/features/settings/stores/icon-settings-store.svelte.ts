import type { PersistenceManager } from '$lib/utils/persistence';

const COLLAPSED_KEY = 'cv-settings-icon-collapsed';
const OFFSET_KEY = 'cv-settings-icon-offset';

export const ICON_SETTINGS_CTX = Symbol('icon-settings');

/**
 * Owns all icon UI state (collapsed, vertical offset) with persistence baked in.
 * Constructed by AppRuntime (which owns PersistenceManager) and injected via Svelte context.
 */
export class IconSettingsStore {
  isCollapsed = $state(false);
  offset = $state(0);

  constructor(private persistence: PersistenceManager) {
    const savedCollapsed = persistence.getItem(COLLAPSED_KEY);
    if (savedCollapsed !== null) {
      this.isCollapsed = savedCollapsed === 'true';
    } else if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.isCollapsed = true;
    }

    // Parse offset safely
    const savedOffset = persistence.getItem(OFFSET_KEY);
    if (savedOffset !== null) {
      const parsedOffset = parseFloat(savedOffset);
      if (Number.isFinite(parsedOffset)) {
        this.offset = parsedOffset;
      } else {
        // Corrupted value; clear it out.
        this.offset = 0;
        persistence.removeItem(OFFSET_KEY);
      }
    }
  }

  setCollapsed(value: boolean): void {
    this.isCollapsed = value;
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
