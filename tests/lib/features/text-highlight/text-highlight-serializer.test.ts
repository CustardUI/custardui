import { describe, it, expect } from 'vitest';
import { serializeTextHighlights, deserializeTextHighlights } from '$features/text-highlight/services/text-highlight-serializer';
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
      color: 'blue'
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
      color: 'red'
    };

    const serialized = serializeTextHighlights([desc]);
    expect(serialized).toBe('c:bullet point::12:parent-div:LI:2:44444:55555:red');

    const deserialized = deserializeTextHighlights(serialized);
    expect(deserialized.length).toBe(1);
    const result = deserialized[0]!;
    expect(result.containerId).toBe('parent-div');
    expect(result.containerTag).toBe('LI');
    expect(result.containerIndex).toBe(2);
    expect(result.startText).toBe('bullet point');
    expect(result.endText).toBe('bullet point');
    expect(result.color).toBe('red');
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
});
