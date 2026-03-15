import { type AnchorDescriptor } from './types';
import { hashCode, getStableNormalizedText } from './stable-text';

/**
 * Creates an AnchorDescriptor for a given DOM element.
 */
export function createDescriptor(el: HTMLElement): AnchorDescriptor {
  const tag = el.tagName;
  const normalizedText = getStableNormalizedText(el);

  // Find nearest parent with an ID
  let parentId: string | undefined;
  let parent = el.parentElement;
  while (parent) {
    if (parent.id) {
      parentId = parent.id;
      break;
    }
    parent = parent.parentElement;
  }

  // Calculate index relative to the container
  const container = parent || document.body;
  const siblings = Array.from(container.querySelectorAll(tag));
  const index = siblings.indexOf(el);

  const descriptor: AnchorDescriptor = {
    tag,
    index: index !== -1 ? index : 0,
    textSnippet: normalizedText.substring(0, 32),
    textHash: hashCode(normalizedText),
    elementId: el.id,
  };

  if (parentId) {
    descriptor.parentId = parentId;
  }

  return descriptor;
}
