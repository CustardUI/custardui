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
    if (!global.CSS) {
      (global as any).CSS = { escape: (str: string) => str };
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
    it('should clear stored id when ?adapt=clear is passed', async () => {
      mockLocation('http://localhost/?adapt=clear');
      localStorage.setItem('cv-adaptation', 'some-id');
      
      const result = await AdaptationManager.init('');
      
      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('cv-adaptation');
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
      expect(global.fetch).toHaveBeenCalledWith('/url-id/url-id.json');
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
      
      expect(global.fetch).toHaveBeenCalledWith('/meta-id/meta-id.json');
    });

    it('should fall back to localStorage if URL param and meta tag are missing', async () => {
      mockLocation('http://localhost/');
      localStorage.setItem('cv-adaptation', 'storage-id');
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'storage-id', theme: {} })
      });

      await AdaptationManager.init('');
      
      expect(global.fetch).toHaveBeenCalledWith('/storage-id/storage-id.json');
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
      const safeId = encodeURIComponent('id/with/slash');
      expect(global.fetch).toHaveBeenCalledWith(`/base/${safeId}/${safeId}.json`);
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
