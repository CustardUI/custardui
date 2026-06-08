export const BOX_COLORS = [
  { key: 'orange', label: 'Orange', hex: '#ff9e5e' },
  { key: 'green', label: 'Lime Green', hex: '#e2f073' },
  { key: 'pink', label: 'Pink', hex: '#ff7eb3' },
  { key: 'yellow', label: 'Yellow', hex: '#ffd447' },
  { key: 'blue', label: 'Light Blue', hex: '#7ee0f5' },
] as const;

export type BoxColorKey = 'orange' | 'green' | 'pink' | 'yellow' | 'blue';
export const DEFAULT_COLOR_KEY: BoxColorKey = 'orange';
