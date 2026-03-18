import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';
import type { Config, State } from '$lib/types/index';

/**
 * Elements currently present and tracked on the page.
 */
export interface ElementsOnCurrentPage {
  toggles: Iterable<string>;
  tabGroups: Iterable<string>;
  placeholders: Iterable<string>;
}

/**
 * Strips placeholder entries that should not appear in shareable URLs:
 * - Tab-group-derived placeholders (source: 'tabgroup') — implied by ?tabs=
 * - Adaptation-only placeholders (adaptationPlaceholder: true) — author-controlled, not shareable
 */
export function stripNonShareablePlaceholders(placeholders: Record<string, string>, config: Config): Record<string, string> {
  const shareable: Record<string, string> = {};

  for (const [key, value] of Object.entries(placeholders)) {
    const definition = placeholderRegistryStore.get(key) || config.placeholders?.find(p => p.name === key);
    if (!definition) continue;                            // skip unknown keys (injection prevention)
    
    // Note: PlaceholderDefinition from registry has 'source', but config doesn't.
    // That's fine as 'tabgroup' placeholders are mostly a runtime artifact.
    if ('source' in definition && definition.source === 'tabgroup') continue; // implied by ?tabs=
    if ('adaptationPlaceholder' in definition && definition.adaptationPlaceholder) continue; // author-only
    shareable[key] = value;
  }

  return shareable;
}

/**
 * Filters the current toggle state (shown, peeked) and derives the explicit 
 * hidden list for the shareable URL.
 */
export function getShareableToggles(currentState: State, pageTogglesSet: Set<string>, config: Config): Pick<State, 'shownToggles' | 'peekToggles' | 'hiddenToggles'> {
  const currentShown = currentState.shownToggles ?? [];
  const currentPeek  = currentState.peekToggles  ?? [];

  const shouldInclude = (id: string): boolean => {
    const toggleConfig = config.toggles?.find(t => t.toggleId === id);

    // Case 1: Not found in configuration
    if (!toggleConfig) {
      return pageTogglesSet.has(id);
    }

    // Case 2: Configured as Global
    if (!toggleConfig.isLocal) {
      return true;
    }

    // Case 3: Configured as Local
    return pageTogglesSet.has(id);
  };

  const shareableShown = currentShown.filter(shouldInclude);
  const shareablePeek = currentPeek.filter(shouldInclude);

  const shownSet = new Set(shareableShown);
  const peekSet  = new Set(shareablePeek);

  const absoluteHide: string[] = [];
  const relevantToggles = new Set(pageTogglesSet);
  for (const t of (config.toggles ?? [])) {
    if (!t.isLocal) relevantToggles.add(t.toggleId);
  }

  for (const id of relevantToggles) {
    if (!shownSet.has(id) && !peekSet.has(id)) {
      absoluteHide.push(id);
    }
  }

  const result: Pick<State, 'shownToggles' | 'peekToggles' | 'hiddenToggles'> = {};
  if (shareableShown.length > 0) result.shownToggles = shareableShown;
  if (shareablePeek.length  > 0) result.peekToggles  = shareablePeek;
  if (absoluteHide.length > 0) result.hiddenToggles = absoluteHide;
  return result;
}

/**
 * Filters the active tab selections for the shareable URL.
 */
export function getShareableTabs(currentState: State, pageTabGroupsSet: Set<string>, config: Config): Pick<State, 'tabs'> {
  if (!currentState.tabs) return {};

  const shareableTabs: Record<string, string> = {};

  for (const [groupId, tabId] of Object.entries(currentState.tabs)) {
    const groupConfig = config.tabGroups?.find(g => g.groupId === groupId);
    let shouldInclude = false;

    if (!groupConfig) {
      // Unknown group: Only include if explicitly detected on page to prevent injection
      shouldInclude = pageTabGroupsSet.has(groupId);
    } else if (!groupConfig.isLocal) {
      // Global group: Always include
      shouldInclude = true;
    } else {
      // Local group: Only include if detected on page
      shouldInclude = pageTabGroupsSet.has(groupId);
    }

    if (shouldInclude) {
      shareableTabs[groupId] = tabId;
    }
  }
  return Object.keys(shareableTabs).length > 0 ? { tabs: shareableTabs } : {};
}

/**
 * Filters the custom placeholder values for the shareable URL.
 */
export function getShareablePlaceholders(currentState: State, pagePlaceholdersSet: Set<string>, config: Config): Pick<State, 'placeholders'> {
  if (!currentState.placeholders) return {};

  const strippedPlaceholders = stripNonShareablePlaceholders(currentState.placeholders, config);
  const shareablePlaceholders: Record<string, string> = {};
  for (const [key, value] of Object.entries(strippedPlaceholders)) {
    const definition = placeholderRegistryStore.get(key) || config.placeholders?.find(p => p.name === key);
    let shouldInclude = false;

    if (!definition) {
      // Note: definition is guaranteed to exist here due to stripNonShareablePlaceholders,
      // but we handle it explicitly for clarity and future-proofing.
      shouldInclude = pagePlaceholdersSet.has(key);
    } else if (!definition.isLocal) {
      // Global placeholder: Always include
      shouldInclude = true;
    } else {
      // Local placeholder: Only include if detected on page
      shouldInclude = pagePlaceholdersSet.has(key);
    }

    if (shouldInclude) {
      shareablePlaceholders[key] = value;
    }
  }
  return Object.keys(shareablePlaceholders).length > 0 ? { placeholders: shareablePlaceholders } : {};
}

/**
 * Computes a shareable state object from the current state.
 *
 * Toggles, tabs, and placeholders marked as `isLocal: true` are only included
 * if they are present on the current page.
 *
 * Global elements (not `isLocal`) are always included regardless of whether
 * they are detected on the current page.
 *
 * Every toggle known to the page (or global) is explicitly encoded as shown,
 * peeked, or hidden, so the recipient's view exactly matches the sender's
 * regardless of their local settings.
 *
 * Tab-group-derived placeholders are omitted — the `?tabs=` param is their source of truth.
 *
 * @param currentState The current application state.
 * @param elementsOnCurrentPage The active elements detected on the current page.
 * @param config The application configuration.
 */
export function computeShareableSettingState(
  currentState: State,
  elementsOnCurrentPage: ElementsOnCurrentPage,
  config: Config
): State {
  const pageTogglesSet = new Set(elementsOnCurrentPage.toggles);
  const pageTabGroupsSet = new Set(elementsOnCurrentPage.tabGroups);
  const pagePlaceholdersSet = new Set(elementsOnCurrentPage.placeholders);

  return {
    ...getShareableToggles(currentState, pageTogglesSet, config),
    ...getShareableTabs(currentState, pageTabGroupsSet, config),
    ...getShareablePlaceholders(currentState, pagePlaceholdersSet, config),
  };
}
