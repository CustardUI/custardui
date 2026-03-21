/**
 * App-wide store for color scheme preference.
 * Drives light/dark variant resolution for shorthand label colors and any other
 * components that need to react to the site's color scheme setting.
 */
class ColorSchemeStore {
  isDark = $state(false);

  init(scheme: 'light' | 'dark' | 'auto' = 'light'): void {
    if (scheme === 'dark') {
      this.isDark = true;
      return;
    }
    if (scheme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      this.isDark = mq.matches;
      mq.addEventListener('change', (e) => {
        this.isDark = e.matches;
      });
      return;
    }
    // 'light' (default)
    this.isDark = false;
  }
}

export const colorSchemeStore = new ColorSchemeStore();
