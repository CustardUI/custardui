/**
 * Shared annotation types and constants.
 *
 * This is the single source of truth for annotation-related types used across
 * box mode, text highlights, and any future annotation hosts.
 */

// ─── Corner (for box-element annotations) ────────────────────────────────────

/** Which corner of the annotated element/rect the annotation ribbon anchors to. */
export type AnnotationCorner = 'tl' | 'tr' | 'bl' | 'br';
export const ANNOTATION_CORNERS: AnnotationCorner[] = ['tl', 'tr', 'bl', 'br'];
export const CORNER_ICONS: { key: AnnotationCorner; icon: string }[] = [
  { key: 'tl', icon: '◤' },
  { key: 'tr', icon: '◥' },
  { key: 'bl', icon: '◣' },
  { key: 'br', icon: '◢' },
];
export const DEFAULT_ANNOTATION_CORNER: AnnotationCorner = 'tl';

// ─── Shared limits ────────────────────────────────────────────────────────────

/** Maximum number of characters allowed in any annotation note. */
export const MAX_ANNOTATION_LENGTH = 280;

/** Characters shown in the collapsed ribbon preview. */
export const ANNOTATION_PREVIEW_LENGTH = 36;
