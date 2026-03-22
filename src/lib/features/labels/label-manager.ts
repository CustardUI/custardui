import type { Config } from '$lib/types/index';
import { labelRegistryStore } from './label-registry-store.svelte';

/**
 * Manages registration and adaptation overrides for label definitions.
 */
export const labelManager = {
  /**
   * Registers all labels from the config into the label registry store.
   */
  registerConfigLabels(config: Config): void {
    for (const label of (config.labels ?? [])) {
      labelRegistryStore.register(label);
    }
  },

  /**
   * Applies adaptation preset overrides to registered labels.
   * Unknown label names produce a warning and are skipped.
   */
  applyAdaptationOverrides(overrides: Record<string, { value?: string; color?: string }>): void {
    for (const [name, override] of Object.entries(overrides)) {
      labelRegistryStore.override(name, override);
    }
  },
};
