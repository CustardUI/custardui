import type { UIManagerOptions } from '$lib/app/types';
import type { PersistenceManager } from '$lib/utils/persistence';

/**
 * IntroManager
 *
 * Responsibilities:
 * - Manages the visibility state of the introductory callout component.
 * - Handles the logic for when to show the callout (delay, checks if already shown).
 * - Manages the "pulse" effect state on the settings icon.
 * - Persists the "shown" state to localStorage to prevent showing it repeatedly.
 */
export class IntroManager {
  // UI State
  showCallout = $state(false);
  showPulse = $state(false);

  private persistence: PersistenceManager;
  private getOptions: () => UIManagerOptions['callout'];
  private hasChecked = false;

  constructor(
    persistence: PersistenceManager,
    options: UIManagerOptions['callout'] | (() => UIManagerOptions['callout']),
  ) {
    this.persistence = persistence;
    this.getOptions =
      typeof options === 'function'
        ? (options as () => UIManagerOptions['callout'])
        : () => options;
  }

  /**
   * Initializes the manager. Should be called when the component is ready
   * and we know there are elements on the current page (toggles, tab groups, or placeholders).
   */
  public init(hasElementsOnCurrentPage: boolean, settingsEnabled: boolean) {
    const options = this.getOptions();
    if (settingsEnabled && !this.hasChecked && options?.show) {
      if (hasElementsOnCurrentPage) {
        this.hasChecked = true;
        this.checkAndShow();
      }
    }
  }

  private checkAndShow() {
    if (!this.persistence.getItem('cv-intro-shown')) {
      setTimeout(() => {
        this.showCallout = true;
        this.showPulse = true;
      }, 1000);
    }
  }

  public dismiss() {
    this.showCallout = false;
    this.showPulse = false;
    this.persistence.setItem('cv-intro-shown', 'true');
  }
}
