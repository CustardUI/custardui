import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('svelte/reactivity', () => ({
  SvelteMap: Map,
}));

import { LabelRegistryStore } from '../../../../src/lib/features/labels/label-registry-store.svelte';

describe('LabelRegistryStore', () => {
  let store: LabelRegistryStore;

  beforeEach(() => {
    store = new LabelRegistryStore();
  });

  describe('register()', () => {
    it('stores a label definition with all fields', () => {
      store.register({ name: 'optional', value: 'OPTIONAL', color: '#3b82f6' });
      expect(store.get('optional')).toEqual({ name: 'optional', value: 'OPTIONAL', color: '#3b82f6' });
    });

    it('stores a label definition with only name and color (no value)', () => {
      store.register({ name: 'optional', color: '#3b82f6' });
      const def = store.get('optional');
      expect(def?.name).toBe('optional');
      expect(def?.color).toBe('#3b82f6');
      expect(def?.value).toBeUndefined();
    });

    it('overwrites an existing entry with the same name', () => {
      store.register({ name: 'optional', value: 'OPTIONAL', color: '#3b82f6' });
      store.register({ name: 'optional', value: 'OPT', color: '#000000' });
      expect(store.get('optional')?.value).toBe('OPT');
    });
  });

  describe('get()', () => {
    it('returns the definition for a known name', () => {
      store.register({ name: 'key', value: '★ KEY', color: '#ef4444' });
      expect(store.get('key')?.value).toBe('★ KEY');
    });

    it('returns undefined for an unknown name', () => {
      expect(store.get('unknown')).toBeUndefined();
    });
  });

  describe('override()', () => {
    it('merges value override onto existing definition', () => {
      store.register({ name: 'optional', value: 'OPTIONAL', color: '#3b82f6' });
      store.override('optional', { value: 'COMPULSORY' });
      const def = store.get('optional');
      expect(def?.value).toBe('COMPULSORY');
      expect(def?.color).toBe('#3b82f6'); // unchanged
    });

    it('merges color override onto existing definition', () => {
      store.register({ name: 'optional', value: 'OPTIONAL', color: '#3b82f6' });
      store.override('optional', { color: '#ef4444' });
      const def = store.get('optional');
      expect(def?.color).toBe('#ef4444');
      expect(def?.value).toBe('OPTIONAL'); // unchanged
    });

    it('merges both value and color overrides', () => {
      store.register({ name: 'optional', value: 'OPTIONAL', color: '#3b82f6' });
      store.override('optional', { value: 'COMPULSORY', color: '#ef4444' });
      const def = store.get('optional');
      expect(def?.value).toBe('COMPULSORY');
      expect(def?.color).toBe('#ef4444');
    });

    it('warns and skips for unknown label names', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      store.override('ghost', { value: 'GHOST' });
      expect(store.get('ghost')).toBeUndefined();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('ghost'));
      warnSpy.mockRestore();
    });
  });
});
