export interface AdaptationConfig {
  id: string;
  name?: string;
  theme?: {
    cssVariables?: Record<string, string>;
    cssFile?: string;
  };
  preset?: {
    toggles?: Record<string, 'show' | 'hide' | 'peek'>;
    tabs?: Record<string, string>;
    placeholders?: Record<string, string>;
    labels?: Record<string, { value?: string; color?: string }>;
  };
}
