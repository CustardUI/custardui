import type { AdaptationConfig } from './types';
import { PersistenceManager } from '$lib/utils/persistence';

const STORAGE_KEY = 'cv-adaptation';

/**
 * Manages the lifecycle of site adaptations (multi-tenancy variants).
 * Handles fetching, persisting, and applying adaptation configs.
 */
export class AdaptationManager {
  private static readonly QUERY_PARAM = 'adapt';
  private static readonly HASH_PREFIX = '#/';

  /**
   * Initializes adaptation from the URL parameter or localStorage.
   * Must be called before AppRuntime is instantiated so that:
   * - Theme CSS is injected early (FOUC prevention)
   * - ?adapt= param is cleaned before URLStateManager.parseURL() runs
   *
   * Adaptation JSON files are resolved relative to the site's baseUrl:
   *   `{baseUrl}/{id}/{id}.json`
   * e.g. baseUrl="/base", id="nus" → "/base/nus/nus.json"
   *
   * @param baseUrl The site's base URL (from data-base-url, default: '')
   * @param storageKey The project's unique storageKey prefix to use for saving preferences
   * @returns The loaded AdaptationConfig, or null if no adaptation is active
   */
  static async init(baseUrl = '', storageKey?: string): Promise<AdaptationConfig | null> {
    const persistence = new PersistenceManager(storageKey);

    // 1. Read indicators (URL hash first, then ?adapt=)
    const url = new URL(window.location.href);
    const hashMatch = this.getHashAdaptationId(url.hash);
    const queryParamValue = url.searchParams.get(this.QUERY_PARAM);

    // 2. Handle ?adapt=clear
    if (queryParamValue === 'clear') {
      persistence.clearAll();              // wipe custardUI-state and tab nav prefs
      persistence.removeItem(STORAGE_KEY); // wipe the adaptation ID itself
      if (this.hasHashAdaptationId(url.hash)) {
        this.stripHashFromUrl(url);
      }
      this.stripQueryParamFromUrl(url);
      return null;
    }

    // 4. Determine namespace: page meta tag > URL param > Hash Indicator > localStorage
    const rawId = this.getMetaAdaptationId() 
      ?? queryParamValue 
      ?? hashMatch 
      ?? persistence.getItem(STORAGE_KEY);

    const id = typeof rawId === 'string' ? rawId.trim() : rawId;
    if (!id) {
      // Clear any previously stored invalid/empty id to avoid reusing it
      this.clearStoredId(persistence);
      return null;
    }

    // 5. Fetch adaptation config and validate
    const config = await this.loadAdaptationConfig(baseUrl, id, persistence);
    if (!config) {
      this.clearStoredId(persistence);
      return null;
    }

    // 6. Clean URL indicators given valid adaptation
    if (queryParamValue !== null) {
      // If the query param specifies a new adaptation, we should clear any stale hash indicator
      if (this.hasHashAdaptationId(url.hash) && url.hash !== this.getHashUrlIndicator(queryParamValue)) {
        this.stripHashFromUrl(url);
      }
      // If hash empty, or matches query param, populate later with hash indicator, so remove query param
      if (url.hash === '' || url.hash === this.getHashUrlIndicator(queryParamValue)) {
        this.stripQueryParamFromUrl(url);
      }
    }

    // 7. Persist namespace — clear old state if explicitly switching to a different adaptation
    const previousId = persistence.getItem(STORAGE_KEY);
    const isExplicitUrlSwitch = queryParamValue !== null; // ?adapt= was in the URL
    if (isExplicitUrlSwitch && previousId !== null && previousId !== id) {
      persistence.clearAll(); // Remove custardUI-state so new adaptation starts fresh
    }
    persistence.setItem(STORAGE_KEY, id);

    // 8. Apply theme synchronously (FOUC prevention)
    this.applyTheme(config);

    return config;
  }

