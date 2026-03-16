/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AdaptationManager } from '../../../../src/lib/features/adaptation/adaptation-manager';

describe('AdaptationManager', () => {
  let originalLocation: Location;

  const mockLocation = (url: string) => {
    delete (window as any).location;
    window.location = new URL(url) as any;
  };

  beforeEach(() => {
    // Save original object to restore later
    originalLocation = window.location;
    
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      store[key] = value.toString();
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete store[key];
    });

    // Mock history
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

    // Mock fetch
    global.fetch = vi.fn();

    // Polyfill CSS.escape for jsdom
    if (!(global as any).CSS?.escape) {
      (global as any).CSS = (global as any).CSS || {};
      (global as any).CSS.escape = (str: string) => str;
    }

    // Clear document head and body
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    window.location = originalLocation as any;
    vi.restoreAllMocks();
  });

  describe('init()', () => {
    it('should wipe custardUI-state and cv-tab-navs-visible when ?adapt=clear is passed', async () => {
      mockLocation('http://localhost/?adapt=clear');
      localStorage.setItem('cv-adaptation', 'nus');
      localStorage.setItem('custardUI-state', JSON.stringify({ placeholders: { institutionName: 'NUS Institution' } }));
      localStorage.setItem('cv-tab-navs-visible', 'true');

      const result = await AdaptationManager.init('');

      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('custardUI-state');
      expect(localStorage.removeItem).toHaveBeenCalledWith('cv-tab-navs-visible');
      expect(localStorage.removeItem).toHaveBeenCalledWith('cv-adaptation');
    });

    it('should clear stored id when ?adapt=clear is passed', async () => {
      mockLocation('http://localhost/?adapt=clear');
      localStorage.setItem('cv-adaptation', 'some-id');
      
      const result = await AdaptationManager.init('');
      
      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('cv-adaptation');
      // Should remove ?adapt=clear
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost/'
      );
    });

    it('should clear stored id and strip hash indicator when ?adapt=clear is passed with a hash', async () => {
      mockLocation('http://localhost/?adapt=clear#/some-id');
      localStorage.setItem('cv-adaptation', 'some-id');
      
      const result = await AdaptationManager.init('');
      
      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('cv-adaptation');
      // Should clear the hash first
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost/?adapt=clear'
      );
      // Then strip the clear param
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost/'
      );
    });

    it('should gracefully handle fetch failure', async () => {
      mockLocation('http://localhost/?adapt=fail-id');
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await AdaptationManager.init('/docs');
      
      expect(global.fetch).toHaveBeenCalledWith('http://localhost/docs/fail-id/fail-id.json');
      expect(localStorage.removeItem).toHaveBeenCalledWith('cv-adaptation');
    });

    it('should clear stored id and remove hash when ?adapt=clear with hash indicator is passed', async () => {
      mockLocation('http://localhost/?adapt=clear#/some-id');
      localStorage.setItem('cv-adaptation', 'some-id');
      const result = await AdaptationManager.init('');
      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('cv-adaptation');
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost/'
      );
    });

    it('should remove ?adapt param from URL and replace history', async () => {
      mockLocation('http://localhost/?adapt=ntu');
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'ntu', theme: {} })
      });

      await AdaptationManager.init('');

      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost/'
      );
    });

    it('should prioritize URL param over localStorage', async () => {
      mockLocation('http://localhost/?adapt=url-id');
      localStorage.setItem('cv-adaptation', 'storage-id');
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'url-id', theme: {} })
      });

      await AdaptationManager.init('');
      
      expect(localStorage.setItem).toHaveBeenCalledWith('cv-adaptation', 'url-id');
      expect(global.fetch).toHaveBeenCalledWith('http://localhost/url-id/url-id.json');
    });

    it('should prioritize meta tag over localStorage when URL param is missing', async () => {
      mockLocation('http://localhost/');
      localStorage.setItem('cv-adaptation', 'storage-id');
      
      const meta = document.createElement('meta');
      meta.name = 'cv-adapt';
      meta.content = 'meta-id';
      document.head.appendChild(meta);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'meta-id', theme: {} })
      });

      await AdaptationManager.init('');
      
      expect(global.fetch).toHaveBeenCalledWith('http://localhost/meta-id/meta-id.json');
    });

    it('should fall back to localStorage if URL param and meta tag are missing', async () => {
      mockLocation('http://localhost/');
      localStorage.setItem('cv-adaptation', 'storage-id');
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'storage-id', theme: {} })
      });

      await AdaptationManager.init('');
      
      expect(global.fetch).toHaveBeenCalledWith('http://localhost/storage-id/storage-id.json');
    });

    it('should handle root baseUrl correctly', async () => {
      mockLocation('http://localhost/?adapt=id3');
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'id3', theme: {} })
      });

      await AdaptationManager.init('/');
      
      expect(global.fetch).toHaveBeenCalledWith('http://localhost/id3/id3.json');
    });

    it('should return null and clear storage if fetch fails', async () => {
      mockLocation('http://localhost/?adapt=bad-id');
      localStorage.setItem('cv-adaptation', 'bad-id');
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await AdaptationManager.init('');
      
      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('cv-adaptation');
      expect(warnSpy).toHaveBeenCalled();
    });

    it('should return null and clear storage if config ID mismatches', async () => {
      mockLocation('http://localhost/?adapt=expected-id');
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'wrong-id', theme: {} }) // ID mismatch
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await AdaptationManager.init('');
      
      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('cv-adaptation');
      expect(warnSpy).toHaveBeenCalled();
    });

    it('should safely encode baseUrl and ID for fetching JSON', async () => {
      mockLocation('http://localhost/?adapt=id/with/slash');
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'id/with/slash', theme: {} })
      });

      await AdaptationManager.init('/base/');
      
      // Should trim trailing slash on base and encode the ID components
      // Should encode the ID components
      const safeId = encodeURIComponent('id/with/slash');
      expect(global.fetch).toHaveBeenCalledWith(`http://localhost/base/${safeId}/${safeId}.json`);
    });

    it('should use provided storageKey prefix for persistence', async () => {
      mockLocation('http://localhost/?adapt=prefix-id');
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'prefix-id', theme: {} })
      });

      await AdaptationManager.init('', 'my-prefix');
      
      expect(localStorage.setItem).toHaveBeenCalledWith('my-prefix-cv-adaptation', 'prefix-id');
    });

    it('should ignore empty adaptation IDs to prevent malformed fetches', async () => {
      mockLocation('http://localhost/?adapt=   ');
      
      const result = await AdaptationManager.init('/base');
      
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should correctly decode URI components when extracting from URL hash', async () => {
      mockLocation('http://localhost/#/my%20special%20id');
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'my special id', theme: {} })
      });

      const result = await AdaptationManager.init('');
      
      expect(result).toEqual({ id: 'my special id', theme: {} });
      // The fetch logic encodes it again when building the final URL path
      // my%20special%20id -> my%20special%20id
      expect(global.fetch).toHaveBeenCalledWith('http://localhost/my%20special%20id/my%20special%20id.json');
      expect(localStorage.setItem).toHaveBeenCalledWith('cv-adaptation', 'my special id');
    });

    it('should successfully match decoded query params against encoded url hashes for cleanup', async () => {
      // url.hash will natively return '#/my%20special%20id'
      mockLocation('http://localhost/?adapt=my%20special%20id#/my%20special%20id');
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'my special id', theme: {} })
      });

      const result = await AdaptationManager.init('');
      
      expect(result).toEqual({ id: 'my special id', theme: {} });
      // Because query param and hash matched, it should only strip the query param
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost/#/my%20special%20id'
      );
    });

    it('should extract adaptation ID from hash indicator', async () => {
      mockLocation('http://localhost/#/hash-id');
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'hash-id', theme: {} })
      });

      const result = await AdaptationManager.init('');
      
      expect(result).toEqual({ id: 'hash-id', theme: {} });
      expect(global.fetch).toHaveBeenCalledWith('http://localhost/hash-id/hash-id.json');
    });

    it('should prioritize explicit ?adapt parameter over a stale hash indicator and clear the stale hash', async () => {
      mockLocation('http://localhost/?adapt=new-id#/stale-id');
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'new-id', theme: {} })
      });

      const result = await AdaptationManager.init('');
      
      expect(result).toEqual({ id: 'new-id', theme: {} });
      expect(global.fetch).toHaveBeenCalledWith('http://localhost/new-id/new-id.json');
      // Should have replaced the history to strip the stale hash
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost/?adapt=new-id'
      );
    });

    it('should preserve ?adapt parameter during init if hash is occupied by something else', async () => {
      mockLocation('http://localhost/?adapt=test-id#other-anchor');
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test-id', theme: {} })
      });

      await AdaptationManager.init('');
      
      expect(window.history.replaceState).not.toHaveBeenCalled();
    });
  });

  describe('rewriteUrlIndicator()', () => {
    it('should set hash to /{id} when hash is empty', () => {
      mockLocation('http://localhost/page');
      
      AdaptationManager.rewriteUrlIndicator('test-id');
      
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost/page#/test-id'
      );
    });

    it('should set ?adapt={id} when hash is already occupied', () => {
      mockLocation('http://localhost/page#existing-anchor');
      
      AdaptationManager.rewriteUrlIndicator('test-id');
      
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost/page?adapt=test-id#existing-anchor'
      );
    });
    
    it('should not update if ?adapt={id} is already correctly set with a hash', () => {
      mockLocation('http://localhost/page?adapt=test-id#existing-anchor');
      
      AdaptationManager.rewriteUrlIndicator('test-id');
      
      expect(window.history.replaceState).not.toHaveBeenCalled();
    });
  });

  describe('applyTheme()', () => {
    it('should inject CSS variables onto documentElement', async () => {
      mockLocation('http://localhost/?adapt=theme-id');
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'theme-id',
          theme: {
            cssVariables: {
              '--bg-color': 'red',
              '--text-color': 'blue'
            }
          }
        })
      });

      await AdaptationManager.init();
      
      expect(document.documentElement.style.getPropertyValue('--bg-color')).toBe('red');
      expect(document.documentElement.style.getPropertyValue('--text-color')).toBe('blue');
    });

    it('should inject CSS file idempotently', async () => {
      mockLocation('http://localhost/?adapt=css-id');
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'css-id',
          theme: {
            cssFile: '/path/to/theme.css'
          }
        })
      });

      await AdaptationManager.init();
      
      const links = document.querySelectorAll('link[data-cv-adaptation-id="css-id"]');
      expect(links.length).toBe(1);
      expect((links[0] as HTMLLinkElement).href).toContain('/path/to/theme.css');
      
      // Try again and ensure it doesn't duplicate
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'css-id',
          theme: {
            cssFile: '/path/to/theme.css'
          }
        })
      });
      await AdaptationManager.init();
      
      expect(document.querySelectorAll('link[data-cv-adaptation-id="css-id"]').length).toBe(1);
    });
  });
});
