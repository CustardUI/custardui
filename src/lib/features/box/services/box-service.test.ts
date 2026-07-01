import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BoxService, BODY_BOX_CLASS } from './box-service.svelte';

// Mocking dependencies
vi.mock('svelte', async (importOriginal) => {
  const actual = await importOriginal<object>();
  return {
    ...actual,
    mount: vi.fn(() => ({})),
    unmount: vi.fn(),
  };
});
vi.mock('$features/notifications/stores/toast-store.svelte', () => ({
  showToast: vi.fn(),
}));
vi.mock('$features/focus/stores/focus-store.svelte', () => ({
  focusStore: { setIsActive: vi.fn() },
}));
vi.mock('$lib/stores/active-state-store.svelte', () => ({
  activeStateStore: { state: { shownToggles: [], peekToggles: [] }, setToggles: vi.fn() },
}));
vi.mock('$lib/stores/derived-store.svelte', () => ({
  derivedStore: { hiddenToggleIds: [] },
}));
vi.mock('$features/anchor', () => ({
  deserialize: vi.fn((encoded) => (encoded ? [{ id: 'mock' }] : [])),
  resolve: vi.fn(() => [document.createElement('div')]),
}));

describe('BoxService', () => {
  let service: BoxService;
  let rAFCallbacks: FrameRequestCallback[] = [];
  let rafIdCounter = 0;
  
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => {
      rAFCallbacks.push(cb);
      return ++rafIdCounter;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn(() => {
      rAFCallbacks = []; // Simplified for testing
    }));
    vi.stubGlobal('scrollTo', vi.fn());
    
    document.body.innerHTML = '';
    service = new BoxService();
    rAFCallbacks = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts tracking positions with rAF when applyEncodedBoxes is called', () => {
    service.applyEncodedBoxes('mock-encoded-string');
    
    // rAF should be scheduled
    expect(requestAnimationFrame).toHaveBeenCalled();
    expect(rAFCallbacks.length).toBe(1);
    
    // Simulate a frame
    const cb = rAFCallbacks[0];
    rAFCallbacks = [];
    if (cb) cb(performance.now());
    
    // It should schedule the next frame
    expect(rAFCallbacks.length).toBe(1);
  });

  it('cancels tracking when exit is called', () => {
    service.applyEncodedBoxes('mock-encoded-string');
    expect(rAFCallbacks.length).toBe(1);
    
    service.exit();
    
    expect(cancelAnimationFrame).toHaveBeenCalled();
    // No new rAF should be scheduled after exit
    expect(document.body.classList.contains(BODY_BOX_CLASS)).toBe(false);
  });
});
