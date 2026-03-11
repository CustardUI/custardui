export const HIGHLIGHT_COLORS = [
  { key: 'yellow', label: 'Yellow', hex: '#f5f521' }, // default
  { key: 'blue',   label: 'Blue',   hex: '#3b82f6' },
  { key: 'red',    label: 'Red',    hex: '#ef4444' },
  { key: 'black',  label: 'Black',  hex: '#1a1a1a' },
  { key: 'green',  label: 'Green',  hex: '#22c55e' },
] as const;

export type HighlightColorKey = 'yellow' | 'blue' | 'red' | 'black' | 'green';
export const DEFAULT_COLOR_KEY: HighlightColorKey = 'red';
