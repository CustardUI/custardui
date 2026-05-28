// @vitest-environment jsdom
/**
 * Security tests for the sanitizeTabHeader() logic used in TabGroup.svelte.
 *
 * sanitizeTabHeader() is defined as a local Svelte function, so we re-implement
 * it here as a pure helper to keep tests free of Svelte component wiring.
 * Any changes to the source function must be mirrored here.
 */
import { describe, it, expect } from 'vitest';
import { sanitizeTabHeader } from '../../../../src/lib/utils/url-utils';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('sanitizeTabHeader()', () => {
  // -------------------------------------------------------------------------
  // Safe rich-text — should pass through untouched
  // -------------------------------------------------------------------------

  describe('safe rich-text pass-through', () => {
    it('passes through plain text', () => {
      expect(sanitizeTabHeader('Overview')).toBe('Overview');
    });

    it('passes through Font Awesome icon markup', () => {
      const html = '<i class="fa fa-home"></i> Home';
      expect(sanitizeTabHeader(html)).toBe(html);
    });

    it('passes through <strong> and <em>', () => {
      const html = '<strong>Bold</strong> and <em>italic</em>';
      expect(sanitizeTabHeader(html)).toBe(html);
    });

    it('passes through <span> with a style attribute', () => {
      const html = '<span style="color: red;">New</span>';
      expect(sanitizeTabHeader(html)).toBe(html);
    });

    it('passes through <a> with a safe https: href', () => {
      const html = '<a href="https://example.com">Link</a>';
      expect(sanitizeTabHeader(html)).toBe(html);
    });

    it('passes through multiple nested safe elements', () => {
      const html = '<span><i class="fa fa-star"></i> <strong>Featured</strong></span>';
      expect(sanitizeTabHeader(html)).toBe(html);
    });

    it('passes through empty string', () => {
      expect(sanitizeTabHeader('')).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // Dangerous element removal
  // -------------------------------------------------------------------------

  describe('dangerous element removal', () => {
    it('removes <script> tags', () => {
      const result = sanitizeTabHeader('<script>alert(1)</script>Tab');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert(1)');
      expect(result).toContain('Tab');
    });

    it('removes <style> tags', () => {
      const result = sanitizeTabHeader('<style>body{display:none}</style>Tab');
      expect(result).not.toContain('<style>');
      expect(result).toContain('Tab');
    });

    it('removes <iframe> tags', () => {
      const result = sanitizeTabHeader('<iframe src="https://evil.com"></iframe>Tab');
      expect(result).not.toContain('<iframe>');
      expect(result).toContain('Tab');
    });

    it('removes <object> tags', () => {
      const result = sanitizeTabHeader('<object data="evil.swf"></object>Tab');
      expect(result).not.toContain('<object>');
      expect(result).toContain('Tab');
    });

    it('removes <embed> tags', () => {
      const result = sanitizeTabHeader('<embed src="evil.swf">Tab');
      expect(result).not.toContain('<embed>');
      expect(result).toContain('Tab');
    });

    it('removes <form> tags', () => {
      const result = sanitizeTabHeader('<form action="//evil.com"><input></form>Tab');
      expect(result).not.toContain('<form>');
      expect(result).toContain('Tab');
    });

    it('removes <link> tags', () => {
      const result = sanitizeTabHeader('<link rel="stylesheet" href="evil.css">Tab');
      expect(result).not.toContain('<link>');
      expect(result).toContain('Tab');
    });
  });

  // -------------------------------------------------------------------------
  // Dangerous attribute stripping
  // -------------------------------------------------------------------------

  describe('event handler attribute stripping', () => {
    it('strips onclick attribute', () => {
      const result = sanitizeTabHeader('<span onclick="alert(1)">Click</span>');
      expect(result).not.toContain('onclick');
      expect(result).toContain('Click');
    });

    it('strips onmouseover attribute', () => {
      const result = sanitizeTabHeader('<img src="x.png" onmouseover="alert(1)">');
      expect(result).not.toContain('onmouseover');
    });

    it('strips onerror attribute', () => {
      const result = sanitizeTabHeader('<img src="x" onerror="alert(1)">');
      expect(result).not.toContain('onerror');
    });

    it('strips on* attributes case-insensitively (ONCLICK)', () => {
      const result = sanitizeTabHeader('<span ONCLICK="alert(1)">x</span>');
      // HTML parser normalises to lowercase, check both
      expect(result.toLowerCase()).not.toContain('onclick');
    });

    it('strips multiple event handlers on the same element', () => {
      const result = sanitizeTabHeader(
        '<a href="https://ok.com" onclick="bad()" onmouseout="also_bad()">Safe</a>',
      );
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onmouseout');
      expect(result).toContain('href="https://ok.com"');
      expect(result).toContain('Safe');
    });
  });

  // -------------------------------------------------------------------------
  // Dangerous protocol stripping in href / src / action
  // -------------------------------------------------------------------------

  describe('dangerous protocol stripping in href/src/action', () => {
    it('strips javascript: href', () => {
      const result = sanitizeTabHeader('<a href="javascript:alert(1)">XSS</a>');
      expect(result).not.toContain('javascript:');
      expect(result).toContain('XSS');
    });

    it('strips javascript: href (uppercase)', () => {
      const result = sanitizeTabHeader('<a href="JAVASCRIPT:alert(1)">XSS</a>');
      expect(result).not.toContain('JAVASCRIPT:');
      expect(result).toContain('XSS');
    });

    it('strips javascript: href with leading whitespace', () => {
      const result = sanitizeTabHeader('<a href="  javascript:alert(1)">XSS</a>');
      expect(result).not.toContain('javascript:');
    });

    it('strips vbscript: href', () => {
      const result = sanitizeTabHeader('<a href="vbscript:MsgBox(1)">XSS</a>');
      expect(result).not.toContain('vbscript:');
    });

    it('strips data: src', () => {
      // data: in src is blocked (unlike in placeholder-binder where data:image is allowed)
      const result = sanitizeTabHeader('<img src="data:text/html,<script>alert(1)</script>">');
      expect(result).not.toContain('data:');
    });

    it('strips javascript: in action attribute', () => {
      const result = sanitizeTabHeader(
        '<form action="javascript:submit()"><button>Go</button></form>',
      );
      // form itself is removed; this just double-checks action is gone too
      expect(result).not.toContain('javascript:');
    });

    it('strips javascript: href containing embedded control characters or whitespace', () => {
      // Browsers normalize/ignore tabs and newlines inside the scheme.
      // So "java\tscript:" and "java\nscript:" resolve to "javascript:"
      const tabResult = sanitizeTabHeader('<a href="java\tscript:alert(1)">XSS</a>');
      expect(tabResult).not.toContain('href=');

      const newlineResult = sanitizeTabHeader('<a href="java\nscript:alert(1)">XSS</a>');
      expect(newlineResult).not.toContain('href=');

      const ctrlCharResult = sanitizeTabHeader('<a href="java\x01script:alert(1)">XSS</a>');
      expect(ctrlCharResult).not.toContain('href=');
    });

    it('preserves safe https: href', () => {
      const result = sanitizeTabHeader('<a href="https://example.com">Safe</a>');
      expect(result).toContain('href="https://example.com"');
    });

    it('preserves safe relative href', () => {
      const result = sanitizeTabHeader('<a href="/page/section">Safe</a>');
      expect(result).toContain('href="/page/section"');
    });
  });
});
