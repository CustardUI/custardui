import { type BoxColorKey } from '$features/box/services/box-colors';
import { type TextRangeDescriptor, SNIPPET_LENGTH } from './services/text-highlight-descriptor';
import { resolveDescriptor } from './services/text-highlight-resolver';
import { hashCode, getStableNormalizedText } from '$features/anchor/stable-text';

// Block-level tags we split selections on
const BLOCK_TAGS = new Set([
  'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'LI', 'BLOCKQUOTE', 'PRE', 'TD', 'TH',
  'DIV', 'SECTION', 'ARTICLE',
]);

const BLOCK_SELECTOR =
  'p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, td, th, div, section, article';

/**
 * Given a browser Selection, returns one TextRangeDescriptor per block-level
 * container the selection intersects.
 */
export function createDescriptors(selectionOrRange: Selection | Range): TextRangeDescriptor[] {
  const range = 
    'rangeCount' in selectionOrRange 
      ? (selectionOrRange.rangeCount > 0 ? selectionOrRange.getRangeAt(0) : null)
      : selectionOrRange;

  if (!range || range.collapsed) return [];

  const startBlock = findNearestBlock(range.startContainer);
  const endBlock = findNearestBlock(range.endContainer);
  if (!startBlock) return [];

  if (startBlock === endBlock) {
    const desc = descriptorForSubRange(range, startBlock);
    return desc ? [desc] : [];
  }

  // Multi-block: collect all block elements the range touches, in order
  const commonEl =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as HTMLElement)
      : range.commonAncestorContainer.parentElement!;

  const allBlocks = Array.from(commonEl.querySelectorAll(BLOCK_SELECTOR)) as HTMLElement[];

  const result: TextRangeDescriptor[] = [];
  let inRange = false;

  for (const block of allBlocks) {
    if (block === startBlock || block.contains(startBlock)) inRange = true;
    if (!inRange) continue;

    const sub = clipRangeToElement(range, block);
    if (sub && !sub.collapsed) {
      const desc = descriptorForSubRange(sub, block);
      if (desc) result.push(desc);
    }

    if (block === endBlock || block.contains(endBlock)) break;
  }

  // Fallback: no blocks enumerated → use startBlock
  if (result.length === 0) {
    const desc = descriptorForSubRange(range, startBlock);
    if (desc) result.push(desc);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function findNearestBlock(node: Node): HTMLElement | null {
  let cur: Node | null =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
  while (cur && cur !== document.body) {
    if (cur instanceof HTMLElement && BLOCK_TAGS.has(cur.tagName)) return cur;
    cur = (cur as HTMLElement).parentElement;
  }
  // Fall back to body
  return cur instanceof HTMLElement ? cur : document.body;
}

function clipRangeToElement(range: Range, el: HTMLElement): Range | null {
  try {
    const elRange = document.createRange();
    elRange.selectNodeContents(el);

    const clipped = document.createRange();

    // Start = max(range.start, el.start)
    if (range.compareBoundaryPoints(Range.START_TO_START, elRange) >= 0) {
      clipped.setStart(range.startContainer, range.startOffset);
    } else {
      clipped.setStart(elRange.startContainer, elRange.startOffset);
    }

    // End = min(range.end, el.end)
    if (range.compareBoundaryPoints(Range.END_TO_END, elRange) <= 0) {
      clipped.setEnd(range.endContainer, range.endOffset);
    } else {
      clipped.setEnd(elRange.endContainer, elRange.endOffset);
    }

    return clipped.collapsed ? null : clipped;
  } catch {
    return null;
  }
}

function descriptorForSubRange(
  range: Range,
  container: HTMLElement,
): TextRangeDescriptor | null {
  const rawText = range.toString();
  const selectedText = rawText.trim().replace(/\s+/g, ' ');
  if (selectedText.length === 0) return null;

  const stableText = getStableNormalizedText(container);
  const containerHash = hashCode(stableText);

  // Find element id (direct) and parent id (scope)
  const elementId = container.id || undefined;
  const containerId = findAncestorId(container);

  // Scope for index lookup: nearest id-bearing ancestor element (or body)
  const scope: HTMLElement =
    (containerId ? document.getElementById(containerId) : null) ?? document.body;
  const siblings = Array.from(scope.querySelectorAll(container.tagName)) as HTMLElement[];
  const containerIndex = Math.max(0, siblings.indexOf(container));

  const startText = selectedText.slice(0, SNIPPET_LENGTH);
  const endText =
    selectedText.length <= SNIPPET_LENGTH
      ? startText
      : selectedText.slice(-SNIPPET_LENGTH);

  const desc: TextRangeDescriptor = {
    containerTag: container.tagName,
    containerIndex,
    containerHash,
    startText,
    endText,
    textHash: hashCode(selectedText),
    textLength: selectedText.length,
  };
  if (elementId) desc.elementId = elementId;
  if (containerId) desc.containerId = containerId;
  return desc;
}

function findAncestorId(el: HTMLElement): string | undefined {
  let node = el.parentElement;
  while (node) {
    if (node.id) return node.id;
    node = node.parentElement;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Merging selections
// ---------------------------------------------------------------------------

/**
 * Merges a new DOM Range with existing TextRangeDescriptors.
 * Resolves overlaps, subsets, and contiguous highlights.
 * Returns null if the new selection is a complete subset of an existing highlight.
 */
export function mergeSelectionWithExisting(
  newRange: Range,
  existing: TextRangeDescriptor[],
  currentColor?: BoxColorKey
): TextRangeDescriptor[] | null {
  let mergedRange = newRange.cloneRange();
  const keepExisting: TextRangeDescriptor[] = [];

  for (const desc of existing) {
    const { range: existingRange } = resolveDescriptor(desc);

    if (!existingRange) {
      keepExisting.push(desc);
      continue;
    }

    if (rangesOverlapOrTouch(mergedRange, existingRange)) {
      const newStartsAfterOrAt = mergedRange.compareBoundaryPoints(Range.START_TO_START, existingRange) >= 0;
      const newEndsBeforeOrAt = mergedRange.compareBoundaryPoints(Range.END_TO_END, existingRange) <= 0;

      if (newStartsAfterOrAt && newEndsBeforeOrAt) {
        // Complete subset -> ignore new range entirely
        return null;
      }

      mergedRange = combineRanges(mergedRange, existingRange);
    } else {
      keepExisting.push(desc);
    }
  }

  const mergedDescriptors = createDescriptors(mergedRange);
  
  if (currentColor) {
    mergedDescriptors.forEach((d) => (d.color = currentColor));
  }

  return [...keepExisting, ...mergedDescriptors];
}

function rangesOverlapOrTouch(a: Range, b: Range): boolean {
  if (a.compareBoundaryPoints(Range.END_TO_START, b) < 0) return false;
  if (a.compareBoundaryPoints(Range.START_TO_END, b) > 0) return false;
  return true;
}

function combineRanges(a: Range, b: Range): Range {
  const combined = document.createRange();
  if (a.compareBoundaryPoints(Range.START_TO_START, b) <= 0) {
    combined.setStart(a.startContainer, a.startOffset);
  } else {
    combined.setStart(b.startContainer, b.startOffset);
  }

  if (a.compareBoundaryPoints(Range.END_TO_END, b) >= 0) {
    combined.setEnd(a.endContainer, a.endOffset);
  } else {
    combined.setEnd(b.endContainer, b.endOffset);
  }
  return combined;
}
