import type { WidgetSettings, WidgetCalloutConfig, WidgetIconConfig } from '$features/settings/types';
import type { IconSettingsStore } from '$features/settings/stores/icon-settings-store.svelte';
import type { PersistenceManager } from '$lib/utils/persistence';

export const RUNTIME_CALLBACKS_CTX = Symbol('cv-runtime-callbacks');

/**
 * Callbacks that the UI layer needs from the runtime.
 * This keeps the UI decoupled from the AppRuntime class.
 */
export interface RuntimeCallbacks {
  resetToDefault: () => void;
  iconSettings: IconSettingsStore;
  persistenceManager: PersistenceManager;
}

export interface UIManagerOptions extends Omit<WidgetSettings, 'enabled' | 'panel'> {
  /** Callbacks from the runtime for persistence and reset */
  callbacks: RuntimeCallbacks;

  /** Container element where the settings widget should be rendered */
  container?: HTMLElement;

  /** Whether the settings feature (icon/modal) is enabled */
  settingsEnabled?: boolean;
}

export type ResolvedUIManagerOptions = Omit<
  UIManagerOptions,
  'container' | 'panel' | 'callout' | 'icon'
> & {
  container: HTMLElement;
  settingsEnabled: boolean;
  callout: Required<Pick<WidgetCalloutConfig, 'show' | 'message' | 'enablePulse'>> & {
    backgroundColor?: string | undefined;
    textColor?: string | undefined;
  };
  icon: Required<Pick<WidgetIconConfig, 'position' | 'scale' | 'show'>> & {
    color?: string | undefined;
    backgroundColor?: string | undefined;
    opacity?: number | undefined;
  };
};
