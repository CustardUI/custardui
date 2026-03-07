import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IconSettingsStore } from '../../../../../src/lib/features/settings/stores/icon-settings-store.svelte';
import type { PersistenceManager } from '../../../../../src/lib/utils/persistence';

describe('IconSettingsStore', () => {
  let mockPersistence: PersistenceManager;

  beforeEach(() => {
    mockPersistence = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    } as unknown as PersistenceManager;

    // Mock window to simulate mobile view sometimes
    vi.stubGlobal('window', { ...window, innerWidth: 1024 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initializes with default values when storage is empty', () => {
    const store = new IconSettingsStore(mockPersistence);
    
    expect(store.isCollapsed).toBe(false);
    expect(store.offset).toBe(0);
  });

  it('initializes as collapsed on mobile screens by default', () => {
    vi.stubGlobal('window', { ...window, innerWidth: 500 }); // Mobile viewport
    const store = new IconSettingsStore(mockPersistence);
    
    expect(store.isCollapsed).toBe(true);
    expect(store.offset).toBe(0);
  });

  it('initializes from storage if values exist', () => {
    mockPersistence.getItem = vi.fn((key: string) => {
      if (key === 'cv-settings-icon-collapsed') return 'true';
      if (key === 'cv-settings-icon-offset') return '150.5';
      return null;
    });

    const store = new IconSettingsStore(mockPersistence);
    
    expect(store.isCollapsed).toBe(true);
    expect(store.offset).toBe(150.5);
  });

  it('handles corrupted NaN offset gracefully', () => {
    mockPersistence.getItem = vi.fn((key: string) => {
      if (key === 'cv-settings-icon-offset') return 'not-a-number';
      return null;
    });

    const store = new IconSettingsStore(mockPersistence);
    
    expect(store.offset).toBe(0);
    expect(mockPersistence.removeItem).toHaveBeenCalledWith('cv-settings-icon-offset');
  });

  it('updates state and persists when setCollapsed is called', () => {
    const store = new IconSettingsStore(mockPersistence);
    
    store.setCollapsed(true);
    
    expect(store.isCollapsed).toBe(true);
    expect(mockPersistence.setItem).toHaveBeenCalledWith('cv-settings-icon-collapsed', 'true');
    
    store.setCollapsed(false);
    
    expect(store.isCollapsed).toBe(false);
    expect(mockPersistence.setItem).toHaveBeenCalledWith('cv-settings-icon-collapsed', 'false');
  });

  it('updates state and persists when setOffset is called', () => {
    const store = new IconSettingsStore(mockPersistence);
    
    store.setOffset(200);
    
    expect(store.offset).toBe(200);
    expect(mockPersistence.setItem).toHaveBeenCalledWith('cv-settings-icon-offset', '200');
  });

  it('clears offset from state and persistence when clearOffset is called', () => {
    const store = new IconSettingsStore(mockPersistence);
    store.setOffset(200); // Set it first
    
    store.clearOffset();
    
    expect(store.offset).toBe(0);
    expect(mockPersistence.removeItem).toHaveBeenCalledWith('cv-settings-icon-offset');
  });
});
