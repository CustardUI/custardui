import type { AdaptationConfig } from './types';

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
   * @returns The loaded AdaptationConfig, or null if no adaptation is active
   */
  static async init(baseUrl = ''): Promise<AdaptationConfig | null> {
    // 1. Read and remove ?adapt= param via replaceState
    const url = new URL(window.location.href);
    const paramValue = url.searchParams.get('adapt');

    if (paramValue !== null) {
      url.searchParams.delete('adapt');
      history.replaceState({}, '', url.toString());
    }

    // 2. Handle ?adapt=clear
    if (paramValue === 'clear') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // localStorage may be unavailable
      }
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
      try {
        id = localStorage.getItem(STORAGE_KEY);
      } catch {
        // localStorage may be unavailable
      }
    }

    if (!id) return null;

    // 4. Persist namespace
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // localStorage may be unavailable
    }

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
        AdaptationManager.clearStoredId();
        return null;
      }

      config = await response.json();
    } catch (err) {
      console.warn(`[CustomViews] Adaptation "${id}" failed to fetch:`, err, 'Clearing stored adaptation.');
      AdaptationManager.clearStoredId();
      return null;
    }

    // 6. Validate that the config id matches
    if (config.id !== id) {
      console.warn(
        `[CustomViews] Adaptation config ID mismatch: expected "${id}", got "${config.id}". Clearing stored adaptation.`,
      );
      AdaptationManager.clearStoredId();
      return null;
    }

    // 7. Apply theme synchronously (FOUC prevention)
    AdaptationManager.applyTheme(config);

    return config;
  }

  /**
   * Rewrites the URL hash to show the active adaptation namespace.
   * Only runs if location.hash is empty to preserve #cv-open triggers and page anchors.
   *
   * @param id The adaptation namespace/id
   */
  static rewriteHashUrl(id: string): void {
    if (window.location.hash === '') {
      history.replaceState(
        {},
        '',
        window.location.pathname + window.location.search + '#/' + id,
      );
    }
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

  private static clearStoredId(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage may be unavailable
    }
  }
}
