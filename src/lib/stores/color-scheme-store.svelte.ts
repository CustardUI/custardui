/**
 * App-wide store for color scheme preference.
 * Drives light/dark variant resolution for shorthand label colors and any other
 * components that need to react to the site's color scheme setting.
 */
class ColorSchemeStore {
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
