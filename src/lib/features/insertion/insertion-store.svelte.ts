import type { InsertionMap } from './types';

/**
 * Reactive store holding the parsed insertions from the active adaptation's
 * `insertions.html` file, plus the attribution label for the callout UI.
 *
 * Populated during browser initialisation by `InsertionLoader.init()` before
 * `AppRuntime.start()` is called, so the `<cv-insertion>` custom element has
 * data available immediately on first mount.
 */
class InsertionStore {
  /**
   * The parsed insertion map for the active adaptation.
   * `null` means no adaptation is active (or loading has not completed).
   * An empty object means an adaptation is active but has no insertions file
   * (or the file is empty / failed to load).
   */
  map = $state<InsertionMap | null>(null);

  /**
   * The human-readable name of the active adaptation, used as the default
   * attribution label in the callout header.
   * Falls back to the adaptation `id` if no `name` is provided.
   */
  adaptationLabel = $state<string | null>(null);

  /**
   * Whether an adaptation is currently active.
   * Distinct from `map !== null` — even a failed insertions fetch should not
   * hide the fact that an adaptation is active.
   */
  isAdaptationActive = $state(false);

  /**
   * Initialises the store after the insertions file has been loaded.
   *
   * @param map The parsed InsertionMap, or null if loading failed / no file
   * @param adaptationLabel The attribution label (adaptation name or id)
   * @param isAdaptationActive Whether an adaptation is currently active
   */
  init(map: InsertionMap | null, adaptationLabel: string | null, isAdaptationActive: boolean): void {
    this.map = map;
    this.adaptationLabel = adaptationLabel;
    this.isAdaptationActive = isAdaptationActive;
  }
}

export const insertionStore = new InsertionStore();
