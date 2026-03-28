import { type AnchorDescriptor } from './types';
import { hashCode, getStableNormalizedText } from './stable-text';

/**
 * Walks the ancestor chain of `el` to find the first element with a non-empty
 * `id` attribute. Returns both the id string and the ancestor element so the
 * caller can use the element itself as a query scope.
 * Returns `ancestorEl: null` when no id-bearing ancestor exists.
 */
function findNearestIdAncestor(
  el: HTMLElement,
): { parentId: string | undefined; ancestorEl: HTMLElement | null } {
  let node = el.parentElement;
  while (node) {
    if (node.id) return { parentId: node.id, ancestorEl: node };
    node = node.parentElement;
  }
  return { parentId: undefined, ancestorEl: null };
}

/**
 * Creates an AnchorDescriptor for a given DOM element.
 */
export function createDescriptor(el: HTMLElement): AnchorDescriptor {
  const tag = el.tagName;
  const normalizedText = getStableNormalizedText(el);

  const { parentId, ancestorEl: idAncestor } = findNearestIdAncestor(el);
  const container = idAncestor ?? document.body;

  const siblings = Array.from(container.querySelectorAll(tag));
  const rawIndex = siblings.indexOf(el);
  if (rawIndex === -1) {
    console.error('[CustardUI] createDescriptor: element not found in container, ' +
      'element may be detached from the DOM. Please open an issue.', el);
  }
  const index = rawIndex !== -1 ? rawIndex : 0;

  const descriptor: AnchorDescriptor = {
    tag,
    index,
    textSnippet: normalizedText.substring(0, 32),
    textHash: hashCode(normalizedText),
  };

  if (el.id) {
    descriptor.elementId = el.id;
  }

  if (parentId) {
    descriptor.parentId = parentId;
  }

  return descriptor;
}
