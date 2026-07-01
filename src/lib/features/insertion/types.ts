/**
 * A single insertion block parsed from the adopter's `insertions.html`.
 */
export interface InsertionEntry {
  /** The raw HTML content of the div block. */
  content: string;
  /**
   * Optional per-insertion color from the `color` attribute on the div.
   * Sets the callout's border and background hue.
   * 
   * Example: `<div id="week1-preamble" color="#ef4444">`
   */
  color?: string;
  /**
   * Optional per-insertion alignment from the `align` attribute on the div.
   * 
   * Example: `<div id="week1-preamble" align="center">`
   */
  align?: string;
  /**
   * Optional per-insertion outline from the `outline` attribute on the div.
   * 
   * Example: `<div id="week1-preamble" outline="solid">`
   */
  outline?: string;
}

/**
 * A map of insertion IDs to their parsed entry.
 * Populated by parsing the adopter-provided `insertions.html` file.
 *
 * Each key corresponds to the `id` attribute of a `<div>` in `insertions.html`.
 */
export interface InsertionMap {
  [insertionId: string]: InsertionEntry;
}
