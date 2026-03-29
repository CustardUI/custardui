import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { ColorSchemeStore } from '../../../src/lib/stores/color-scheme-store.svelte';

// ---------------------------------------------------------------------------
// matchMedia factory
// ---------------------------------------------------------------------------

function makeMockMQ(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];

  const mq = {
    matches,
    addEventListener: vi.fn((_type: string, handler: (e: MediaQueryListEvent) => void) => {
      listeners.push(handler);
    }),
    removeEventListener: vi.fn((_type: string, handler: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(handler);
      if (idx !== -1) listeners.splice(idx, 1);
    }),
    /** Simulate the OS preference flipping. */
    emit(newMatches: boolean) {
      listeners.forEach((fn) => fn({ matches: newMatches } as MediaQueryListEvent));
    },
    get listenerCount() {
      return listeners.length;
    },
  };

  return mq;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ColorSchemeStore', () => {
  let store: ColorSchemeStore;

  beforeEach(() => {
    store = new ColorSchemeStore();
  });

  afterEach(() => {
    store.destroy();
    vi.restoreAllMocks();
  });

  // -- init('light') ---------------------------------------------------------

  describe("init('light')", () => {
    it('sets isDark to false', () => {
      store.init('light');
      expect(store.isDark).toBe(false);
    });

    it('is the default when no argument is passed', () => {
      store.init();
      expect(store.isDark).toBe(false);
    });
  });

  // -- init('dark') ----------------------------------------------------------

  describe("init('dark')", () => {
    it('sets isDark to true', () => {
      store.init('dark');
      expect(store.isDark).toBe(true);
    });
  });

  // -- init('auto') — matchMedia unavailable ---------------------------------

  describe("init('auto') without matchMedia", () => {
    it('defaults to light when window is undefined', () => {
      const original = globalThis.window;
      // @ts-expect-error — intentionally remove window
      delete globalThis.window;
      store.init('auto');
      expect(store.isDark).toBe(false);
      globalThis.window = original;
    });

    it('defaults to light when matchMedia is not a function', () => {
      const original = window.matchMedia;
      Object.defineProperty(window, 'matchMedia', { value: undefined, configurable: true, writable: true });
      store.init('auto');
      expect(store.isDark).toBe(false);
      Object.defineProperty(window, 'matchMedia', { value: original, configurable: true, writable: true });
    });
  });

  // -- init('auto') — matchMedia available -----------------------------------

  describe("init('auto') with matchMedia", () => {
    it('reads initial dark preference', () => {
      const mq = makeMockMQ(true);
      vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList);

      store.init('auto');

      expect(store.isDark).toBe(true);
    });

    it('reads initial light preference', () => {
      const mq = makeMockMQ(false);
      vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList);

      store.init('auto');

      expect(store.isDark).toBe(false);
    });

    it('attaches exactly one change listener', () => {
      const mq = makeMockMQ(false);
      vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList);

      store.init('auto');

      expect(mq.addEventListener).toHaveBeenCalledOnce();
      expect(mq.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mq.listenerCount).toBe(1);
    });

    it('updates isDark when OS preference changes to dark', () => {
      const mq = makeMockMQ(false);
      vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList);

      store.init('auto');
      mq.emit(true);

      expect(store.isDark).toBe(true);
    });

    it('updates isDark when OS preference changes to light', () => {
      const mq = makeMockMQ(true);
      vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList);

      store.init('auto');
      mq.emit(false);

      expect(store.isDark).toBe(false);
    });
  });

  // -- listener cleanup ------------------------------------------------------

  describe('listener cleanup', () => {
    it('removes the previous listener before attaching a new one on re-init', () => {
      const mq = makeMockMQ(false);
      vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList);

      store.init('auto');
      expect(mq.listenerCount).toBe(1);

      store.init('auto');
      expect(mq.removeEventListener).toHaveBeenCalledOnce();
      expect(mq.listenerCount).toBe(1); // removed old, added new
    });

    it('removes the listener when switching away from auto', () => {
      const mq = makeMockMQ(false);
      vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList);

      store.init('auto');
      store.init('light');

      expect(mq.removeEventListener).toHaveBeenCalledOnce();
      expect(mq.listenerCount).toBe(0);
    });

    it('stops reacting to OS changes after switching away from auto', () => {
      const mq = makeMockMQ(false);
      vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList);

      store.init('auto');
      store.init('dark'); // isDark = true, listener removed

      mq.emit(false); // should be ignored

      expect(store.isDark).toBe(true);
    });

    it('destroy() removes the active listener', () => {
      const mq = makeMockMQ(true);
      vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList);

      store.init('auto');
      store.destroy();

      expect(mq.removeEventListener).toHaveBeenCalledOnce();
      expect(mq.listenerCount).toBe(0);
    });

    it('destroy() is a no-op when no listener is attached', () => {
      store.init('light');
      expect(() => store.destroy()).not.toThrow();
    });
  });
});
