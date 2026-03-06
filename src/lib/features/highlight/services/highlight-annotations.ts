export type AnnotationCorner = 'tl' | 'tr' | 'bl' | 'br';
export const ANNOTATION_CORNERS: AnnotationCorner[] = ['tl', 'tr', 'bl', 'br'];
export const CORNER_ICONS: { key: AnnotationCorner; icon: string }[] = [
  { key: 'tl', icon: '◤' },
  { key: 'tr', icon: '◥' },
  { key: 'bl', icon: '◣' },
  { key: 'br', icon: '◢' },
];
export const DEFAULT_ANNOTATION_CORNER: AnnotationCorner = 'tl';
export const MAX_ANNOTATION_LENGTH = 280;
export const ANNOTATION_PREVIEW_LENGTH = 40;
