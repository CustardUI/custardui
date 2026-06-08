import { describe, it, expect } from 'vitest';
import {
  serializeTextHighlights,
  deserializeTextHighlights,
} from '$features/text-highlight/services/text-highlight-serializer';
import { type TextRangeDescriptor } from '$features/text-highlight/services/text-highlight-descriptor';

describe('text-highlight-serializer', () => {
  it('should serialize and deserialize a standard long highlight with elementId', () => {
    const desc: TextRangeDescriptor = {
      elementId: 'my-para',
      containerTag: 'P',
      containerIndex: 0,
      containerHash: 11111,
      startText: 'start of snippet',
      endText: 'end of snippet',
      textHash: 22222,
      textLength: 100,
      color: 'blue',
    };

    const serialized = serializeTextHighlights([desc]);
    // Expect: e:<startEnc>:<endEnc>:<textLen>:<elementId>:<containerHash>:<textHash>[:<color>]
    // encodeURIComponent('start of snippet') -> 'start%20of%20snippet', replacing %20 with space
    expect(serialized).toBe('e:start of snippet:end of snippet:100:my-para:11111:22222:blue');

    const deserialized = deserializeTextHighlights(serialized);
    expect(deserialized.length).toBe(1);

    // Check that it parsed successfully (ignoring containerTag/Index which aren't in elementId format)
    const result = deserialized[0]!;
    expect(result.elementId).toBe('my-para');
    expect(result.startText).toBe('start of snippet');
    expect(result.endText).toBe('end of snippet');
    expect(result.textHash).toBe(22222);
    expect(result.textLength).toBe(100);
    expect(result.color).toBe('blue');
  });

  it('should serialize and deserialize a short highlight (omits endText)', () => {
    const desc: TextRangeDescriptor = {
      elementId: 'my-para',
      containerTag: 'P',
      containerIndex: 0,
      containerHash: 11111,
      startText: 'short phrase',
      endText: 'short phrase', // identical to startText!
      textHash: 33333,
      textLength: 12,
    };

    const serialized = serializeTextHighlights([desc]);
    // It should omit endText resulting in double colon
    expect(serialized).toBe('e:short phrase::12:my-para:11111:33333');

    const deserialized = deserializeTextHighlights(serialized);
    expect(deserialized.length).toBe(1);

    // Check that it successfully cloned startText into endText
    const result = deserialized[0]!;
    expect(result.startText).toBe('short phrase');
    expect(result.endText).toBe('short phrase');
  });

  it('should serialize and deserialize container format', () => {
    const desc: TextRangeDescriptor = {
      containerId: 'parent-div',
      containerTag: 'LI',
      containerIndex: 2,
      containerHash: 44444,
      startText: 'bullet point',
      endText: 'bullet point', // test omit here too
      textHash: 55555,
      textLength: 12,
      color: 'orange',
    };

    const serialized = serializeTextHighlights([desc]);
    expect(serialized).toBe('c:bullet point::12:parent-div:LI:2:44444:55555:orange');

    const deserialized = deserializeTextHighlights(serialized);
    expect(deserialized.length).toBe(1);
    const result = deserialized[0]!;
    expect(result.containerId).toBe('parent-div');
    expect(result.containerTag).toBe('LI');
    expect(result.containerIndex).toBe(2);
    expect(result.startText).toBe('bullet point');
    expect(result.endText).toBe('bullet point');
    expect(result.color).toBe('orange');
  });

  it('should serialize and deserialize base64 JSON format (short omit)', () => {
    const desc: TextRangeDescriptor = {
      containerTag: 'SPAN',
      containerIndex: 0,
      containerHash: 66666,
      startText: 'no ID anywhere',
      endText: 'no ID anywhere',
      textHash: 77777,
      textLength: 14,
    };

    const serialized = serializeTextHighlights([desc]);
    // Verify it doesn't contain 'e:' or 'c:'
    expect(serialized).not.toContain('e:');
    expect(serialized).not.toContain('c:');

    const deserialized = deserializeTextHighlights(serialized);
    expect(deserialized.length).toBe(1);
    const result = deserialized[0]!;
    expect(result.containerTag).toBe('SPAN');
    expect(result.startText).toBe('no ID anywhere');
    expect(result.endText).toBe('no ID anywhere');
  });

  // ─── Annotation round-trip tests ─────────────────────────────────────────────

  it('should serialize and deserialize annotation with elementId format', () => {
    const desc: TextRangeDescriptor = {
      elementId: 'intro-para',
      containerTag: 'P',
      containerIndex: 0,
      containerHash: 12345,
      startText: 'important text',
      endText: 'important text',
      textHash: 67890,
      textLength: 14,
      color: 'yellow',
      annotation: 'This is a key point',
      annotationCorner: 'tr',
    };

    const serialized = serializeTextHighlights([desc]);
    // Annotation appended as :<corner>:<encodedNote>
    expect(serialized).toContain(':tr:');
    expect(serialized).toContain('This%20is%20a%20key%20point');

    const deserialized = deserializeTextHighlights(serialized);
    expect(deserialized.length).toBe(1);
    const result = deserialized[0]!;
    expect(result.annotation).toBe('This is a key point');
    expect(result.annotationCorner).toBe('tr');
  });

  it('should serialize and deserialize annotation with containerId format', () => {
    const desc: TextRangeDescriptor = {
      containerId: 'section-1',
      containerTag: 'P',
      containerIndex: 0,
      containerHash: 99999,
      startText: 'note this',
      endText: 'note this',
      textHash: 11111,
      textLength: 9,
      annotation: 'See related section',
      annotationCorner: 'bl',
    };

    const serialized = serializeTextHighlights([desc]);
    expect(serialized).toContain(':bl:');

    const deserialized = deserializeTextHighlights(serialized);
    const result = deserialized[0]!;
    expect(result.annotation).toBe('See related section');
    expect(result.annotationCorner).toBe('bl');
  });

  it('should serialize annotation with special characters (colons, unicode)', () => {
    const desc: TextRangeDescriptor = {
      elementId: 'special-para',
      containerTag: 'P',
      containerIndex: 0,
      containerHash: 33333,
      startText: 'test text',
      endText: 'test text',
      textHash: 44444,
      textLength: 9,
      annotation: 'Note: see section 3:4 → important!',
      annotationCorner: 'br',
    };

    const serialized = serializeTextHighlights([desc]);
    const deserialized = deserializeTextHighlights(serialized);
    const result = deserialized[0]!;
    // Colons in the note must survive the round-trip
    expect(result.annotation).toBe('Note: see section 3:4 → important!');
    expect(result.annotationCorner).toBe('br');
  });

  it('should not include annotation fields when annotation is absent', () => {
    const desc: TextRangeDescriptor = {
      elementId: 'plain-para',
      containerTag: 'P',
      containerIndex: 0,
      containerHash: 77777,
      startText: 'plain text',
      endText: 'plain text',
      textHash: 88888,
      textLength: 10,
    };

    const serialized = serializeTextHighlights([desc]);
    // Should not contain any corner keys as annotation suffix
    expect(serialized).not.toMatch(/:(tl|tr|bl|br):/);

    const deserialized = deserializeTextHighlights(serialized);
    const result = deserialized[0]!;
    expect(result.annotation).toBeUndefined();
    expect(result.annotationCorner).toBeUndefined();
  });

  it('should serialize annotation in base64 fallback format', () => {
    const desc: TextRangeDescriptor = {
      containerTag: 'DIV',
      containerIndex: 1,
      containerHash: 12321,
      startText: 'fallback text',
      endText: 'fallback text',
      textHash: 98789,
      textLength: 13,
      annotation: 'Base64 note',
      annotationCorner: 'tl',
    };

    const serialized = serializeTextHighlights([desc]);
    // Base64 format — no e: or c: prefix
    expect(serialized).not.toMatch(/^[ec]:/);

    const deserialized = deserializeTextHighlights(serialized);
    const result = deserialized[0]!;
    expect(result.annotation).toBe('Base64 note');
    expect(result.annotationCorner).toBe('tl');
  });
});
