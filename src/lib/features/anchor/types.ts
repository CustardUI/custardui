import { type HighlightColorKey } from '$features/highlight/services/highlight-colors';
import { type AnnotationCorner } from '$features/highlight/services/highlight-annotations';

/**
 * Descriptor for an anchor that represents a DOM element.
 */
export interface AnchorDescriptor {
  tag: string; // e.g., "P", "BLOCKQUOTE"
  index: number; // e.g., 2 (It is the 2nd <p> in the container)
  parentId?: string; // ID of the nearest parent that HAS a hard ID (e.g., #section-configuration)
  textSnippet: string; // First 32 chars of text content (normalized)
  textHash: number; // A simple hash of the full text content
  elementId?: string; // The element's own ID if present
  color?: HighlightColorKey; // Per-element highlight color (omitted = default yellow)
  annotation?: string; // Optional text annotation (≤280 chars)
  annotationCorner?: AnnotationCorner; // Which corner the annotation anchors to
}
