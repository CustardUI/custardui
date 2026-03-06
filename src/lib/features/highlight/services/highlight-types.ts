// Extracted shared type to avoid circular dependency
import { type HighlightColorKey } from './highlight-colors';

export type RectData = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
  element: HTMLElement;
  color?: HighlightColorKey;
};
