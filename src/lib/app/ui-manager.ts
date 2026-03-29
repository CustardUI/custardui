import type { AppRuntime } from '../runtime.svelte';
import type { ConfigFile } from '$lib/types/index';
import UIRoot from './UIRoot.svelte';
import { mount, unmount } from 'svelte';

import { ICON_SETTINGS_CTX } from '$features/settings/stores/icon-settings-store.svelte';
import {
  type UIManagerOptions,
  type ResolvedUIManagerOptions,
  type RuntimeCallbacks,
  RUNTIME_CALLBACKS_CTX,
} from './types';

export * from './types';

export class CustardUIManager {
  private app: ReturnType<typeof mount> | null = null;
  private options: ResolvedUIManagerOptions;

  constructor(options: UIManagerOptions) {
    this.options = {
      callbacks: options.callbacks,
      container: options.container || document.body,
      settingsEnabled: options.settingsEnabled ?? false,
      callout: {
        show: options.callout?.show ?? false,
        message: options.callout?.message || 'Customize your reading experience here.',
        enablePulse: options.callout?.enablePulse ?? true,
        backgroundColor: options.callout?.backgroundColor,
        textColor: options.callout?.textColor,
      },
      icon: {
        position: options.icon?.position || 'middle-left',
        color: options.icon?.color,
        backgroundColor: options.icon?.backgroundColor,
        opacity: options.icon?.opacity,
        scale: options.icon?.scale ?? 1,
        show: options.icon?.show ?? true,
      },
    };
  }

  /**
   * Render the settings widget
   */
  public render(): void {
    if (this.app) {
      return;
    }

    const rootContext = new Map();
    rootContext.set(ICON_SETTINGS_CTX, this.options.callbacks.iconSettings);
    rootContext.set(RUNTIME_CALLBACKS_CTX, this.options.callbacks);

    this.app = mount(UIRoot, {
      target: this.options.container,
      props: {
        options: this.options,
      },
      context: rootContext,
    });
  }

  /**
   * Remove the settings widget from DOM
   */
  public destroy(): void {
    if (this.app) {
      unmount(this.app);
      this.app = null;
    }
  }
}

/**
 * Initializes the UI manager (settings and share UI) using the provided config.
 */
export function initUIManager(
  runtime: AppRuntime,
  config: ConfigFile,
): CustardUIManager | undefined {
  // panel settings (title, description, showTabGroups, showReset) are consumed
  // exclusively by AppRuntime.initStores() — CustardUIManager only needs callout + icon.
  const { enabled, panel: _panel, ...managerSettings } = config.settings ?? {};
  const settingsEnabled = enabled === true;

  const callbacks: RuntimeCallbacks = {
    resetToDefault: () => runtime.resetToDefault(),
    iconSettings: runtime.iconSettingsStore,
    persistenceManager: runtime.persistenceManager,
  };

  const uiManager = new CustardUIManager({
    callbacks,
    settingsEnabled,
    ...managerSettings,
  });
  uiManager.render();
  return uiManager;
}
