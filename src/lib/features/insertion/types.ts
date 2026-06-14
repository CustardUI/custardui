/**
 * A single insertion block parsed from the adopter's `insertions.html`.
 */
export interface InsertionEntry {
  /** The raw HTML content of the div block. */
  content: string;
  /**
   * Optional per-insertion label from the `label` attribute on the div.
   * Overrides the adaptation-level `name` in the callout header.
   *
   * Example: `<div id="week1-preamble" label="Week 1 – NUS">`
   */
  label?: string;
  /**
   * Optional per-insertion color from the `color` attribute on the div.
   * Sets the callout's border and background hue.
   * 
   * Example: `<div id="week1-preamble" color="#ef4444">`
   */
  color?: string;
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
