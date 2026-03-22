import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('svelte/reactivity', () => ({
  SvelteMap: Map,
}));

vi.mock('../../../../src/lib/features/labels/label-registry-store.svelte', () => ({
  labelRegistryStore: {
    register: vi.fn(),
    override: vi.fn(),
    get: vi.fn(),
  },
}));

import { labelManager } from '../../../../src/lib/features/labels/label-manager';
import { labelRegistryStore } from '../../../../src/lib/features/labels/label-registry-store.svelte';

describe('labelManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerConfigLabels()', () => {
    it('registers all labels from the config', () => {
      const config = {
        labels: [
          { name: 'optional', value: 'OPTIONAL', color: '#3b82f6' },
          { name: 'key', value: '★ KEY', color: '#ef4444' },
        ],
      };
      labelManager.registerConfigLabels(config);
      expect(labelRegistryStore.register).toHaveBeenCalledTimes(2);
      expect(labelRegistryStore.register).toHaveBeenCalledWith({ name: 'optional', value: 'OPTIONAL', color: '#3b82f6' });
      expect(labelRegistryStore.register).toHaveBeenCalledWith({ name: 'key', value: '★ KEY', color: '#ef4444' });
    });

    it('registers labels that have only name and color (no value)', () => {
      const config = {
        labels: [{ name: 'optional', color: '#3b82f6' }],
      };
      labelManager.registerConfigLabels(config);
      expect(labelRegistryStore.register).toHaveBeenCalledWith({ name: 'optional', color: '#3b82f6' });
    });

    it('is a no-op when labels is empty', () => {
      labelManager.registerConfigLabels({ labels: [] });
      expect(labelRegistryStore.register).not.toHaveBeenCalled();
    });

    it('is a no-op when labels is missing', () => {
      labelManager.registerConfigLabels({});
      expect(labelRegistryStore.register).not.toHaveBeenCalled();
    });
  });

  describe('applyAdaptationOverrides()', () => {
    it('calls override() for each entry in the overrides map', () => {
      labelManager.applyAdaptationOverrides({
        optional: { value: 'COMPULSORY', color: '#ef4444' },
        key: { color: '#000000' },
      });
      expect(labelRegistryStore.override).toHaveBeenCalledTimes(2);
      expect(labelRegistryStore.override).toHaveBeenCalledWith('optional', { value: 'COMPULSORY', color: '#ef4444' });
      expect(labelRegistryStore.override).toHaveBeenCalledWith('key', { color: '#000000' });
    });

    it('is a no-op for an empty overrides map', () => {
      labelManager.applyAdaptationOverrides({});
      expect(labelRegistryStore.override).not.toHaveBeenCalled();
    });
  });
});
