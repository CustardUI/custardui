import { type AnchorDescriptor } from './types';
import { hashCode, getStableNormalizedText } from './stable-text';

const SCORE_EXACT_HASH = 50;
const SCORE_SNIPPET_START = 30;
const SCORE_INDEX_MATCH = 10;
const SCORE_PERFECT = 60;
const SCORE_THRESHOLD = 30;

/**
 * Finds the best DOM element match(es) for a descriptor.
 * Returns an array of elements. For specific descriptors, usually contains 0 or 1 element.
 * For ID-only descriptors (tag='ANY'), may return multiple if duplicates exist.
 */
export function resolve(root: HTMLElement, descriptor: AnchorDescriptor): HTMLElement[] {
  // 0. Direct ID Shortcut
  if (descriptor.elementId) {
    // Always support duplicate IDs for consistency, even if technically invalid HTML.
    const all = document.querySelectorAll(`[id="${CSS.escape(descriptor.elementId)}"]`);
    if (all.length > 0) return Array.from(all) as HTMLElement[];

    // If not found by ID (and it's a manual ID-only request), stop search.
    if (descriptor.tag === 'ANY') return [];
  }

  // 1. Determine Scope
  let scope: HTMLElement = root;

  // Optimization: If parentId exists, try to narrow scope immediately.
  if (descriptor.parentId) {
    const foundParent = document.getElementById(descriptor.parentId);
    if (foundParent instanceof HTMLElement) {
      scope = foundParent;
    }
  }

  // 2. Candidate Search & Scoring
  const candidates = scope.querySelectorAll(descriptor.tag);

  // Optimization: Structural Check First (Fastest)
  // If we trust the structure hasn't changed, the element at the specific index
  // is effectively O(1) access if we assume `querySelectorAll` order is stable.
  // Cache the computed text so the full scan can reuse it if this check fails.
  let indexCandidateText: string | null = null;
  if (candidates[descriptor.index]) {
    const candidate = candidates[descriptor.index] as HTMLElement;
    indexCandidateText = getStableNormalizedText(candidate);

    // Perfect Match Check: If index + hash match, it's virtually guaranteed.
    // This avoids checking every other candidate.
    if (hashCode(indexCandidateText) === descriptor.textHash) {
      return [candidate];
    }
  }

  // Fallback: Full scan if structural match failed (element moved/deleted/inserted)
  let bestMatch: HTMLElement | null = null;
  let highestScore = 0;

  // Use loop with break ability for optimization
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i] as HTMLElement;
    let score = 0;
    // Reuse already-computed text for the index candidate to avoid duplicate DOM walk.
    const text = i === descriptor.index && indexCandidateText !== null
      ? indexCandidateText
      : getStableNormalizedText(candidate);

    // Content Match
    if (hashCode(text) === descriptor.textHash) {
      score += SCORE_EXACT_HASH;
    } else if (text.startsWith(descriptor.textSnippet)) {
      score += SCORE_SNIPPET_START;
    }

    // Structural Match (Re-calculated index)
    if (i === descriptor.index) {
      score += SCORE_INDEX_MATCH;
    }

    // Early Exit: If we find a very high score (Hash + Index), we can stop.
    if (score >= SCORE_PERFECT) {
      return [candidate];
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = candidate;
    }
  }

  // Threshold check
  return highestScore > SCORE_THRESHOLD && bestMatch ? [bestMatch] : [];
}
