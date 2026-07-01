export interface AdaptationConfig {
  id: string;
  name?: string;
  theme?: {
    cssVariables?: Record<string, string>;
    cssFile?: string;
  };
  /**
   * Filename of the insertions file within the adaptation folder.
   * Defaults to `insertions.html`.
   * e.g. `"insertions.html"` → `{adaptationsPath}/{id}/insertions.html`
   */
  insertionsFile?: string;
  preset?: {
    toggles?: Record<string, 'show' | 'hide' | 'peek'>;
    tabs?: Record<string, string>;
    placeholders?: Record<string, string>;
    labels?: Record<string, { value?: string; color?: string }>;
  };
}
