import { describe, it, expect, beforeEach } from 'vitest';

import { UIStore } from '../../../src/lib/stores/ui-store.svelte';

describe('UIStore', () => {
    let store: UIStore;

    beforeEach(() => {
        store = new UIStore();
    });

    it('should update uiOptions', () => {
      store.setUIOptions({ showTabGroups: false });
      expect(store.uiOptions.showTabGroups).toBe(false);
      // Check other options remain default
      expect(store.uiOptions.showReset).toBe(true);
    });

    it('should reset uiOptions', () => {
      store.setUIOptions({ showTabGroups: false });
      store.reset();
      expect(store.uiOptions.showTabGroups).toBe(true);
    });
});
