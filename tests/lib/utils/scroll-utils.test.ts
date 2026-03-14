// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getScrollTopOffset, 
  captureScrollAnchor, 
  findHighestVisibleElement, 
  restoreScrollAnchor 
} from '../../../src/lib/utils/scroll-utils';

describe('scroll-utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('captureScrollAnchor', () => {
    it('captures the element and its current top position', () => {
      const el = document.createElement('div');
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 150,
      } as DOMRect);

      const anchor = captureScrollAnchor(el);
      expect(anchor.element).toBe(el);
      expect(anchor.top).toBe(150);
    });
  });

  describe('getScrollTopOffset', () => {
    it('returns 0 when no header or custom elements exist', () => {
      expect(getScrollTopOffset()).toBe(0);
    });

    it('returns header height when header is fixed', () => {
      const header = document.createElement('header');
      document.body.appendChild(header);

      const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === header) {
          return { position: 'fixed' } as CSSStyleDeclaration;
        }
        return {} as CSSStyleDeclaration;
      });

      vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
        height: 50,
      } as DOMRect);

      expect(getScrollTopOffset()).toBe(50);
      getComputedStyleSpy.mockRestore();
    });

    it('returns header height when header is sticky', () => {
      const header = document.createElement('header');
      document.body.appendChild(header);

      const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === header) {
          return { position: 'sticky' } as CSSStyleDeclaration;
        }
        return {} as CSSStyleDeclaration;
      });

      vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
        height: 60,
      } as DOMRect);

      expect(getScrollTopOffset()).toBe(60);
      getComputedStyleSpy.mockRestore();
    });

    it('returns 0 when header is static', () => {
      const header = document.createElement('header');
      document.body.appendChild(header);

      const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === header) {
          return { position: 'static' } as CSSStyleDeclaration;
        }
        return {} as CSSStyleDeclaration;
      });

      vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
        height: 60,
      } as DOMRect);

      expect(getScrollTopOffset()).toBe(0);
      getComputedStyleSpy.mockRestore();
    });

    it('returns max of custom elements scrollHeight (assuming overlap)', () => {
      const el1 = document.createElement('div');
      el1.setAttribute('data-cv-scroll-offset', '');
      Object.defineProperty(el1, 'scrollHeight', { configurable: true, value: 30 });
      document.body.appendChild(el1);

      const el2 = document.createElement('div');
      el2.setAttribute('data-cv-scroll-offset', '');
      Object.defineProperty(el2, 'scrollHeight', { configurable: true, value: 20 });
      document.body.appendChild(el2);

      expect(getScrollTopOffset()).toBe(30);
    });

    it('returns max of header height and custom offset (overlap logic)', () => {
      const header = document.createElement('header');
      document.body.appendChild(header);
      const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === header) { return { position: 'fixed' } as CSSStyleDeclaration; }
        return {} as CSSStyleDeclaration;
      });
      vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
        height: 100,
      } as DOMRect);

      const el1 = document.createElement('div');
      el1.setAttribute('data-cv-scroll-offset', '');
      Object.defineProperty(el1, 'scrollHeight', { configurable: true, value: 50 });
      document.body.appendChild(el1);

      expect(getScrollTopOffset()).toBe(100);

      const el2 = document.createElement('div');
      el2.setAttribute('data-cv-scroll-offset', '');
      Object.defineProperty(el2, 'scrollHeight', { configurable: true, value: 120 });
      document.body.appendChild(el2);

      expect(getScrollTopOffset()).toBe(120);
      getComputedStyleSpy.mockRestore();
    });
  });

  describe('findHighestVisibleElement', () => {
    it('returns null if no elements match the selector', () => {
      expect(findHighestVisibleElement('.non-existent')).toBeNull();
    });

    it('returns the highest visible element matching the selector', () => {
      const el1 = document.createElement('div');
      el1.className = 'test-el';
      document.body.appendChild(el1);
      vi.spyOn(el1, 'getBoundingClientRect').mockReturnValue({ top: 200, bottom: 300 } as DOMRect);

      const el2 = document.createElement('div');
      el2.className = 'test-el';
      document.body.appendChild(el2);
      vi.spyOn(el2, 'getBoundingClientRect').mockReturnValue({ top: 100, bottom: 150 } as DOMRect);

      const el3 = document.createElement('div');
      el3.className = 'test-el';
      document.body.appendChild(el3);
      vi.spyOn(el3, 'getBoundingClientRect').mockReturnValue({ top: 300, bottom: 400 } as DOMRect);

      expect(findHighestVisibleElement('.test-el')).toBe(el2);
    });

    it('respects header offset (ignores elements above current viewport top)', () => {
      const header = document.createElement('header');
      document.body.appendChild(header);
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({ position: 'fixed' } as any);
      vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({ height: 100 } as DOMRect);

      // el1 is partially under the header (bottom is 100, offset is 100)
      const el1 = document.createElement('div');
      el1.className = 'test-el';
      document.body.appendChild(el1);
      vi.spyOn(el1, 'getBoundingClientRect').mockReturnValue({ top: 50, bottom: 100 } as DOMRect);

      // el2 is fully visible
      const el2 = document.createElement('div');
      el2.className = 'test-el';
      document.body.appendChild(el2);
      vi.spyOn(el2, 'getBoundingClientRect').mockReturnValue({ top: 150, bottom: 200 } as DOMRect);

      expect(findHighestVisibleElement('.test-el')).toBe(el2);
    });

    it('ignores elements that are inside the sticky/fixed header', () => {
      const header = document.createElement('header');
      document.body.appendChild(header);
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({ position: 'fixed' } as any);
      vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({ height: 100 } as DOMRect);

      const elInHeader = document.createElement('div');
      elInHeader.className = 'test-el';
      header.appendChild(elInHeader);
      // Even if its top is technically visible, it should be ignored because it's IN the header
      vi.spyOn(elInHeader, 'getBoundingClientRect').mockReturnValue({ top: 10, bottom: 40 } as DOMRect);

      const elInContent = document.createElement('div');
      elInContent.className = 'test-el';
      document.body.appendChild(elInContent);
      vi.spyOn(elInContent, 'getBoundingClientRect').mockReturnValue({ top: 200, bottom: 250 } as DOMRect);

      expect(findHighestVisibleElement('.test-el')).toBe(elInContent);
    });
  });

  describe('restoreScrollAnchor', () => {
    it('adjusts scroll if delta is significant after double rAF', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
      
      // Initial position was 100. New position is 150. Delta = 50.
      const anchor = { element: el, top: 100 };
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ top: 150 } as DOMRect);

      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => cb());

      restoreScrollAnchor(anchor);

      expect(scrollBySpy).toHaveBeenCalledWith({ top: 50, behavior: 'instant' });
    });

    it('does nothing if the element is no longer connected to the DOM', () => {
      const el = document.createElement('div');
      // NOT appended to body
      const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
      const anchor = { element: el, top: 100 };
      
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => cb());

      restoreScrollAnchor(anchor);

      expect(scrollBySpy).not.toHaveBeenCalled();
    });

    it('does nothing if the delta is insignificant (<= 1px)', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
      
      const anchor = { element: el, top: 100 };
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ top: 100.5 } as DOMRect);

      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => cb());

      restoreScrollAnchor(anchor);

      expect(scrollBySpy).not.toHaveBeenCalled();
    });
  });
});
