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
    expect(store.selectionMode).toBe('highlight');
    expect(store.selectedElements.size).toBe(0);
  });

  it('should activate and deactivate', () => {
    store.toggleActive(true);
    expect(store.isActive).toBe(true);
    expect(document.body.classList.contains('cv-share-active-highlight')).toBe(true);

    store.toggleActive(false);
    expect(store.isActive).toBe(false);
    expect(document.body.classList.contains('cv-share-active-highlight')).toBe(false);
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
    expect(el.classList.contains('cv-share-selected-highlight')).toBe(true);
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
    
    const ann = store.highlightAnnotations.get(el);
    expect(ann).toBeDefined();
    expect(ann?.text).toBe('Test Note');
    expect(ann?.corner).toBe('br');

    // Setting empty string should delete
    store.setAnnotation(el, '', 'tl');
    expect(store.highlightAnnotations.has(el)).toBe(false);
  });

  it('should set highlight colors for single and all elements', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    store.toggleMultipleElements([el1, el2]);

    store.setHighlightColor(el1, 'red');
    expect(store.highlightColors.get(el1)).toBe('red');
    expect(store.highlightColors.has(el2)).toBe(false);

    store.setAllHighlightColors('green');
    expect(store.highlightColors.get(el1)).toBe('green');
    expect(store.highlightColors.get(el2)).toBe('green');
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
      expect.stringContaining('cv-highlight=serialized-id'),
    );
  });

  it('should include metadata in generated link for highlight mode', async () => {
    store.setSelectionMode('highlight');
    
    const el = document.createElement('div');
    el.id = 'target-id';
    store.toggleElementSelection(el);
    store.setHighlightColor(el, 'blue');
    store.setAnnotation(el, 'Hello', 'tl');

    // Use actual createDescriptor to see if metadata is attached
    const createSpy = vi.spyOn(DomElementLocator, 'createDescriptor').mockImplementation((elParam) => {
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
});
