import { describe, it, expect, beforeEach } from 'vitest';
import { adaptationStore } from '../../../../../src/lib/features/adaptation/stores/adaptation-store.svelte';
import type { AdaptationConfig } from '../../../../../src/lib/features/adaptation/types';

// Polyfill Svelte Runes for testing Svelte 5 $state
// @ts-expect-error - Polyfill for testing
globalThis.$state = (initial) => initial;

describe('AdaptationStore', () => {
  beforeEach(() => {
    // Reset store state
    adaptationStore.init(null);
  });

  it('should initialize with null config', () => {
    expect(adaptationStore.activeConfig).toBeNull();
  });

  it('should store config accurately when init is called', () => {
    const mockConfig: AdaptationConfig = {
      id: 'store-test-id',
      name: 'Test Adaptation',
      theme: {
        cssVariables: { '--color': 'blue' }
      }
    };

    adaptationStore.init(mockConfig);
    
    expect(adaptationStore.activeConfig).toEqual(mockConfig);
    expect(adaptationStore.activeConfig?.id).toBe('store-test-id');
  });

  it('should clear config when initialized with null', () => {
    const mockConfig: AdaptationConfig = { id: 'test' };
    adaptationStore.init(mockConfig);
    expect(adaptationStore.activeConfig).toBeDefined();

    adaptationStore.init(null);
    expect(adaptationStore.activeConfig).toBeNull();
  });
});
