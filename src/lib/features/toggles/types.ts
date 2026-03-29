/**
 * Configuration for a single toggle.
 */
export interface ToggleConfig {
  /** Toggle identifier */
  toggleId: string;
  /** Display label for the toggle */
  label?: string;
  /** Determines if the toggle is only shown on pages where it's used. */
  isLocal?: boolean;
  /** Optional description to display below functionality */
  description?: string;
  /** Default state for this toggle: 'show', 'hide', or 'peek' */
  default?: 'show' | 'hide' | 'peek';
  /**
   * If true, this toggle's state is controlled by the site (via adaptations or config defaults).
   * It will be hidden from the settings UI, excluded from shareable URLs, and immune to user persistence.
   */
  siteManaged?: boolean;
}
