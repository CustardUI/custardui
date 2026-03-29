import type { PlaceholderDefinition } from '../features/placeholder/types';
import type { TabGroupConfig } from '../features/tabs/types';
import type { ToggleConfig } from '../features/toggles/types';
import type { LabelConfig } from '../features/labels/types';
import type { ShareExclusions } from '../features/share/types';
import type { WidgetSettings } from '../features/settings/types';

const CONFIG_SECTION_KEYS = ['toggles', 'tabGroups', 'placeholders'] as const;

export type ConfigSectionKey = (typeof CONFIG_SECTION_KEYS)[number];

export function isValidConfigSection(key: string): key is ConfigSectionKey {
  return CONFIG_SECTION_KEYS.includes(key as ConfigSectionKey);
}

/**
 * Configuration (website author-defined) for the site
 */
export interface Config {
  /** All available toggle categories */
  toggles?: ToggleConfig[];
  /** Optional tab group configurations */
  tabGroups?: TabGroupConfig[];
  /** Excluded tags and IDs for Share/Focus modes */
  shareExclusions?: ShareExclusions;
  /** Global placeholder definitions */
  placeholders?: PlaceholderDefinition[];
  /** Inline decorative label (badge) definitions */
  labels?: LabelConfig[];
}

/**
 * Represents the configuration file structure for CustardUI auto-initialization.
 */
export interface ConfigFile {
  /** Core configuration object with toggles and defaultState */
  config?: Config;
  /** Optional key to namespace localStorage items for isolation */
  storageKey?: string;
  /** Widget configuration options */
  settings?: WidgetSettings;
  /** Color scheme used to resolve shorthand label colors. Defaults to 'light'. */
  colorScheme?: 'light' | 'dark' | 'auto';
}
