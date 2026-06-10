export const ANNOTATION_COLORS = [
  { key: 'orange', label: 'Orange', hex: '#ff9e5e', textColor: '#2c2c2c' },
  { key: 'green', label: 'Lime Green', hex: '#e2f073', textColor: '#2c2c2c' },
  { key: 'pink', label: 'Pink', hex: '#ff7eb3', textColor: '#2c2c2c' },
  { key: 'yellow', label: 'Yellow', hex: '#ffd447', textColor: '#2c2c2c' },
  { key: 'blue', label: 'Light Blue', hex: '#7ee0f5', textColor: '#2c2c2c' },
  { key: 'classic-yellow', label: 'Classic Yellow', hex: '#f5f521', textColor: '#2c2c2c' },
  { key: 'classic-blue', label: 'Classic Blue', hex: '#3b82f6', textColor: '#ffffff' },
  { key: 'classic-green', label: 'Classic Green', hex: '#22c55e', textColor: '#ffffff' },
  { key: 'red', label: 'Red', hex: '#ef4444', textColor: '#ffffff' },
  { key: 'black', label: 'Black', hex: '#1a1a1a', textColor: '#ffffff' },
] as const;

export type AnnotationColorKey = 
  | 'orange' 
  | 'green' 
  | 'pink' 
  | 'yellow' 
  | 'blue'
  | 'classic-yellow'
  | 'classic-blue'
  | 'classic-green'
  | 'red'
  | 'black';
export const DEFAULT_ANNOTATION_COLOR_KEY: AnnotationColorKey = 'yellow';
