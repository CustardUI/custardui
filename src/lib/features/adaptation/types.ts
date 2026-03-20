export interface AdaptationConfig {
  id: string;
  name?: string;
  theme?: {
    cssVariables?: Record<string, string>;
    cssFile?: string;
  };
  preset?: {
    toggles?: Record<string, 'show' | 'hide' | 'peek'>;
    placeholders?: Record<string, string>;
  };
}