  /**
   * Adds a visual indicator to the URL bar showing the active adaptation.
   *
   * - Hash free     → append `#/{id}` (clean, no query-string noise)
   * - Hash occupied → set `?adapt={id}` so the indicator survives refreshes;
   *                   init() re-reads and re-applies it each load, and
   *                   rewriteUrlIndicator re-adds it, keeping it stable.
   *
   * Uses replaceState so history is not polluted.
   *
   * @param adaptationId The adaptation namespace/id
   */
  static rewriteUrlIndicator(adaptationId: string): void {
    const url = new URL(window.location.href);
    const targetHash = this.getHashUrlIndicator(adaptationId);

    const hashCorrect = url.hash === targetHash;
    const noStaleParam = !url.searchParams.has(this.QUERY_PARAM);
    if (hashCorrect && noStaleParam) return; // Already in correct state

    if (url.hash === '' || url.hash === targetHash) {
      // Hash is free — use #/id and remove any stale ?adapt= param
      url.hash = targetHash;
      url.searchParams.delete(this.QUERY_PARAM);
    } else {
      // Hash is occupied (page anchor, #cv-open, etc.), use query param
      if (url.searchParams.get(this.QUERY_PARAM) === adaptationId) return;
      url.searchParams.set(this.QUERY_PARAM, adaptationId);
    }

    history.replaceState({}, '', url.toString());
  }

  /**
   * Injects CSS variables and/or a stylesheet link for the adaptation theme.
   * Idempotent: will not add a second <link> tag for the same adaptation.
   */
  private static applyTheme(config: AdaptationConfig): void {
    const theme = config.theme;
    if (!theme) return;

    // Inject CSS variables onto :root
    if (theme.cssVariables) {
      for (const [property, value] of Object.entries(theme.cssVariables)) {
        document.documentElement.style.setProperty(property, value);
      }
    }

    // Append stylesheet link (idempotent)
    if (theme.cssFile) {
      const existing = document.querySelector(
        `link[data-cv-adaptation-id="${CSS.escape(config.id)}"]`,
      );
      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = theme.cssFile;
        link.setAttribute('data-cv-adaptation-id', config.id);
        document.head.appendChild(link);
      }
    }
  }

  private static clearStoredId(persistence: PersistenceManager): void {
    persistence.removeItem(STORAGE_KEY);
  }

  private static hasHashAdaptationId(hash: string): boolean {
    return hash.startsWith(this.HASH_PREFIX);
  }

  private static getHashAdaptationId(hash: string): string | null {
    if (!this.hasHashAdaptationId(hash)) return null;
    const encodedId = hash.slice(this.HASH_PREFIX.length);
    try {
      return decodeURIComponent(encodedId);
    } catch {
      return encodedId; // fallback if malformed encoding
    }
  }

  private static getHashUrlIndicator(id: string): string {
    return `${this.HASH_PREFIX}${encodeURIComponent(id)}`;
  }

  /**
   * Meta tag is in the form <meta name="cv-adapt" content="{id}">
   */
  private static getMetaAdaptationId(): string | null {
    return (document.querySelector('meta[name="cv-adapt"]') as HTMLMetaElement | null)?.content || null;
  }

  private static stripQueryParamFromUrl(url: URL): void {
    url.searchParams.delete(this.QUERY_PARAM);
    history.replaceState({}, '', url.toString());
  }

  private static stripHashFromUrl(url: URL): void {
    url.hash = '';
    history.replaceState({}, '', url.toString());
  }

  private static async loadAdaptationConfig(
    baseUrl: string,
    id: string,
    persistence: PersistenceManager
  ): Promise<AdaptationConfig | null> {
    try {
      if (!id || id.trim() === '') return null;
      const safeId = encodeURIComponent(id.trim());
      const jsonFile = `${safeId}/${safeId}.json`;
      
      // The base must end in a slash for the URL constructor to treat it as a directory.
      // If baseUrl is empty, this falls back to '/', which resolves against window.location.origin.
      const directoryBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      
      const fetchUrl = new URL(jsonFile, new URL(directoryBase, window.location.origin)).toString();
      
      const response = await fetch(fetchUrl);

      if (!response.ok) {
        console.warn(
          `[CustardUI] Adaptation "${id}" could not be loaded (HTTP ${response.status}). Clearing stored adaptation.`,
        );
        this.clearStoredId(persistence);
        return null;
      }

      const config: AdaptationConfig = await response.json();

      if (config.id !== id) {
        console.warn(
          `[CustardUI] Adaptation config ID mismatch: expected "${id}", got "${config.id}". Clearing stored adaptation.`,
        );
        this.clearStoredId(persistence);
        return null;
      }

      return config;
    } catch (err) {
      console.warn(`[CustardUI] Adaptation "${id}" failed to fetch:`, err, 'Clearing stored adaptation.');
      this.clearStoredId(persistence);
      return null;
    }
  }

}
