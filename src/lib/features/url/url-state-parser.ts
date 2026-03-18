import type { State } from '$lib/types/index';
import { PARAM_SHOW_TOGGLE, PARAM_PEEK_TOGGLE, PARAM_HIDE_TOGGLE, PARAM_TABS, PARAM_PH } from './url-constants';
import { splitAndDecode, decodePairs } from './url-encoding-utils';

/**
 * Parses toggle visibility state from the current URL search string.
 * Returns partial state containing only the toggle fields that are present.
 */
export function parseTogglesFromURL(search: string): Pick<State, 'shownToggles' | 'peekToggles' | 'hiddenToggles'> {
  const partial: Pick<State, 'shownToggles' | 'peekToggles' | 'hiddenToggles'> = {};

  const showIds = splitAndDecode(search, PARAM_SHOW_TOGGLE);
  if (showIds.length > 0) partial.shownToggles = showIds;

  const peekIds = splitAndDecode(search, PARAM_PEEK_TOGGLE);
  if (peekIds.length > 0) partial.peekToggles = peekIds;

  const hideIds = splitAndDecode(search, PARAM_HIDE_TOGGLE);
  if (hideIds.length > 0) partial.hiddenToggles = hideIds;

  return partial;
}

/**
 * Parses tab group selections from the current URL search string.
 * Returns partial state containing the `tabs` record, or empty object if absent.
 */
export function parseTabsFromURL(search: string): Pick<State, 'tabs'> {
  const tabs = decodePairs(search, PARAM_TABS);
  return Object.keys(tabs).length > 0 ? { tabs } : {};
}

/**
 * Parses placeholder values from the current URL search string.
 * Returns partial state containing the `placeholders` record, or empty object if absent.
 */
export function parsePlaceholdersFromURL(search: string): Pick<State, 'placeholders'> {
  const placeholders = decodePairs(search, PARAM_PH);
  return Object.keys(placeholders).length > 0 ? { placeholders } : {};
}
