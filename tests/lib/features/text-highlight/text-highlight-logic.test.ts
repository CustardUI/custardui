import { describe, it, expect, beforeEach } from 'vitest';
import {
  mergeSelectionWithExisting,
  createDescriptors,
} from '$features/text-highlight/text-highlight-logic';

describe('text-highlight-logic: mergeSelectionWithExisting', () => {
  beforeEach(() => {
    // Setup a clean DOM
    document.body.innerHTML = `
      <div id="container">
        <p id="p1">Hello world this is a test</p>
        <p id="p2">0123456789</p>
      </div>
    `;
  });

  function getRange(pId: string, start: number, end: number) {
    const p = document.getElementById(pId)!;
    const textNode = p.firstChild!;
    const range = document.createRange();
    range.setStart(textNode, start);
    range.setEnd(textNode, end);
    return range;
  }

  it('adds a new highlight if no overlap', () => {
    const range1 = getRange('p1', 0, 5); // "Hello"
    const descriptors1 = createDescriptors(range1);

    const range2 = getRange('p1', 6, 11); // "world"
    const merged = mergeSelectionWithExisting(range2, descriptors1, 'yellow');

    expect(merged).not.toBeNull();
    expect(merged?.length).toBe(2);
  });

  it('returns null (ignores) if the new selection is an exact subset of an existing highlight', () => {
    const mainRange = getRange('p1', 0, 11); // "Hello world"
    const existingDescriptors = createDescriptors(mainRange);

    const subsetRange = getRange('p1', 6, 11); // "world"
    const merged = mergeSelectionWithExisting(subsetRange, existingDescriptors, 'blue');

    // Complete subsets are ignored, returning null
    expect(merged).toBeNull();
  });

  it('merges overlapping highlights correctly', () => {
    const range1 = getRange('p1', 0, 8); // "Hello wo"
    const existingDescriptors = createDescriptors(range1);

    const range2 = getRange('p1', 6, 11); // "world"
    const merged = mergeSelectionWithExisting(range2, existingDescriptors, 'red');

    expect(merged).not.toBeNull();
    expect(merged?.length).toBe(1);

    // The new descriptor should span the entire merged area (0 to 11)
    expect(merged![0].textLength).toBe(11); // "Hello world".length
    expect(merged![0].color).toBe('red');
  });

  it('merges contiguous (touching) highlights correctly', () => {
    const range1 = getRange('p1', 0, 5); // "Hello"
    const existingDescriptors = createDescriptors(range1);

    const range2 = getRange('p1', 5, 11); // " world"
    const merged = mergeSelectionWithExisting(range2, existingDescriptors, 'green');

    expect(merged).not.toBeNull();
    expect(merged?.length).toBe(1);
    expect(merged![0].textLength).toBe(11);
    expect(merged![0].color).toBe('green');
  });

  it('replaces identical highlights entirely', () => {
    const mainRange = getRange('p1', 0, 5); // "Hello"
    const existingDescriptors = createDescriptors(mainRange);

    const identicalRange = getRange('p1', 0, 5); // "Hello"
    const merged = mergeSelectionWithExisting(identicalRange, existingDescriptors, 'black');

    // The exact same range is technically a subset. According to the logic:
    // If it's a complete subset (newStartsAfterOrAt && newEndsBeforeOrAt), it ignores it (returns null).
    // This allows the user to click the same area without spawning duplicate markers.
    expect(merged).toBeNull();
  });
});
