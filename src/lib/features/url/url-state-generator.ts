import type { State } from '$lib/types/index';
import { PARAM_SHOW_TOGGLE, PARAM_PEEK_TOGGLE, PARAM_HIDE_TOGGLE, PARAM_TABS, PARAM_PH } from './url-constants';
import { encodeList, encodePairs } from './url-encoding-utils';

/**
 * Builds the query string fragment for the managed URL parameters from a state object.
 *
 * We construct this string manually (instead of using `URLSearchParams.set()`)
 * to avoid double-encoding. `URLSearchParams.set()` would encode our already-encoded
 * values a second time (e.g. `%2C` → `%252C`), requiring a hacky decode step.
 *
 * By building the string directly, each value is encoded exactly once,
 * and structural separators (`,` `:`) remain as literal characters in the URL.
 */
export function generateManagedQuery(state: State): string {
  const parts: string[] = [];

  if (state.shownToggles && state.shownToggles.length > 0) {
    parts.push(`${PARAM_SHOW_TOGGLE}=${encodeList(state.shownToggles)}`);
  }
  if (state.peekToggles && state.peekToggles.length > 0) {
    parts.push(`${PARAM_PEEK_TOGGLE}=${encodeList(state.peekToggles)}`);
  }
  if (state.hiddenToggles && state.hiddenToggles.length > 0) {
    parts.push(`${PARAM_HIDE_TOGGLE}=${encodeList(state.hiddenToggles)}`);
  }
  if (state.tabs && Object.keys(state.tabs).length > 0) {
    parts.push(`${PARAM_TABS}=${encodePairs(state.tabs)}`);
  }
  if (state.placeholders && Object.keys(state.placeholders).length > 0) {
    parts.push(`${PARAM_PH}=${encodePairs(state.placeholders)}`);
  }

  return parts.join('&');
}

/**
 * Builds a full absolute URL string from the base URL and managed params.
 */
export function buildFullUrl(url: URL, managedQuery: string): string {
  const preservedSearch = url.searchParams.toString();
  const search = [preservedSearch, managedQuery].filter(Boolean).join('&');
  return url.origin + url.pathname + (search ? `?${search}` : '') + (url.hash || '');
}
