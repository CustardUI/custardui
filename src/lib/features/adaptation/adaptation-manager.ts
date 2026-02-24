import type { AdaptationConfig } from './types';
import { PersistenceManager } from '$lib/utils/persistence';

const STORAGE_KEY = 'cv-adaptation';

/**
 * Manages the lifecycle of site adaptations (multi-tenancy variants).
 * Handles fetching, persisting, and applying adaptation configs.
 */
export class AdaptationManager {
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

    // 1. Read and remove ?adapt= param via replaceState
    const url = new URL(window.location.href);
    const paramValue = url.searchParams.get('adapt');

    if (paramValue !== null) {
      url.searchParams.delete('adapt');
      history.replaceState({}, '', url.toString());
    }

    // 2. Handle ?adapt=clear
    if (paramValue === 'clear') {
      AdaptationManager.clearStoredId(persistence);
      return null;
    }

    // 3. Determine namespace: URL param > page meta tag > localStorage
    //    Page meta tag (<meta name="cv-adapt" content="ntu">) forces the adaptation
    //    for that page regardless of what is stored, enabling per-page theme assignment.
    const metaAdaptor =
      (document.querySelector('meta[name="cv-adapt"]') as HTMLMetaElement | null)?.content ||
      null;

    let id: string | null = paramValue ?? metaAdaptor;
    if (!id) {
      id = persistence.getItem(STORAGE_KEY);
    }

    if (!id) return null;

    // 4. Persist namespace
    persistence.setItem(STORAGE_KEY, id);

    // 5. Fetch adaptation config — co-located with its content at {baseUrl}/{id}/{id}.json
    //    encodeURIComponent prevents path traversal via crafted ?adapt=../secret
    let config: AdaptationConfig;
    try {
      const base = baseUrl ? baseUrl.replace(/\/$/, '') : '';
      const safeId = encodeURIComponent(id);
      const fetchUrl = `${base}/${safeId}/${safeId}.json`;
      const response = await fetch(fetchUrl);

      if (!response.ok) {
        console.warn(
          `[CustomViews] Adaptation "${id}" could not be loaded (HTTP ${response.status}). Clearing stored adaptation.`,
        );
        AdaptationManager.clearStoredId(persistence);
        return null;
      }

      config = await response.json();
    } catch (err) {
      console.warn(`[CustomViews] Adaptation "${id}" failed to fetch:`, err, 'Clearing stored adaptation.');
      AdaptationManager.clearStoredId(persistence);
      return null;
    }

    // 6. Validate that the config id matches
    if (config.id !== id) {
      console.warn(
        `[CustomViews] Adaptation config ID mismatch: expected "${id}", got "${config.id}". Clearing stored adaptation.`,
      );
      AdaptationManager.clearStoredId(persistence);
      return null;
    }

    // 7. Apply theme synchronously (FOUC prevention)
    AdaptationManager.applyTheme(config);

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
   * @param id The adaptation namespace/id
   */
  static rewriteUrlIndicator(id: string): void {
    const url = new URL(window.location.href);

    if (url.hash === '') {
      url.hash = `/${id}`;
    } else {
      // Hash is occupied (page anchor, #cv-open, etc.) 
      // Fall back to query param
      if (url.searchParams.get('adapt') === id) return;
      url.searchParams.set('adapt', id);
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
}
