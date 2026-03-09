import type { AdaptationConfig } from '../types';

class AdaptationStore {
  activeConfig = $state<AdaptationConfig | null>(null);

  /**
   * Called from AppRuntime constructor after stores are initialized.
   */
  init(config: AdaptationConfig | null): void {
    this.activeConfig = config;
  }
}

export const adaptationStore = new AdaptationStore();
