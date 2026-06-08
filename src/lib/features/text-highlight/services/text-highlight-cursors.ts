import { type AnnotationColorKey } from '$features/annotations/annotation-colors';

// Maps each color key to a hex value for the SVG pen body and tip fill.
export const TEXT_HIGHLIGHT_CURSORS: Record<AnnotationColorKey, { body: string; tip: string }> = {
  orange: { body: '#fb923c', tip: '#c2410c' },
  green: { body: '#bef264', tip: '#4d7c0f' },
  pink: { body: '#f472b6', tip: '#be185d' },
  yellow: { body: '#facc15', tip: '#a16207' },
  blue: { body: '#7dd3fc', tip: '#0369a1' },
};
