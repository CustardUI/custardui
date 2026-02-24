import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock svelte/reactivity
vi.mock('svelte/reactivity', () => ({
  SvelteSet: Set,
}));

import { ElementStore } from '../../../src/lib/stores/element-store.svelte';

describe('ElementStore', () => {
    let store: ElementStore;

    beforeEach(() => {
        store = new ElementStore();
    });

    it('should register toggles and update detectedToggles', () => {
      store.registerToggle('t1');
      expect(store.detectedToggles.has('t1')).toBe(true);
      expect(store.detectedToggles.size).toBeGreaterThan(0);
    });

    it('should register tabGroups and update detectedTabGroups', () => {
      store.registerTabGroup('g1');
      expect(store.detectedTabGroups.has('g1')).toBe(true);
      expect(store.detectedTabGroups.size).toBeGreaterThan(0);
    });

    it('should clear registry', () => {
      store.registerToggle('t1');
      store.registerTabGroup('g1');
      store.registerPlaceholder('p1');

      store.clearRegistry();

      expect(store.detectedToggles.size).toBe(0);
      expect(store.detectedTabGroups.size).toBe(0);
      expect(store.detectedPlaceholders.size).toBe(0);
    });
});
