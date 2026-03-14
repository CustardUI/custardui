/**
 * A captured scroll anchor — a snapshot of an element's viewport position before
 * a layout-shifting operation. Pass to `restoreScrollAnchor` afterwards to compensate.
 */
export interface ScrollAnchor {
  element: HTMLElement;
  /** The element's `getBoundingClientRect().top` at capture time. */
  top: number;
}

/**
 * Captures the current viewport-relative position of a given element.
 * Call this *before* a layout-shifting operation, then pass the result to `restoreScrollAnchor`.
 *
 * @param element The element to anchor to.
 * @returns A `ScrollAnchor` snapshot.
 */
export function captureScrollAnchor(element: HTMLElement): ScrollAnchor {
  return { element, top: element.getBoundingClientRect().top };
}

/**
 * Calculates the total height of fixed or sticky elements at the top of the viewport.
 * This includes the standard site header and any custom elements marked with
 * `[data-cv-scroll-offset]`. Used to offset scroll positions so content isn't
 * hidden behind these fixed elements.
 */
export function getScrollTopOffset(): number {
  let headerHeight = 0;
  let customOffset = 0;

  const headerEl = document.querySelector<HTMLElement>('header');
  if (headerEl) {
    const { position } = window.getComputedStyle(headerEl);
    if (position === 'fixed' || position === 'sticky') {
      headerHeight = headerEl.getBoundingClientRect().height;
    }
  }

  // Elements with [data-cv-scroll-offset] are treated as fixed/sticky obstructions at the top.
  // We use scrollHeight to account for elements mid-transition.
  document.querySelectorAll<HTMLElement>('[data-cv-scroll-offset]').forEach((el) => {
    customOffset = Math.max(customOffset, el.scrollHeight);
  });

  // Custom elements overlay the standard header — avoid double-counting.
  return Math.max(headerHeight, customOffset);
}

/**
 * Returns the highest element matching a CSS selector that is visible in the
 * current viewport (below any fixed/sticky header).
 *
 * @param selector CSS selector to match elements.
 * @returns The highest visible matching element, or `null` if none found.
 */
export function findHighestVisibleElement(selector: string): HTMLElement | null {
  const topOffset = getScrollTopOffset();
  const viewportBottom = window.innerHeight;

  const headerEl = document.querySelector('header');

  let best: HTMLElement | null = null;
  let bestTop = Infinity;

  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    // Ignore elements inside a sticky/fixed header
    if (topOffset > 0 && headerEl && el.closest('header') === headerEl) continue;

    const { top, bottom } = el.getBoundingClientRect();
    const isVisible = bottom > topOffset && top < viewportBottom;

    if (isVisible && top < bestTop) {
      best = el;
      bestTop = top;
    }
  }

  return best;
}

/** Function signature for requestAnimationFrame-like schedulers. */
export type FrameScheduler = (callback: FrameRequestCallback) => number;

/** Default implementation with SSR fallback. */
const defaultScheduler: FrameScheduler = (cb) => {
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(cb);
  }
  return setTimeout(() => {
    const now =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
    cb(now);
  }, 16) as unknown as number;
};

/** Internal scheduler. Can be overridden in tests via setFrameScheduler. */
let frameScheduler: FrameScheduler = defaultScheduler;

/**
 * Allows tests to override the frame scheduler used by `restoreScrollAnchor`.
 * Pass `null` to reset to the default implementation.
 */
export function setFrameScheduler(scheduler: FrameScheduler | null): void {
  frameScheduler = scheduler || defaultScheduler;
}

/**
 * Restores the visual scroll position after a layout-shifting operation.
 *
 * Pass a `ScrollAnchor` captured *before* the layout change.
 * Uses two `requestAnimationFrame` ticks to ensure the browser has fully
 * reflowed the page before measuring and correcting.
 *
 * Note: When calling from a Svelte component, prefer using `tick()` before
 * calling this function so Svelte's DOM updates are applied first.
 *
 * @param anchor A `ScrollAnchor` captured before the layout change.
 */
export function restoreScrollAnchor(anchor: ScrollAnchor): void {
  // Double-rAF: first frame commits the paint, second ensures layout is stable.
  frameScheduler(() => {
    frameScheduler(() => {
      // Use isConnected instead of document.contains() — the latter returns false
      // for elements inside Shadow DOM trees, which would silently skip restoration.
      if (!anchor.element.isConnected) return;

      const delta = anchor.element.getBoundingClientRect().top - anchor.top;
      if (Math.abs(delta) > 1) {
        window.scrollBy({ top: delta, behavior: 'instant' });
      }
    });
  });
}
