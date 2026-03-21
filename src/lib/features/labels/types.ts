/**
 * Configuration for a single label (inline decorative pill badge).
 */
export interface LabelConfig {
  /** Unique identifier used in `<cv-label name="...">` */
  name: string;
  /** Display text — any string, including unicode/emoji (e.g. "OPTIONAL", "★ KEY"). If omitted, the element's inner content is used. */
  value?: string;
  /** CSS background color (hex or named). Text color is auto-computed for contrast. Defaults to #6b7280. */
  color?: string;
}
