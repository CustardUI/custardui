import { type BoxColorKey } from '$features/box/services/box-colors';
import { type AnnotationCorner } from '$features/annotations/annotation-types';

/** Max characters stored for the start/end text snippet anchors. */
export const SNIPPET_LENGTH = 16;

/**
 * Describes a text range within a DOM container element.
 * Stable across minor content changes because it anchors via text snippets + hash.
 */
export interface TextRangeDescriptor {
  // --- Container anchor (mirrors AnchorDescriptor) ---
  elementId?: string;     // The container element's own id (direct lookup, most stable)
  containerId?: string;   // Nearest ancestor id (scope for index search)
  containerTag: string;   // e.g. 'P', 'LI', 'H2'
  containerIndex: number; // nth element of containerTag within containerId scope
  containerHash: number;  // hashCode(getStableNormalizedText(container))

  // --- Text anchor (Scheme A: text snippets + hash) ---
  startText: string;   // First min(SNIPPET_LENGTH, textLength) chars of normalised selected text
  endText: string;     // Last  min(SNIPPET_LENGTH, textLength) chars of normalised selected text
  textHash: number;    // hashCode of full normalised selected text
  textLength: number;  // Character count of full normalised selected text

  // --- Optional styling ---
  color?: BoxColorKey;

  // --- Optional annotation ---
  annotation?: string;            // Text note attached to this highlight (≤280 chars)
  annotationCorner?: AnnotationCorner; // Which corner of the bubble anchors to the rect (default 'tl')
}
