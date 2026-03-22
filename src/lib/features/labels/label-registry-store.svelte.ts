import { SvelteMap } from 'svelte/reactivity';
import type { LabelConfig } from './types';

/**
 * Registry store for label definitions.
 * Tracks config-defined labels and adaptation overrides.
 * Labels are config-level (not user state) — no persistence or URL encoding.
 */
export class LabelRegistryStore {
  private _labels = new SvelteMap<string, LabelConfig>();

  /**
   * Registers a label definition. Overwrites any existing entry with the same name.
   */
  register(def: LabelConfig): void {
    this._labels.set(def.name, { ...def });
  }

  /**
   * Merges overrides onto an existing label entry.
   * Warns and skips if the label name is not registered.
   */
  override(name: string, overrides: { value?: string; color?: string }): void {
    const existing = this._labels.get(name);
    if (!existing) {
      console.warn(`[CustardUI] Label "${name}" is not in the config and cannot be overridden.`);
      return;
    }
    this._labels.set(name, { ...existing, ...overrides });
  }

  /**
   * Returns the label definition for the given name, or undefined if not registered.
   */
  get(name: string): LabelConfig | undefined {
    return this._labels.get(name);
  }
}

export const labelRegistryStore = new LabelRegistryStore();
