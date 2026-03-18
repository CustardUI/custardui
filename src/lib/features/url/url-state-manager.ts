import type { Config, State } from '$lib/types/index';
import { MANAGED_PARAMS } from './url-constants';
import { parseTogglesFromURL, parseTabsFromURL, parsePlaceholdersFromURL } from './url-state-parser';
import { computeShareableSettingState, type PageElements } from './url-state-shaper';
import { generateManagedQuery, buildFullUrl } from './url-state-generator';

/**
 * URL State Manager for CustardUI.
 * Handles encoding/decoding of view states as human-readable URL parameters.
 *
 * URL Schema (defined in url-constants.ts):
 *   ?t-show=A,B        — toggle IDs to explicitly show
 *   ?t-peek=C          — toggle IDs to explicitly peek
 *   ?t-hide=D          — toggle IDs to explicitly hide
 *   ?tabs=g1:t1,g2:t2  — tab group selections (groupId:tabId pairs)
 *   ?ph=key:val        — placeholder values (key:encodedValue pairs)
 *
 * Precedence model (applied by ActiveStateStore, not here):
 * - Persisted state is loaded first as a base.
 * - URL parameters act as a sparse override on top of persisted state.
 *   Only toggles/tabs/placeholders mentioned in the URL are affected.
 * - Tab-group-derived placeholders are always re-derived from the active tab,
 *   so the `?tabs=` param is the sole source of truth for those values.
 *
 * `parseURL` is used on page load to read inbound link state.
 * `generateShareableURL` is used to produce a link for the clipboard.
 *
 * Focus params (cv-show, cv-hide, cv-highlight) remain owned by FocusService.
 */
export class URLStateManager {
  /**
   * Parses the current page URL into a sparse delta state object.
   * Only fields present in the URL are populated; the rest are omitted.
   * Returns null if none of the managed parameters are present.
   */
  public static parseURL(): State | null {
    const urlParams = new URLSearchParams(window.location.search);

    const hasAny = MANAGED_PARAMS.some((p) => urlParams.has(p));
    if (!hasAny) return null;

    const search = window.location.search;

    return {
      ...parseTogglesFromURL(search),
      ...parseTabsFromURL(search),
      ...parsePlaceholdersFromURL(search),
    };
  }

  /**
   * Generates a shareable URL that encodes the full current state.
   *
   * Encodes every toggle on the page explicitly (shown, peeked, or hidden)
   * so the recipient sees the exact same view regardless of their local settings.
   *
   * Tab-group-derived placeholders are omitted from the URL — they are implied
   * by the `?tabs=` parameter and will be re-derived by the recipient's store.
   *
   * Toggles, tabs, and placeholders NOT present on the current page are omitted,
   * preventing cross-page state pollution.
   *
   * @param currentState The full application state to encode.
   * @param config The application configuration.
   * @param pageElements The active elements detected on the current page.
   */
  public static generateShareableURL(
    currentState: State | null | undefined,
    config: Config,
    pageElements: PageElements = { toggles: [], tabGroups: [], placeholders: [] },
  ): string {
    const url = new URL(window.location.href);

    for (const param of MANAGED_PARAMS) {
      url.searchParams.delete(param);
    }

    let managedQuery = '';
    if (currentState) {
      const shareable = computeShareableSettingState(currentState, pageElements, config);
      managedQuery = generateManagedQuery(shareable);
    }

    return buildFullUrl(url, managedQuery);
  }

  /**
   * Clears all managed parameters from the current browser URL.
   * This is called after parsing so that shared configurations don't stick around in
   * the address bar when the user subsequently interacts with the page or refreshes.
   */
  public static clearURL(): void {
    if (typeof window === 'undefined' || !window.history) return;

    const url = new URL(window.location.href);
    let hasChanges = false;

    for (const param of MANAGED_PARAMS) {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      window.history.replaceState({}, '', url.toString());
    }
  }
}

// Export for use in tests that verify focus params are preserved
export { FOCUS_PARAMS } from './url-constants';
// Re-export for convenience and compatibility
export { MANAGED_PARAMS } from './url-constants';
export type { PageElements } from './url-state-shaper';
