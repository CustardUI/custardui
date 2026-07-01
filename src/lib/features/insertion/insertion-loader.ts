import type { AdaptationConfig } from '$features/adaptation/types';
import type { InsertionMap } from './types';

const DEFAULT_INSERTIONS_FILENAME = 'insertions.html';

/**
 * Fetches and parses the adopter-provided insertions file for the active adaptation.
 *
 * The file is resolved as:
 *   `{baseUrl}/{adaptationsPath}/{id}/{insertionsFile}`
 *
 * where `insertionsFile` defaults to `insertions.html` but can be overridden via
 * `adaptationConfig.insertionsFile`.
 *
 * The file is expected to contain zero or more `<div id="...">` elements. Each div's
 * `id` becomes the insertion key and its `innerHTML` the insertion content.
 *
 * Example `insertions.html`:
 * ```html
 * <div id="lesson1-preamble">
 *   <p>NUS students: complete this before your tutorial.</p>
 * </div>
 * ```
 */
export class InsertionLoader {
  /**
   * Loads and parses the insertions file for the given adaptation config.
   *
   * @param baseUrl      The site's base URL (from `data-base-url`, default `''`)
   * @param config       The active AdaptationConfig, or `null` if no adaptation is active
   * @param adaptationsPath  Subfolder under baseUrl where adaptation folders live (default `'versions'`)
   * @returns            Parsed InsertionMap, or `null` if no adaptation is active or the file
   *                     could not be fetched (404, network error, etc.)
   */
  static async init(
    baseUrl = '',
    config: AdaptationConfig | null,
    adaptationsPath = 'versions',
  ): Promise<InsertionMap | null> {
    if (!config) return null;

    const filename = (config.insertionsFile ?? DEFAULT_INSERTIONS_FILENAME).trim();
    if (!filename) return null;

    const url = this.buildUrl(baseUrl, adaptationsPath, config.id, filename);
    if (!url) return null;

    return this.fetchAndParse(url, config.id);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private static buildUrl(
    baseUrl: string,
    adaptationsPath: string,
    id: string,
    filename: string,
  ): string | null {
    try {
      const safeId = encodeURIComponent(id.trim());
      const normalizedPath = adaptationsPath.trim().replace(/^\/+|\/+$/g, '');
      const safePath = normalizedPath ? `${normalizedPath}/` : '';
      const filePath = `${safePath}${safeId}/${filename}`;

      // Mirror the same URL resolution used in AdaptationManager.loadAdaptationConfig
      const directoryBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      return new URL(filePath, new URL(directoryBase, window.location.origin)).toString();
    } catch {
      return null;
    }
  }

  private static async fetchAndParse(url: string, id: string): Promise<InsertionMap | null> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status !== 404) {
          // 404 is expected when no insertions file exists — only log unexpected errors
          console.warn(
            `[CustardUI] Insertions file for adaptation "${id}" could not be loaded (HTTP ${response.status}).`,
          );
        }
        return null;
      }

      const html = await response.text();
      return this.parseInsertions(html);
    } catch (err) {
      console.warn(`[CustardUI] Failed to fetch insertions for adaptation "${id}":`, err);
      return null;
    }
  }

  /**
   * Parses an HTML string and extracts `<div id="...">` blocks into an InsertionMap.
   * Uses the browser's `DOMParser` for safe, standards-compliant parsing.
   */
  private static parseInsertions(html: string): InsertionMap {
    const map: InsertionMap = {};

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const divs = doc.querySelectorAll('div[id]');

      divs.forEach((div) => {
        const insertionId = div.id;
        if (insertionId) {
          const colorAttr = div.getAttribute('color');
          const alignAttr = div.getAttribute('align');
          const outlineAttr = div.getAttribute('outline');
          map[insertionId] = {
            content: div.innerHTML,
            ...(colorAttr ? { color: colorAttr } : {}),
            ...(alignAttr ? { align: alignAttr } : {}),
            ...(outlineAttr ? { outline: outlineAttr } : {}),
          };
        }
      });
    } catch (err) {
      console.warn('[CustardUI] Failed to parse insertions HTML:', err);
    }

    return map;
  }
}
