// Extracted shared type to avoid circular dependency
import { type BoxColorKey } from './box-colors';
import { type AnnotationCorner } from '$features/annotations/annotation-types';

export type RectData = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
  element: HTMLElement;
  color?: BoxColorKey;
  annotation?: string;
  annotationCorner?: AnnotationCorner;
};
