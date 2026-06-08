import { describe, it, expect, beforeEach } from 'vitest';
import { resolveDescriptor } from '$features/text-highlight/services/text-highlight-resolver';
import { type TextRangeDescriptor } from '$features/text-highlight/services/text-highlight-descriptor';
import { hashCode, getStableNormalizedText } from '$features/anchor/stable-text';

describe('text-highlight-resolver: resolveDescriptor', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="main-content">
        <p id="p1">First paragraph of text</p>
        <p id="p2">Second paragraph with some highlighted words right here.</p>
        <p id="p3">Third paragraph.</p>
      </div>
      <div id="other-content">
        <p>Unrelated text</p>
        <p>I moved the text right here for testing.</p>
      </div>
    `;
  });

  function createMockDescriptor(overrides: Partial<TextRangeDescriptor>): TextRangeDescriptor {
    return {
      elementId: 'p2',
      containerTag: 'P',
      containerIndex: 1,
      containerHash: 12345, // dummy
      startText: 'highlighted',
      endText: 'here.',
      textHash: 99999, // dummy
      textLength: 22,
      ...overrides,
    };
  }

  it('finds container by elementId and resolves text exactly', () => {
    // const p2 = document.getElementById('p2')!;
    const desc = createMockDescriptor({
      elementId: 'p2',
      startText: 'some highlighted',
      endText: 'right here.',
      textLength: 34,
      textHash: hashCode('some highlighted words right here.'),
    });

    const { range, verified } = resolveDescriptor(desc);

    expect(range).not.toBeNull();
    // Start index of "some" is 17, length is 54
    expect(range?.startOffset).toBe(22); // "some highlighted words right here." starts at index 22
    expect(range?.endOffset).toBe(56); // 22 + 34 = 56
    expect(verified).toBe(true);
  });

  it('falls back to container tag/index if elementId is missing', () => {
    const desc = createMockDescriptor({
      elementId: undefined, // no element ID
      containerId: 'main-content',
      containerTag: 'P',
      containerIndex: 1, // index 1 is <p id="p2">
      startText: 'Second paragraph',
      endText: 'Second paragraph', // short selection
      textLength: 16,
      textHash: hashCode('Second paragraph'),
    });

    const { range, verified } = resolveDescriptor(desc);

    expect(range).not.toBeNull();
    expect(range?.startContainer.parentElement?.id).toBe('p2');
    expect(range?.startOffset).toBe(0);
    expect(range?.endOffset).toBe(16);
    expect(verified).toBe(true);
  });

  it('scans siblings by containerHash if index moved (simulates rearranging paragraphs)', () => {
    // Delete p2 and move it to index 2
    document.body.innerHTML = `
      <div id="main-content">
        <p id="p1">First paragraph of text</p>
        <p id="p3">Third paragraph.</p>
        <p id="p2">Second paragraph with some highlighted words right here.</p>
      </div>
    `;

    const expectedHash = hashCode(getStableNormalizedText(document.getElementById('p2')!));

    const desc = createMockDescriptor({
      elementId: undefined,
      containerId: 'main-content',
      containerTag: 'P',
      containerIndex: 1, // originally index 1, but now it's index 2!
      containerHash: expectedHash,
      startText: 'highlighted words',
      endText: 'highlighted words',
      textLength: 17,
      textHash: hashCode('highlighted words'),
    });

    const { range, verified } = resolveDescriptor(desc);

    expect(range).not.toBeNull();
    // Successfully found the text in p2 even though the index was wrong!
    expect(range?.startContainer.parentElement?.id).toBe('p2');
    expect(range?.startOffset).toBe(27);
    expect(verified).toBe(true);
  });

  it('finds text gracefully if whitespace changed inside container (fuzzy search)', () => {
    // Modify p2 to have lots of spaces and line breaks
    document.getElementById('p2')!.innerHTML =
      'Second    paragraph \n\n with   some highlighted words \n right here.';

    const desc = createMockDescriptor({
      elementId: 'p2',
      startText: 'some highlighted words',
      endText: 'right here.',
      textLength: 35,
      // Original text hash without weird spaces
      textHash: hashCode('some highlighted words right here.'),
    });

    const { range, verified } = resolveDescriptor(desc);

    expect(range).not.toBeNull();
    // It should still find the text, though textHash match might fail
    // verified will be false if the text inside the bounds changed length/hash
    expect(verified).toBe(false);
    // Wait, the rawToNorm / normToRaw fuzzy search will locate the boundaries
    // We just verify it returns a valid range that captures the text
    expect(range?.toString().replace(/\s+/g, ' ')).toBe('some highlighted words right here.');
  });
});
