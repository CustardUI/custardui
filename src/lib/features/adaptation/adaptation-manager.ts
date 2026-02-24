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
   * e.g. baseUrl="/customviews", id="ntu" → "/customviews/ntu/ntu.json"
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
    const paramValue = url.searchParams.get(this.QUERY_PARAM);

    // 2. Handle ?adapt=clear
    if (paramValue === 'clear') {
      this.clearStoredId(persistence);
      this.stripQueryParamFromUrl(url);
      return null;
    }

    if (paramValue !== null) {
      // If hash empty, we will populate later with hash indicator, so can remove query param
      if (url.hash === '' || url.hash === this.getHashUrlIndicator(paramValue)) {
        this.stripQueryParamFromUrl(url);
      }
    }

    // 4. Determine namespace: URL param > page meta tag > localStorage
    const id = hashMatch ?? paramValue ?? this.getMetaAdaptationId() ?? persistence.getItem(STORAGE_KEY);
    if (!id) return null;

    // 5. Persist namespace
    persistence.setItem(STORAGE_KEY, id);

    // 6. Fetch adaptation config and validate
    const config = await this.loadAdaptationConfig(baseUrl, id, persistence);
    if (!config) return null;

    // 7. Apply theme synchronously (FOUC prevention)
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
    
    if (url.hash === targetHash) return;

    if (url.hash === '') {
      url.hash = targetHash;
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


  private static getHashAdaptationId(hash: string): string | null {
    return hash.startsWith(this.HASH_PREFIX) ? hash.slice(this.HASH_PREFIX.length) : null;
  }

  private static getHashUrlIndicator(id: string): string {
    return `${this.HASH_PREFIX}${id}`;
  }

  /**
   * Meta tag is in the form <meta name="cv-adapt" content="{id}">
   * @returns 
   */
  private static getMetaAdaptationId(): string | null {
    return (document.querySelector('meta[name="cv-adapt"]') as HTMLMetaElement | null)?.content || null;
  }

  private static stripQueryParamFromUrl(url: URL): void {
    url.searchParams.delete(this.QUERY_PARAM);
    history.replaceState({}, '', url.toString());
  }

  private static async loadAdaptationConfig(
    baseUrl: string,
    id: string,
    persistence: PersistenceManager
  ): Promise<AdaptationConfig | null> {
    try {
      // remove trailing slash from baseUrl/ if present
      const base = baseUrl ? baseUrl.replace(/\/$/, '') : '';
      const safeId = encodeURIComponent(id);
      const fetchUrl = `${base}/${safeId}/${safeId}.json`;
      const response = await fetch(fetchUrl);

      if (!response.ok) {
        console.warn(
          `[CustomViews] Adaptation "${id}" could not be loaded (HTTP ${response.status}). Clearing stored adaptation.`,
        );
        this.clearStoredId(persistence);
        return null;
      }

      const config: AdaptationConfig = await response.json();

      if (config.id !== id) {
        console.warn(
          `[CustomViews] Adaptation config ID mismatch: expected "${id}", got "${config.id}". Clearing stored adaptation.`,
        );
        this.clearStoredId(persistence);
        return null;
      }

      return config;
    } catch (err) {
      console.warn(`[CustomViews] Adaptation "${id}" failed to fetch:`, err, 'Clearing stored adaptation.');
      this.clearStoredId(persistence);
      return null;
    }
  }

}
