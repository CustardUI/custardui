// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PlaceholderBinder } from '../../../../src/lib/features/placeholder/placeholder-binder';
import { elementStore } from '../../../../src/lib/stores/element-store.svelte';
import { placeholderRegistryStore } from '../../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte';

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

// Fix for Svelte modules if needed, but we are importing logic not components.

describe('PlaceholderBinder', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  describe('scanAndHydrate', () => {
    it('should hydrate text nodes with placeholders', () => {
      container.innerHTML = '<p>Hello [[name]]!</p>';
      PlaceholderBinder.scanAndHydrate(container);

      const el = container.querySelector('cv-placeholder') as HTMLElement;
      expect(el).not.toBeNull();
      expect(el.getAttribute('name')).toBe('name');
    });

    it('should handle fallback values', () => {
      container.innerHTML = '<p>Value: [[key : default]]</p>';
      PlaceholderBinder.scanAndHydrate(container);

      const el = container.querySelector('cv-placeholder') as HTMLElement;
      expect(el.getAttribute('name')).toBe('key');
      expect(el.getAttribute('fallback')).toBe('default');
    });

    it('should set empty fallback attribute for [[name : ]] (explicit show-nothing)', () => {
      container.innerHTML = '<p>Value: [[key : ]]</p>';
      PlaceholderBinder.scanAndHydrate(container);

      const el = container.querySelector('cv-placeholder') as HTMLElement;
      expect(el.getAttribute('name')).toBe('key');
      // Attribute must be present (even as empty string) so Placeholder.svelte
      // can distinguish "no fallback" (undefined) from "empty fallback" ('')
      expect(el.hasAttribute('fallback')).toBe(true);
      expect(el.getAttribute('fallback')).toBe('');
    });

    it('should identify attribute bindings via .cv-bind class', () => {
      container.innerHTML = '<a href="https://example.com?q=[[query]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      const a = container.querySelector('a')!;
      expect(a.dataset.cvAttrTemplates).toBeDefined();
      const templates = JSON.parse(a.dataset.cvAttrTemplates!);
      expect(templates.href).toBe('https://example.com?q=[[query]]');
    });

    it('should identify attribute bindings via data-cv-bind attribute', () => {
      container.innerHTML = '<img src="img/[[id]].png" data-cv-bind>';
      PlaceholderBinder.scanAndHydrate(container);

      const img = container.querySelector('img')!;
      expect(img.dataset.cvAttrTemplates).toBeDefined();
    });

    it('should NOT identify attributes on elements without marker', () => {
      container.innerHTML = '<a href="https://example.com/[[id]]">Ignored</a>';
      PlaceholderBinder.scanAndHydrate(container);

      const a = container.querySelector('a')!;
      expect(a.dataset.cvAttrTemplates).toBeUndefined();
    });

    it('should treat escaped placeholders as literal text', () => {
      container.innerHTML = '<p>This is \\[[escaped]] value</p>';
      PlaceholderBinder.scanAndHydrate(container);

      const el = container.querySelector('cv-placeholder');
      expect(el).toBeNull();
      expect(container.textContent).toBe('This is [[escaped]] value');
    });

    it('should NOT register escaped placeholders', () => {
      container.innerHTML = '<p>Raw: \\[[variable]]</p>';

      // Mock store register to verify it's NOT called
      vi.clearAllMocks();

      PlaceholderBinder.scanAndHydrate(container);

      expect(elementStore.registerPlaceholder).not.toHaveBeenCalled();
    });
  });

  describe('updateAll', () => {
    // Note: updateAll no longer updates text nodes directly.
    // Therefore there is no test here for text update.

    it('should update attributes with URI encoding for href', () => {
      container.innerHTML = '<a href="https://search.com?q=[[term]]" class="cv-bind">Search</a>';
      PlaceholderBinder.scanAndHydrate(container); // Setup templates

      // "hello world" -> "hello%20world"
      PlaceholderBinder.updateAll({ term: 'hello world' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('https://search.com?q=hello%20world');
    });

    it('should update attributes WITHOUT encoding for non-url attributes', () => {
      container.innerHTML = '<div data-value="[[val]]" class="cv-bind"></div>';
      PlaceholderBinder.scanAndHydrate(container);

      // "foo bar" -> "foo bar" (no encoding expected for general attrs?)
      // Wait, the code only checks 'href' and 'src' for encoding.
      PlaceholderBinder.updateAll({ val: 'foo bar' });

      const div = container.querySelector('div')!;
      expect(div.getAttribute('data-value')).toBe('foo bar');
    });
  });

  describe('Context-Aware URL Encoding', () => {
    it('should NOT encode full HTTP URLs', () => {
      container.innerHTML = '<a href="[[url]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ url: 'https://example.com/path?query=value' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('https://example.com/path?query=value');
    });

    it('should NOT encode full HTTPS URLs', () => {
      container.innerHTML = '<a href="[[website]]" class="cv-bind">Visit</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ website: 'https://example.com' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('https://example.com');
    });

    it('should NOT encode data URLs', () => {
      container.innerHTML = '<img src="[[dataurl]]" class="cv-bind" />';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ dataurl: 'data:image/png;base64,iVBORw0KGgo=' });

      const img = container.querySelector('img')!;
      expect(img.getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgo=');
    });

    it('should NOT encode relative URLs starting with /', () => {
      container.innerHTML = '<a href="[[path]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ path: '/assets/images/logo.png' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('/assets/images/logo.png');
    });

    it('should NOT encode relative URLs starting with ./', () => {
      container.innerHTML = '<a href="[[relpath]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ relpath: './docs/guide.html' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('./docs/guide.html');
    });

    it('should NOT encode relative URLs starting with ../', () => {
      container.innerHTML = '<a href="[[uppath]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ uppath: '../parent/file.html' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('../parent/file.html');
    });

    it('should encode URL components (query parameters)', () => {
      container.innerHTML = '<a href="https://search.com?q=[[query]]" class="cv-bind">Search</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ query: 'hello world' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('https://search.com?q=hello%20world');
    });

    it('should encode URL components (path segments)', () => {
      container.innerHTML = '<img src="/assets/[[theme]]/logo.png" class="cv-bind" />';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ theme: 'dark mode' });

      const img = container.querySelector('img')!;
      expect(img.getAttribute('src')).toBe('/assets/dark%20mode/logo.png');
    });

    it('should handle FTP URLs', () => {
      container.innerHTML = '<a href="[[ftpurl]]" class="cv-bind">Download</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ ftpurl: 'ftp://files.example.com/downloads/file.zip' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('ftp://files.example.com/downloads/file.zip');
    });

    it('should handle mailto URLs', () => {
      container.innerHTML = '<a href="[[email]]" class="cv-bind">Email</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ email: 'mailto:support@example.com' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('mailto:support@example.com');
    });
    it('should treat an explicit empty fallback as "show nothing" (overrides registry default)', () => {
      vi.mocked(placeholderRegistryStore.get).mockReturnValue({
        name: 'key',
        defaultValue: 'REGISTRY_DEFAULT',
      });

      container.innerHTML = '<div data-value="[[key : ]]" class="cv-bind"></div>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({});

      const div = container.querySelector('div')!;
      // Empty fallback stops resolution — registry default must NOT bleed through
      expect(div.getAttribute('data-value')).toBe('');
    });

    it('should prioritize inline fallback over registry default', () => {
      vi.mocked(placeholderRegistryStore.get).mockReturnValue({
        name: 'key',
        defaultValue: 'REGISTRY_DEFAULT',
      });

      container.innerHTML = '<div data-value="[[key : INLINE_FALLBACK]]" class="cv-bind"></div>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({});

      const div = container.querySelector('div')!;
      expect(div.getAttribute('data-value')).toBe('INLINE_FALLBACK');
    });
  });

  // ===========================================================================
  // resolveUserValue
  // ===========================================================================

  describe('resolveUserValue', () => {
    it('returns the user-set value when present', () => {
      expect(PlaceholderBinder.resolveUserValue('name', { name: 'alice' })).toBe('alice');
    });

    it('returns undefined when the key is absent', () => {
      expect(PlaceholderBinder.resolveUserValue('name', {})).toBeUndefined();
    });

    it('returns undefined when the value is an empty string', () => {
      expect(PlaceholderBinder.resolveUserValue('name', { name: '' })).toBeUndefined();
    });

    it('returns undefined even if a registry defaultValue exists (does not consult registry)', () => {
      vi.mocked(placeholderRegistryStore.get).mockReturnValue({ name: 'name', defaultValue: 'Guest' });
      // resolveUserValue must NOT call the registry — only looks at the values map
      expect(PlaceholderBinder.resolveUserValue('name', {})).toBeUndefined();
    });
  });

  // ===========================================================================
  // Conditional syntax — scanAndHydrate DOM output
  // ===========================================================================

  describe('scanAndHydrate — conditional syntax', () => {
    it('creates cv-placeholder with truthy/falsy attrs for [[name ? t : f]]', () => {
      container.innerHTML = '<p>[[user ? Hello, $! : ]]</p>';
      PlaceholderBinder.scanAndHydrate(container);

      const el = container.querySelector('cv-placeholder') as HTMLElement;
      expect(el).not.toBeNull();
      expect(el.getAttribute('name')).toBe('user');
      expect(el.getAttribute('truthy')).toBe('Hello, $!');
      expect(el.getAttribute('falsy')).toBe('');
    });

    it('does NOT set any-value attribute for plain [[name ? t : f]]', () => {
      container.innerHTML = '<p>[[user ? Hello, $! : ]]</p>';
      PlaceholderBinder.scanAndHydrate(container);

      const el = container.querySelector('cv-placeholder') as HTMLElement;
      expect(el.hasAttribute('any-value')).toBe(false);
    });

    it('sets any-value attribute for [[name* ? t : f]]', () => {
      container.innerHTML = '<p>[[user* ? Hello, $! : ]]</p>';
      PlaceholderBinder.scanAndHydrate(container);

      const el = container.querySelector('cv-placeholder') as HTMLElement;
      expect(el).not.toBeNull();
      expect(el.getAttribute('name')).toBe('user');
      expect(el.hasAttribute('any-value')).toBe(true);
    });

    it('registers the placeholder name (without *) for [[name* ? t : f]]', () => {
      vi.clearAllMocks();
      container.innerHTML = '<p>[[user* ? Hello, $! : ]]</p>';
      PlaceholderBinder.scanAndHydrate(container);

      expect(elementStore.registerPlaceholder).toHaveBeenCalledWith('user');
    });
  });

  // ===========================================================================
  // Conditional syntax — interpolateString (via updateAll on attribute bindings)
  // ===========================================================================

  describe('updateAll — conditional syntax resolution', () => {
    it('[[name ? t : f]] returns falsy when only registry default exists (user-set only)', () => {
      vi.mocked(placeholderRegistryStore.get).mockReturnValue({ name: 'username', defaultValue: 'Guest' });

      container.innerHTML = '<div data-value="[[username ? Hi $! : nobody]]" class="cv-bind"></div>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({});

      const div = container.querySelector('div')!;
      expect(div.getAttribute('data-value')).toBe('nobody');
    });

    it('[[name* ? t : f]] returns truthy with registry default substituted', () => {
      vi.mocked(placeholderRegistryStore.get).mockReturnValue({ name: 'username', defaultValue: 'Guest' });

      container.innerHTML = '<div data-value="[[username* ? Hi $! : nobody]]" class="cv-bind"></div>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({});

      const div = container.querySelector('div')!;
      expect(div.getAttribute('data-value')).toBe('Hi Guest!');
    });

    it('[[name ? t : f]] returns truthy when user has set a value', () => {
      container.innerHTML = '<div data-value="[[username ? Hi $! : nobody]]" class="cv-bind"></div>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({ username: 'alice' });

      const div = container.querySelector('div')!;
      expect(div.getAttribute('data-value')).toBe('Hi alice!');
    });

    it('[[name* ? t : f]] returns truthy when user has set a value', () => {
      container.innerHTML = '<div data-value="[[username* ? Hi $! : nobody]]" class="cv-bind"></div>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({ username: 'alice' });

      const div = container.querySelector('div')!;
      expect(div.getAttribute('data-value')).toBe('Hi alice!');
    });

    it('[[name ? t : f]] returns falsy when neither user value nor registry default exists', () => {
      vi.mocked(placeholderRegistryStore.get).mockReturnValue(undefined);

      container.innerHTML = '<div data-value="[[username ? Hi $! : nobody]]" class="cv-bind"></div>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({});

      const div = container.querySelector('div')!;
      expect(div.getAttribute('data-value')).toBe('nobody');
    });

    it('[[name ? t : f]] ignores empty string user value (treats as unset)', () => {
      container.innerHTML = '<div data-value="[[username ? Hi $! : nobody]]" class="cv-bind"></div>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({ username: '' });

      const div = container.querySelector('div')!;
      expect(div.getAttribute('data-value')).toBe('nobody');
    });

    it('regular [[name]] display is unaffected — still uses registry default', () => {
      vi.mocked(placeholderRegistryStore.get).mockReturnValue({ name: 'username', defaultValue: 'Guest' });

      container.innerHTML = '<div data-value="[[username]]" class="cv-bind"></div>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({});

      const div = container.querySelector('div')!;
      expect(div.getAttribute('data-value')).toBe('Guest');
    });

    it('regular [[name : fallback]] display is unaffected', () => {
      vi.mocked(placeholderRegistryStore.get).mockReturnValue(undefined);

      container.innerHTML = '<div data-value="[[username : default_user]]" class="cv-bind"></div>';
      PlaceholderBinder.scanAndHydrate(container);
      PlaceholderBinder.updateAll({});

      const div = container.querySelector('div')!;
      expect(div.getAttribute('data-value')).toBe('default_user');
    });
  });
});
