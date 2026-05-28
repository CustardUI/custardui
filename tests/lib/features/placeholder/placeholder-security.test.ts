// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PlaceholderBinder } from '../../../../src/lib/features/placeholder/placeholder-binder';

// Mock element store
vi.mock('../../../../src/lib/stores/element-store.svelte', () => {
  return {
    elementStore: {
      registerPlaceholder: vi.fn(),
    },
  };
});

// Mock the store BEFORE importing the subject under test
vi.mock('../../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte', () => {
  return {
    placeholderRegistryStore: {
      definitions: [],
      register: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
    },
  };
});

describe('PlaceholderBinder - Security', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  describe('Security — dangerous protocol blocking in href/src', () => {
    it('blocks javascript: in a standalone href placeholder', () => {
      container.innerHTML = '<a href="[[url]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ url: 'javascript:alert(1)' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('');
    });

    it('blocks javascript: (uppercase) in href', () => {
      container.innerHTML = '<a href="[[url]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ url: 'JAVASCRIPT:alert(1)' });

      expect(container.querySelector('a')!.getAttribute('href')).toBe('');
    });

    it('blocks javascript: with leading whitespace in href', () => {
      container.innerHTML = '<a href="[[url]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ url: '  javascript:alert(1)' });

      expect(container.querySelector('a')!.getAttribute('href')).toBe('');
    });

    it('blocks vbscript: in href', () => {
      container.innerHTML = '<a href="[[url]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ url: 'vbscript:MsgBox(1)' });

      expect(container.querySelector('a')!.getAttribute('href')).toBe('');
    });

    it('blocks javascript: in a standalone src placeholder', () => {
      container.innerHTML = '<img src="[[imgurl]]" class="cv-bind" />';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ imgurl: 'javascript:void(0)' });

      expect(container.querySelector('img')!.getAttribute('src')).toBe('');
    });

    it('does NOT block legitimate data: URIs (e.g. base64 images) in src', () => {
      container.innerHTML = '<img src="[[dataurl]]" class="cv-bind" />';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ dataurl: 'data:image/png;base64,iVBORw0KGgo=' });

      expect(container.querySelector('img')!.getAttribute('src')).toBe(
        'data:image/png;base64,iVBORw0KGgo=',
      );
    });

    it('does NOT block https: URLs in href', () => {
      container.innerHTML = '<a href="[[url]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ url: 'https://example.com' });

      expect(container.querySelector('a')!.getAttribute('href')).toBe('https://example.com');
    });

    it('does NOT affect non-URL attributes (data-value)', () => {
      container.innerHTML = '<div data-value="[[val]]" class="cv-bind"></div>';
      PlaceholderBinder.scanAndHydrate(container);

      // javascript: in a non-href/src attribute is passed through (not a URL context)
      PlaceholderBinder.updateAll({ val: 'javascript:alert(1)' });

      expect(container.querySelector('div')!.getAttribute('data-value')).toBe(
        'javascript:alert(1)',
      );
    });

    it('blocks javascript: in the conditional [[name ? t : f]] if-set path for href', () => {
      container.innerHTML = '<a href="[[url ? $ : #]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ url: 'javascript:alert(1)' });

      // The if-set template is "[[url ? $ : #]]" — when url is set, $ is substituted.
      // isDangerousProtocol fires on the resolved val before substitution, returns ''
      expect(container.querySelector('a')!.getAttribute('href')).toBe('');
    });

    it('blocks dangerous protocol assembled partially from template prefix and placeholder value (e.g. java[[scheme]])', () => {
      container.innerHTML = '<a href="java[[scheme]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ scheme: 'script:alert(1)' });

      // Fully assembled value is "javascript:alert(1)" which should be blocked and set to empty string
      expect(container.querySelector('a')!.getAttribute('href')).toBe('');
    });

    it('blocks dangerous protocols with embedded control characters or whitespaces', () => {
      container.innerHTML = '<a href="[[url]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ url: 'java\tscript:alert(1)' });
      expect(container.querySelector('a')!.getAttribute('href')).toBe('');

      PlaceholderBinder.updateAll({ url: 'java\nscript:alert(1)' });
      expect(container.querySelector('a')!.getAttribute('href')).toBe('');

      PlaceholderBinder.updateAll({ url: 'java\x01script:alert(1)' });
      expect(container.querySelector('a')!.getAttribute('href')).toBe('');
    });

    it('blocks dangerous protocols in namespaced SVG xlink:href attributes', () => {
      container.innerHTML = '<svg><use xlink:href="[[url]]" class="cv-bind"></use></svg>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ url: 'javascript:alert(1)' });
      expect(container.querySelector('use')!.getAttribute('xlink:href')).toBe('');
    });

    it('blocks dangerous protocols in formaction attributes', () => {
      container.innerHTML = '<button formaction="[[url]]" class="cv-bind">Go</button>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ url: 'javascript:alert(1)' });
      expect(container.querySelector('button')!.getAttribute('formaction')).toBe('');
    });
  });

  describe('Security — dangerous protocol blocking does not affect template text', () => {
    it('does not strip javascript: from plain text nodes (no cv-bind)', () => {
      container.innerHTML = '<p>Click [[label]]</p>';
      PlaceholderBinder.scanAndHydrate(container);

      // Text nodes use {value} not href/src — no protocol filtering applied
      // Placeholder component renders the text, not setAttribute; this just checks scan works
      const el = container.querySelector('cv-placeholder') as HTMLElement;
      expect(el).not.toBeNull();
      expect(el.getAttribute('name')).toBe('label');
    });
  });

  describe('Security — event handler attribute blocking (on*)', () => {
    it('does NOT register onclick as an attribute template', () => {
      container.innerHTML = '<button onclick="[[payload]]" class="cv-bind">Click</button>';
      PlaceholderBinder.scanAndHydrate(container);

      const btn = container.querySelector('button')!;
      // Template should not have been stored for onclick
      expect(btn.dataset.cvAttrTemplates).toBeUndefined();
    });

    it('does NOT update onclick even after updateAll', () => {
      container.innerHTML = '<button onclick="[[payload]]" class="cv-bind">Click</button>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({ payload: 'alert(1)' });

      const btn = container.querySelector('button')!;
      // The original attribute value must remain unchanged (not replaced with the payload)
      expect(btn.getAttribute('onclick')).toBe('[[payload]]');
    });

    it('blocks onerror on an img', () => {
      container.innerHTML = '<img src="x.png" onerror="[[payload]]" class="cv-bind">';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({ payload: 'alert(1)' });

      expect(container.querySelector('img')!.getAttribute('onerror')).toBe('[[payload]]');
    });

    it('blocks onmouseover (case-insensitive ONMOUSEOVER)', () => {
      container.innerHTML = '<span ONMOUSEOVER="[[payload]]" class="cv-bind">Hover</span>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({ payload: 'alert(1)' });

      const span = container.querySelector('span')!;
      // HTML parser lowercases attribute names
      expect(span.getAttribute('onmouseover')).toBe('[[payload]]');
    });

    it('emits a console.warn when an on* attribute contains a placeholder', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      container.innerHTML = '<button onclick="[[payload]]" class="cv-bind">Click</button>';
      PlaceholderBinder.scanAndHydrate(container);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('onclick'));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('blocked for security'));
    });

    it('does NOT warn when an on* attribute has no placeholder (plain handler)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      container.innerHTML = '<button onclick="doSomething()" class="cv-bind">Click</button>';
      PlaceholderBinder.scanAndHydrate(container);

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('still binds safe non-on* attributes on the same element', () => {
      container.innerHTML =
        '<a href="https://github.com/[[username]]" onclick="[[payload]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({ username: 'alice', payload: 'alert(1)' });

      const a = container.querySelector('a')!;
      // href is updated, onclick is left alone
      expect(a.getAttribute('href')).toBe('https://github.com/alice');
      expect(a.getAttribute('onclick')).toBe('[[payload]]');
    });
  });
});
