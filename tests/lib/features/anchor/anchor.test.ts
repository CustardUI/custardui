// @vitest-environment jsdom
import * as Anchor from '$features/anchor';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Anchor', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('createDescriptor', () => {
    it('should create a correct descriptor for a simple paragraph', () => {
      container.innerHTML = `
                <p>First paragraph</p>
                <p id="target">Target paragraph with specific text content.</p>
                <p>Third paragraph</p>
            `;
      const target = document.getElementById('target')!;
      const descriptor = Anchor.createDescriptor(target);

      expect(descriptor.tag).toBe('P');
      expect(descriptor.index).toBe(1); // 0-indexed, so 2nd p is index 1
      expect(descriptor.parentId).toBe('test-container');
      // Check starts with because textSnippet is truncated
      expect(descriptor.textSnippet).toBe('Target paragraph with specific t'); // 32 chars
      expect(descriptor.textHash).not.toBe(0);
    });

    it('should correctly identify parent with ID', () => {
      container.innerHTML = `
                <div id="wrapper">
                    <section>
                        <p id="target">Nested paragraph</p>
                    </section>
                </div>
            `;
      const target = document.getElementById('target')!;
      const descriptor = Anchor.createDescriptor(target);

      expect(descriptor.parentId).toBe('wrapper');
    });

    it('should normalize text content', () => {
      container.innerHTML = `
                <p id="target">  Lots   of    spaces   </p>
            `;
      const target = document.getElementById('target')!;
      const descriptor = Anchor.createDescriptor(target);

      expect(descriptor.textSnippet).toBe('Lots of spaces');
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const original = {
        tag: 'DIV',
        index: 5,
        parentId: 'main-content',
        textSnippet: 'Some content snippet here',
        textHash: 123456,
      };

      const serialized = Anchor.serialize([original]);
      const deserializedList = Anchor.deserialize(serialized);

      expect(deserializedList).toHaveLength(1);
      expect(deserializedList[0]).toEqual(original);
    });

    it('should handle unicode characters', () => {
      const original = {
        tag: 'P',
        index: 0,
        parentId: 'test',
        textSnippet: 'Hello 🌍', // Unicode!
        textHash: 123,
      };

      const serialized = Anchor.serialize([original]);
      const deserializedList = Anchor.deserialize(serialized);

      expect(deserializedList[0]!.textSnippet).toBe('Hello 🌍');
    });

    it('should serialize and deserialize new metadata formats accurately', () => {
      const descriptors = [
        { elementId: 'id1', tag: 'ANY', index: 0, textSnippet: '', textHash: 0, color: 'blue' as const },
        { elementId: 'id2', tag: 'ANY', index: 0, textSnippet: '', textHash: 0, annotation: 'My note!', annotationCorner: 'br' as const },
        { elementId: 'id3', tag: 'ANY', index: 0, textSnippet: '', textHash: 0, color: 'blue' as const, annotation: 'Multi note: with colon', annotationCorner: 'tr' as const }
      ];

      const serialized = Anchor.serialize(descriptors);

      // Expected string format: id1:blue,id2::br:My%20note!,id3:blue:tr:Multi%20note%3A%20with%20colon
      expect(typeof serialized).toBe('string');
      expect(serialized.includes('id1:blue')).toBe(true);
      expect(serialized.includes('id2::br')).toBe(true);

      const deserializedList = Anchor.deserialize(serialized);

      expect(deserializedList).toHaveLength(3);

      // First object: color only
      expect(deserializedList[0]!.elementId).toBe('id1');
      expect(deserializedList[0]!.color).toBe('blue');
      expect(deserializedList[0]!.annotation).toBeUndefined();

      // Second object: note only
      expect(deserializedList[1]!.elementId).toBe('id2');
      expect(deserializedList[1]!.color).toBeUndefined();
      expect(deserializedList[1]!.annotation).toBe('My note!');
      expect(deserializedList[1]!.annotationCorner).toBe('br');

      // Third object: color + note + encoded colons
      expect(deserializedList[2]!.elementId).toBe('id3');
      expect(deserializedList[2]!.color).toBe('blue');
      expect(deserializedList[2]!.annotation).toBe('Multi note: with colon');
      expect(deserializedList[2]!.annotationCorner).toBe('tr');
    });
  });

  describe('placeholder hashing stability', () => {
    describe('createDescriptor hash stability', () => {
      it('A1: hydrated placeholder produces canonical hash', () => {
        container.innerHTML = `<p id="target">Hello <cv-placeholder name="username">alice</cv-placeholder>!</p>`;
        const target = document.getElementById('target')!;
        const descriptor = Anchor.createDescriptor(target);

        // Build a reference descriptor from the canonical raw-token form
        const refDiv = document.createElement('div');
        refDiv.innerHTML = `<p>Hello [[username]]!</p>`;
        const refDescriptor = Anchor.createDescriptor(refDiv.querySelector('p')!);

        expect(descriptor.textHash).toBe(refDescriptor.textHash);
        expect(descriptor.textSnippet).toBe(refDescriptor.textSnippet);
      });

      it('A2: different runtime values produce identical hash and snippet', () => {
        container.innerHTML = `<p id="a">Hello <cv-placeholder name="username">alice</cv-placeholder>!</p>`;
        const elA = document.getElementById('a')!;
        const descriptorA = Anchor.createDescriptor(elA);

        container.innerHTML = `<p id="b">Hello <cv-placeholder name="username">bob</cv-placeholder>!</p>`;
        const elB = document.getElementById('b')!;
        const descriptorB = Anchor.createDescriptor(elB);

        expect(descriptorA.textHash).toBe(descriptorB.textHash);
        expect(descriptorA.textSnippet).toBe(descriptorB.textSnippet);
      });

      it('A3: un-hydrated raw token produces same hash as hydrated', () => {
        container.innerHTML = `<p id="hydrated">Hello <cv-placeholder name="username">alice</cv-placeholder>!</p>`;
        const hydratedEl = document.getElementById('hydrated')!;
        const hydratedDescriptor = Anchor.createDescriptor(hydratedEl);

        container.innerHTML = `<p id="raw">Hello [[ username ]]!</p>`;
        const rawEl = document.getElementById('raw')!;
        const rawDescriptor = Anchor.createDescriptor(rawEl);

        expect(hydratedDescriptor.textHash).toBe(rawDescriptor.textHash);
        expect(hydratedDescriptor.textSnippet).toBe(rawDescriptor.textSnippet);
      });

      it('A4: raw token with fallback produces same hash as bare raw token', () => {
        container.innerHTML = `<p id="fallback">Hello [[ username : Guest ]]!</p>`;
        const fallbackEl = document.getElementById('fallback')!;
        const fallbackDescriptor = Anchor.createDescriptor(fallbackEl);

        container.innerHTML = `<p id="bare">Hello [[ username ]]!</p>`;
        const bareEl = document.getElementById('bare')!;
        const bareDescriptor = Anchor.createDescriptor(bareEl);

        expect(fallbackDescriptor.textHash).toBe(bareDescriptor.textHash);
        expect(fallbackDescriptor.textSnippet).toBe(bareDescriptor.textSnippet);
      });

      it('A5: multiple placeholders each normalized independently', () => {
        container.innerHTML = `<p id="hydrated">Dear <cv-placeholder name="first">John</cv-placeholder> <cv-placeholder name="last">Doe</cv-placeholder>!</p>`;
        const hydratedEl = document.getElementById('hydrated')!;
        const hydratedDescriptor = Anchor.createDescriptor(hydratedEl);

        container.innerHTML = `<p id="raw">Dear [[ first ]] [[ last ]]!</p>`;
        const rawEl = document.getElementById('raw')!;
        const rawDescriptor = Anchor.createDescriptor(rawEl);

        expect(hydratedDescriptor.textHash).toBe(rawDescriptor.textHash);
        expect(hydratedDescriptor.textSnippet).toBe(rawDescriptor.textSnippet);
      });

      it('A6: plain text (no placeholders) fast path unchanged', () => {
        container.innerHTML = `<p id="target">No placeholders here</p>`;
        const target = document.getElementById('target')!;
        const descriptor = Anchor.createDescriptor(target);

        expect(descriptor.textHash).not.toBe(0);
        expect(descriptor.textSnippet).toBe('No placeholders here');
      });

      it('A8: createDescriptor on cv-placeholder element itself produces canonical hash', () => {
        const ph = document.createElement('cv-placeholder') as HTMLElement;
        ph.setAttribute('name', 'username');
        ph.textContent = 'alice'; // runtime resolved value
        container.appendChild(ph);
        const descriptor = Anchor.createDescriptor(ph);

        expect(descriptor.textHash).toBe(Anchor.createDescriptor(
          Object.assign(document.createElement('div'), { textContent: '[[username]]' })
        ).textHash);
        expect(descriptor.textSnippet).toBe('[[username]]');
      });

      it('A7: escaped raw token has same hash as its post-PlaceholderBinder literal form', () => {
        // Raw DOM: escaped token \[[ username ]] — before PlaceholderBinder runs
        container.innerHTML = `<p id="raw">Hello \\[[ username ]]!</p>`;
        const rawEl = document.getElementById('raw')!;
        const rawDescriptor = Anchor.createDescriptor(rawEl);

        // Hydrated DOM: PlaceholderBinder strips the backslash via fullMatch.slice(1),
        // leaving the literal text [[ username ]] (with original spacing)
        container.innerHTML = `<p id="hydrated">Hello [[ username ]]!</p>`;
        const hydratedEl = document.getElementById('hydrated')!;
        const hydratedDescriptor = Anchor.createDescriptor(hydratedEl);

        expect(rawDescriptor.textHash).toBe(hydratedDescriptor.textHash);
      });
    });

    describe('resolve cross-state resolution', () => {
      it('B1: descriptor from hydrated element resolves against differently-hydrated DOM', () => {
        container.innerHTML = `<p>Hello <cv-placeholder name="username">alice</cv-placeholder>!</p>`;
        const sourceEl = container.querySelector('p')!;
        const descriptor = Anchor.createDescriptor(sourceEl);

        container.innerHTML = `<p>Hello <cv-placeholder name="username">bob</cv-placeholder>!</p>`;
        const targetEl = container.querySelector('p')!;

        const resolved = Anchor.resolve(container, descriptor);
        expect(resolved).toHaveLength(1);
        expect(resolved[0]).toBe(targetEl);
      });

      it('B2: descriptor from hydrated element resolves against un-hydrated DOM', () => {
        container.innerHTML = `<p>Hello <cv-placeholder name="username">alice</cv-placeholder>!</p>`;
        const sourceEl = container.querySelector('p')!;
        const descriptor = Anchor.createDescriptor(sourceEl);

        container.innerHTML = `<p>Hello [[ username ]]!</p>`;
        const targetEl = container.querySelector('p')!;

        const resolved = Anchor.resolve(container, descriptor);
        expect(resolved).toHaveLength(1);
        expect(resolved[0]).toBe(targetEl);
      });

      it('B3: descriptor from un-hydrated DOM resolves against hydrated DOM', () => {
        container.innerHTML = `<p>Hello [[ username ]]!</p>`;
        const sourceEl = container.querySelector('p')!;
        const descriptor = Anchor.createDescriptor(sourceEl);

        container.innerHTML = `<p>Hello <cv-placeholder name="username">alice</cv-placeholder>!</p>`;
        const targetEl = container.querySelector('p')!;

        const resolved = Anchor.resolve(container, descriptor);
        expect(resolved).toHaveLength(1);
        expect(resolved[0]).toBe(targetEl);
      });
    });
  });

  describe('resolve - CSS-special-character IDs', () => {
    it('should resolve when parentId contains a dot (e.g. "topic-W10.1d")', () => {
      // Regression: querySelector(`#topic-W10.1d`) throws SyntaxError — must use getElementById
      const wrapper = document.createElement('div');
      wrapper.id = 'topic-W10.1d';
      container.appendChild(wrapper);
      wrapper.innerHTML = `<p>Section content</p>`;

      const target = wrapper.querySelector('p') as HTMLElement;
      const descriptor = Anchor.createDescriptor(target);

      expect(descriptor.parentId).toBe('topic-W10.1d');
      // Should not throw and should resolve the element
      expect(() => Anchor.resolve(container, descriptor)).not.toThrow();
      const resolved = Anchor.resolve(container, descriptor);
      expect(resolved).toHaveLength(1);
      expect(resolved[0]).toBe(target);
    });

    it('should resolve when parentId contains brackets (e.g. "section[1]")', () => {
      const wrapper = document.createElement('div');
      wrapper.id = 'section[1]';
      container.appendChild(wrapper);
      wrapper.innerHTML = `<p>Bracketed section content</p>`;

      const target = wrapper.querySelector('p') as HTMLElement;
      const descriptor = Anchor.createDescriptor(target);

      expect(() => Anchor.resolve(container, descriptor)).not.toThrow();
      const resolved = Anchor.resolve(container, descriptor);
      expect(resolved).toHaveLength(1);
      expect(resolved[0]).toBe(target);
    });

    it('should resolve when parentId contains a colon (e.g. "ns:section")', () => {
      const wrapper = document.createElement('div');
      wrapper.id = 'ns:section';
      container.appendChild(wrapper);
      wrapper.innerHTML = `<p>Colon section content</p>`;

      const target = wrapper.querySelector('p') as HTMLElement;
      const descriptor = Anchor.createDescriptor(target);

      expect(() => Anchor.resolve(container, descriptor)).not.toThrow();
      const resolved = Anchor.resolve(container, descriptor);
      expect(resolved).toHaveLength(1);
      expect(resolved[0]).toBe(target);
    });
  });

  describe('resolve', () => {
    it('should resolve exact match with high score', () => {
      container.innerHTML = `
                <p>Wrong One</p>
                <p>Correct One</p>
                <p>Another Wrong One</p>
            `;
      const targetEl = container.querySelectorAll('p')[1] as HTMLElement;
      // Manually creating descriptor to simulate "previous state"
      const descriptor = Anchor.createDescriptor(targetEl);

      const resolved = Anchor.resolve(container, descriptor);
      expect(resolved).toHaveLength(1);
      expect(resolved[0]).toBe(targetEl);
    });

    it('should resolve even if index changes (Robustness)', () => {
      container.innerHTML = `
                <p>New Inserted Paragraph</p>
                <p>Wrong One</p>
                <p>Correct One</p>
            `;
      // Original descriptor was index 1, "Correct One"
      // Now "Correct One" is index 2.

      // We create a temporary element to get a valid hash/snippet
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = '<p>Correct One</p>';
      const baseDescriptor = Anchor.createDescriptor(tempDiv.querySelector('p')!);

      const descriptor = {
        ...baseDescriptor,
        index: 1, // Old index (where "Wrong One" is now)
        parentId: 'test-container',
      };

      const resolved = Anchor.resolve(container, descriptor);

      // Should still find it because content match
      expect(resolved).toHaveLength(1);
      expect(resolved[0]?.textContent).toBe('Correct One');
    });

    it('should return null if score is too low', () => {
      container.innerHTML = `<p>Completely different content</p>`;
      const descriptor = {
        tag: 'P',
        index: 5,
        parentId: 'test-container',
        textSnippet: 'Missing content',
        textHash: 99999,
      };
      const resolved = Anchor.resolve(container, descriptor);
      expect(resolved).toHaveLength(0);
    });
  });
});
