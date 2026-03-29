import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock svelte/reactivity
vi.mock('svelte/reactivity', () => ({
  SvelteSet: Set,
}));

// Mock placeholder registry store
vi.mock('../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte', () => ({
  placeholderRegistryStore: {
    definitions: [],
  },
}));

// Mock element store
const mockDetectedToggles = new Set<string>();
const mockDetectedTabGroups = new Set<string>();
vi.mock('../../../src/lib/stores/element-store.svelte', () => ({
  elementStore: {
    get detectedToggles() { return mockDetectedToggles; },
    get detectedTabGroups() { return mockDetectedTabGroups; },
    detectedPlaceholders: new Set<string>(),
  },
}));

// Mock active state store
let mockConfig: { toggles?: unknown[]; tabGroups?: unknown[] } = {};
vi.mock('../../../src/lib/stores/active-state-store.svelte', () => ({
  activeStateStore: {
    get config() { return mockConfig; },
    state: { shownToggles: [], peekToggles: [] },
  },
}));

import { DerivedStateStore } from '../../../src/lib/stores/derived-store.svelte';

describe('DerivedStateStore — siteManaged filtering', () => {
  beforeEach(() => {
    mockDetectedToggles.clear();
    mockDetectedTabGroups.clear();
    mockConfig = {};
  });

  describe('menuToggles', () => {
    it('excludes siteManaged toggles', () => {
      mockConfig = {
        toggles: [
          { toggleId: 'managed', siteManaged: true },
          { toggleId: 'normal' },
        ],
      };
      const store = new DerivedStateStore();
      const ids = store.menuToggles.map((t: { toggleId: string }) => t.toggleId);
      expect(ids).not.toContain('managed');
      expect(ids).toContain('normal');
    });

    it('includes non-siteManaged global toggles', () => {
      mockConfig = {
        toggles: [
          { toggleId: 'global', isLocal: false },
        ],
      };
      const store = new DerivedStateStore();
      const ids = store.menuToggles.map((t: { toggleId: string }) => t.toggleId);
      expect(ids).toContain('global');
    });

    it('excludes local toggles not detected in DOM', () => {
      mockConfig = {
        toggles: [
          { toggleId: 'local', isLocal: true },
        ],
      };
      const store = new DerivedStateStore();
      const ids = store.menuToggles.map((t: { toggleId: string }) => t.toggleId);
      expect(ids).not.toContain('local');
    });

    it('includes local toggles that are detected in DOM', () => {
      mockDetectedToggles.add('local');
      mockConfig = {
        toggles: [
          { toggleId: 'local', isLocal: true },
        ],
      };
      const store = new DerivedStateStore();
      const ids = store.menuToggles.map((t: { toggleId: string }) => t.toggleId);
      expect(ids).toContain('local');
    });

    it('excludes siteManaged local toggle even if detected in DOM', () => {
      mockDetectedToggles.add('managed-local');
      mockConfig = {
        toggles: [
          { toggleId: 'managed-local', isLocal: true, siteManaged: true },
        ],
      };
      const store = new DerivedStateStore();
      const ids = store.menuToggles.map((t: { toggleId: string }) => t.toggleId);
      expect(ids).not.toContain('managed-local');
    });
  });

  describe('menuTabGroups', () => {
    it('includes non-siteManaged global tab groups', () => {
      mockConfig = {
        tabGroups: [
          { groupId: 'global', isLocal: false, tabs: [] },
        ],
      };
      const store = new DerivedStateStore();
      const ids = store.menuTabGroups.map((g: { groupId: string }) => g.groupId);
      expect(ids).toContain('global');
    });

    it('excludes local tab groups not detected in DOM', () => {
      mockConfig = {
        tabGroups: [
          { groupId: 'local', isLocal: true, tabs: [] },
        ],
      };
      const store = new DerivedStateStore();
      const ids = store.menuTabGroups.map((g: { groupId: string }) => g.groupId);
      expect(ids).not.toContain('local');
    });

    it('includes local tab groups detected in DOM', () => {
      mockDetectedTabGroups.add('local');
      mockConfig = {
        tabGroups: [
          { groupId: 'local', isLocal: true, tabs: [] },
        ],
      };
      const store = new DerivedStateStore();
      const ids = store.menuTabGroups.map((g: { groupId: string }) => g.groupId);
      expect(ids).toContain('local');
    });

  });
});
