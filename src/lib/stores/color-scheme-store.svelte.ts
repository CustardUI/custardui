/**
 * App-wide store for the site's color scheme preference.
 * 
 * Drives the `data-cv-theme` attribute on `<html>` (via UIRoot), which cascades
 * `--cv-*` CSS custom properties to all CustardUI elements (e.g. settings widget,
 * modal, on-page custom elements such as `<cv-toggle-control>`).
 * 
 * Also used for light/dark variant resolution in label colour logic.
 */
export class ColorSchemeStore {
  isDark = $state(false);

  #mq: MediaQueryList | null = null;
  #handler: ((e: MediaQueryListEvent) => void) | null = null;

  #removeListener(): void {
    if (this.#mq && this.#handler) {
      this.#mq.removeEventListener('change', this.#handler);
      this.#mq = null;
      this.#handler = null;
    }
  }

  init(scheme: 'light' | 'dark' | 'auto' = 'light'): void {
    this.#removeListener();

    if (scheme === 'dark') {
      this.isDark = true;
      return;
    }
    if (scheme === 'auto') {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        // SSR or environment without matchMedia — default to light
        this.isDark = false;
        return;
      }
      this.#mq = window.matchMedia('(prefers-color-scheme: dark)');
      this.#handler = (e) => {
        this.isDark = e.matches;
      };
      this.isDark = this.#mq.matches;
      this.#mq.addEventListener('change', this.#handler);
      return;
    }
    // 'light' (default)
    this.isDark = false;
  }

  destroy(): void {
    this.#removeListener();
  }
}

export const colorSchemeStore = new ColorSchemeStore();
