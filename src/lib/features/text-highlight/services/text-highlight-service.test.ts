import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { textHighlightService } from './text-highlight-service.svelte';

// Mock Svelte 
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

vi.mock('./text-highlight-serializer', () => ({
  deserializeTextHighlights: vi.fn(() => [{ annotation: 'mock', annotationCorner: 'tr' }])
}));

vi.mock('./text-highlight-resolver', () => ({
  resolveDescriptor: vi.fn(() => {
    const range = document.createRange();
    // Mock getBoundingClientRect for Range
    range.getBoundingClientRect = vi.fn(() => ({ top: 0, left: 0, width: 10, height: 10, right: 10, bottom: 10, x: 0, y: 0, toJSON: () => {} }));
    return { range, verified: true };
  })
}));

describe('TextHighlightService', () => {
  let rAFCallbacks: FrameRequestCallback[] = [];
  let rafIdCounter = 0;

  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => {
      rAFCallbacks.push(cb);
      return ++rafIdCounter;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn(() => {
      rAFCallbacks = [];
    }));
    
    document.body.innerHTML = '';
    textHighlightService.clear();
    rAFCallbacks = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts tracking positions with rAF when applied', () => {
    textHighlightService.applyEncoded('mock-encoded');
    
    expect(requestAnimationFrame).toHaveBeenCalled();
    expect(rAFCallbacks.length).toBe(1);
    
    // Simulate a frame
    const cb = rAFCallbacks[0];
    rAFCallbacks = [];
    if (cb) cb(performance.now());
    
    // It should schedule the next frame
    expect(rAFCallbacks.length).toBe(1);
  });

  it('cancels tracking when cleared', () => {
    textHighlightService.applyEncoded('mock-encoded');
    expect(rAFCallbacks.length).toBe(1);
    
    textHighlightService.clear();
    
    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(rAFCallbacks.length).toBe(0);
  });
});
