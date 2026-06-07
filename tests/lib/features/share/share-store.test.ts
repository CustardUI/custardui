// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShareStore } from '$features/share/stores/share-store.svelte';

import * as DomElementLocator from '$features/anchor';

describe('ShareStore', () => {
  let store: ShareStore;

  beforeEach(() => {
    store = new ShareStore();
    document.body.className = '';
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should initialize inactive', () => {
    expect(store.isActive).toBe(false);
    expect(store.selectionMode).toBe('box');
    expect(store.selectedElements.size).toBe(0);
  });

  it('should activate and deactivate', () => {
    store.toggleActive(true);
    expect(store.isActive).toBe(true);
    expect(document.body.classList.contains('cv-share-active-box')).toBe(true);

    store.toggleActive(false);
    expect(store.isActive).toBe(false);
    expect(document.body.classList.contains('cv-share-active-box')).toBe(false);
  });

  it('should change selection mode', () => {
    store.toggleActive(true);
    store.setSelectionMode('hide');
    expect(store.selectionMode).toBe('hide');
    expect(document.body.classList.contains('cv-share-active-hide')).toBe(true);
    expect(document.body.classList.contains('cv-share-active-show')).toBe(false);
  });

  it('should select elements (delegate to logic)', () => {
    const el = document.createElement('div');
    store.toggleElementSelection(el);

    expect(store.selectedElements.has(el)).toBe(true);
    expect(el.classList.contains('cv-share-selected-box')).toBe(true);
  });

  it('should toggle selection off', () => {
    const el = document.createElement('div');
    store.toggleElementSelection(el);
    store.toggleElementSelection(el);

    expect(store.selectedElements.has(el)).toBe(false);
    expect(el.classList.contains('cv-share-selected')).toBe(false);
  });

  it('should set and clear highlight annotations', () => {
    const el = document.createElement('div');
    store.setAnnotation(el, 'Test Note', 'br');

    const ann = store.boxAnnotations.get(el);
    expect(ann).toBeDefined();
    expect(ann?.text).toBe('Test Note');
    expect(ann?.corner).toBe('br');

    // Setting empty string should delete
    store.setAnnotation(el, '', 'tl');
    expect(store.boxAnnotations.has(el)).toBe(false);
  });

  it('should set highlight colors for single and all elements', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    store.toggleMultipleElements([el1, el2]);

    store.setBoxColor(el1, 'red');
    expect(store.boxColors.get(el1)).toBe('red');
    expect(store.boxColors.has(el2)).toBe(false);

    store.setAllBoxColors('green');
    expect(store.boxColors.get(el1)).toBe('green');
    expect(store.boxColors.get(el2)).toBe('green');
  });

  it('should generate link', async () => {
    const el = document.createElement('div');
    el.id = 'test-id';
    store.toggleElementSelection(el);

    // Mock createDescriptor to avoid complex DOM resolution logic issues in JSDOM
    vi.spyOn(DomElementLocator, 'createDescriptor').mockReturnValue({
      type: 'id',
      val: 'test-id',
    } as unknown as DomElementLocator.AnchorDescriptor);
    vi.spyOn(DomElementLocator, 'serialize').mockReturnValue('serialized-id');

    await store.generateLink();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('cv-box=serialized-id'),
    );
  });

  it('should include metadata in generated link for highlight mode', async () => {
    store.setSelectionMode('box');

    const el = document.createElement('div');
    el.id = 'target-id';
    store.toggleElementSelection(el);
    store.setBoxColor(el, 'blue');
    store.setAnnotation(el, 'Hello', 'tl');

    // Use actual createDescriptor to see if metadata is attached
    const createSpy = vi
      .spyOn(DomElementLocator, 'createDescriptor')
      .mockImplementation((elParam) => {
        return { elementId: elParam.id, tag: 'ANY', index: 0, textSnippet: '', textHash: 0 };
      });

    // We mock serialize to intercept the descriptors Array
    let capturedDescriptors: DomElementLocator.AnchorDescriptor[] = [];
    vi.spyOn(DomElementLocator, 'serialize').mockImplementation((descriptors) => {
      capturedDescriptors = descriptors;
      return 'fake';
    });

    await store.generateLink();

    expect(capturedDescriptors).toHaveLength(1);
    expect(capturedDescriptors[0]!.color).toBe('blue');
    expect(capturedDescriptors[0]!.annotation).toBe('Hello');
    expect(capturedDescriptors[0]!.annotationCorner).toBe('tl');

    createSpy.mockRestore();
  });

  it('should generate link for text highlight mode', async () => {
    store.setSelectionMode('highlight');
    store.textHighlights = [
      {
        elementId: 'para-id',
        containerTag: 'P',
        containerIndex: 0,
        containerHash: 1234,
        startText: 'Hello',
        endText: 'World',
        textHash: 5678,
        textLength: 11,
        color: 'blue',
      },
    ];

    await store.generateLink();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('cv-highlight=e%3AHello%3AWorld%3A11%3Apara-id%3A1234%3A5678%3Ablue'),
    );
  });
});
