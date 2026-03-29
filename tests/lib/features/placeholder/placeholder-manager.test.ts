import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PlaceholderManager } from '../../../../src/lib/features/placeholder/placeholder-manager';

vi.mock('../../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte', () => ({
  placeholderRegistryStore: {
    has: vi.fn(),
    register: vi.fn(),
    get: vi.fn(),
  },
}));

import { placeholderRegistryStore } from '../../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte';

describe('PlaceholderManager', () => {
  let manager: PlaceholderManager;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new PlaceholderManager();
    // Spy on console.warn
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('registerConfigPlaceholders', () => {
    it('should register placeholders from config with source "config"', () => {
      const config = {
        placeholders: [{ name: 'p1', defaultValue: 'val1' }],
      };

      manager.registerConfigPlaceholders(config);

      expect(placeholderRegistryStore.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'p1',
          source: 'config',
        })
      );
    });
  });

  describe('registerTabGroupPlaceholders', () => {
    it('should register placeholders from tabGroups with source "tabgroup"', () => {
      const config = {
        tabGroups: [
          {
            groupId: 'g1',
            placeholderId: 'p1',
            tabs: [],
          },
        ],
      };

      // Mock registry.get to return undefined (not existing)
      vi.mocked(placeholderRegistryStore.get).mockReturnValue(undefined);

      manager.registerTabGroupPlaceholders(config);

      expect(placeholderRegistryStore.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'p1',
          source: 'tabgroup',
          ownerTabGroupId: 'g1',
        })
      );
    });

    it('should NOT register if placeholder exists from config', () => {
      const config = {
        tabGroups: [{ groupId: 'g1', placeholderId: 'p1', tabs: [] }],
      };

      // Mock existing config placeholder
      vi.mocked(placeholderRegistryStore.get).mockReturnValue({
        name: 'p1',
        source: 'config',
      });

      manager.registerTabGroupPlaceholders(config);

      expect(placeholderRegistryStore.register).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
    });

    it('should NOT register if placeholder exists from another tabgroup', () => {
      const config = {
        tabGroups: [{ groupId: 'g2', placeholderId: 'p1', tabs: [] }],
      };

      // Mock existing tabgroup placeholder
      vi.mocked(placeholderRegistryStore.get).mockReturnValue({
        name: 'p1',
        source: 'tabgroup',
        ownerTabGroupId: 'g1',
      });

      manager.registerTabGroupPlaceholders(config);

      expect(placeholderRegistryStore.register).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
    });

  });

  describe('calculatePlaceholderFromTabSelected', () => {
    it('should return key and value if tab has placeholderValue', () => {
      const config = {
        tabGroups: [
          {
            groupId: 'g1',
            placeholderId: 'p1',
            tabs: [{ tabId: 't1', placeholderValue: 'v1' }],
          },
        ],
      };

      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);

      const result = manager.calculatePlaceholderFromTabSelected('g1', 't1', config);

      expect(result).toEqual({ key: 'p1', value: 'v1' });
    });

    it('should return empty string if placeholderValue is undefined', () => {
        const config = {
          tabGroups: [
            {
              groupId: 'g1',
              placeholderId: 'p1',
              tabs: [{ tabId: 't1' }],
            },
          ],
        };

        vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);

        const result = manager.calculatePlaceholderFromTabSelected('g1', 't1', config);

        expect(result).toEqual({ key: 'p1', value: '' });
      });
  });

  describe('registerConfigPlaceholders — siteManaged', () => {
    it('forces hiddenFromSettings: true when siteManaged is true', () => {
      manager.registerConfigPlaceholders({
        placeholders: [{ name: 'instName', siteManaged: true }],
      });
      expect(placeholderRegistryStore.register).toHaveBeenCalledWith(
        expect.objectContaining({ hiddenFromSettings: true })
      );
    });

    it('overrides explicit hiddenFromSettings: false when siteManaged: true', () => {
      manager.registerConfigPlaceholders({
        placeholders: [{ name: 'instName', siteManaged: true, hiddenFromSettings: false }],
      });
      expect(placeholderRegistryStore.register).toHaveBeenCalledWith(
        expect.objectContaining({ hiddenFromSettings: true })
      );
    });

    it('preserves hiddenFromSettings when siteManaged is not set', () => {
      manager.registerConfigPlaceholders({
        placeholders: [{ name: 'user', hiddenFromSettings: false }],
      });
      expect(placeholderRegistryStore.register).toHaveBeenCalledWith(
        expect.objectContaining({ hiddenFromSettings: false })
      );
    });
  });

  describe('filterUserSettablePlaceholders', () => {
    it('passes through registered, non-adaptation placeholders', () => {
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);
      vi.mocked(placeholderRegistryStore.get).mockReturnValue({ name: 'user' });

      expect(manager.filterUserSettablePlaceholders({ user: 'Alice' })).toEqual({ user: 'Alice' });
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('silently drops siteManaged: true entries', () => {
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);
      vi.mocked(placeholderRegistryStore.get).mockReturnValue({ name: 'instName', siteManaged: true });

      expect(manager.filterUserSettablePlaceholders({ instName: 'NUS' })).toEqual({});
      expect(warnSpy).not.toHaveBeenCalled(); // silent, not a warning
    });

    it('drops unregistered keys with a warning (via filterValidPlaceholders)', () => {
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(false);

      expect(manager.filterUserSettablePlaceholders({ ghost: 'val' })).toEqual({});
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('"ghost"'));
    });

    it('handles undefined input', () => {
      expect(manager.filterUserSettablePlaceholders(undefined)).toEqual({});
    });

    it('mixed: keeps user-settable, drops adaptation-only', () => {
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);
      vi.mocked(placeholderRegistryStore.get).mockImplementation((key) =>
        key === 'instName'
          ? { name: 'instName', siteManaged: true }
          : { name: key }
      );

      const result = manager.filterUserSettablePlaceholders({ user: 'Alice', instName: 'NUS' });
      expect(result).toEqual({ user: 'Alice' });
      expect(result.instName).toBeUndefined();
    });
  });

  describe('filterValidPlaceholders', () => {
    it('returns values for registered placeholder keys', () => {
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);

      const result = manager.filterValidPlaceholders({ lang: 'Python', os: 'Linux' });

      expect(result).toEqual({ lang: 'Python', os: 'Linux' });
    });

    it('warns and omits unregistered keys', () => {
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(false);

      const result = manager.filterValidPlaceholders({ unknown: 'value' });

      expect(result).toEqual({});
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"unknown"'),
      );
    });

    it('returns empty object when placeholders is undefined', () => {
      const result = manager.filterValidPlaceholders(undefined);

      expect(result).toEqual({});
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns empty object when placeholders is an empty object', () => {
      const result = manager.filterValidPlaceholders({});

      expect(result).toEqual({});
    });

    it('returns registered keys and omits unregistered keys in a mixed state', () => {
      vi.mocked(placeholderRegistryStore.has).mockImplementation((key) => key === 'registered');

      const result = manager.filterValidPlaceholders({ registered: 'yes', unregistered: 'no' });

      expect(result).toEqual({ registered: 'yes' });
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('"unregistered"'));
    });
  });
});
