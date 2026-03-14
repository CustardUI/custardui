import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { type HighlightColorKey } from '$features/highlight/services/highlight-colors';
import { type AnnotationCorner, DEFAULT_ANNOTATION_CORNER, MAX_ANNOTATION_LENGTH } from '$features/highlight/services/highlight-annotations';
import { showToast } from '$features/notifications/stores/toast-store.svelte';
import * as DomElementLocator from '$lib/utils/dom-element-locator';
import {
  calculateNewSelection,
  SELECTED_CLASS,
  HIGHLIGHT_TARGET_CLASS,
  HIDE_SELECTED_CLASS,
  HIDE_HIGHLIGHT_TARGET_CLASS,
  HIGHLIGHT_SELECTED_CLASS,
  HIGHLIGHT_TARGET_MODE_CLASS,
} from '../share-logic';

export type SelectionMode = 'show' | 'hide' | 'highlight';

export class ShareStore {
  isActive = $state(false);
  selectionMode = $state<SelectionMode>('highlight');
  selectedElements = $state<SvelteSet<HTMLElement>>(new SvelteSet<HTMLElement>());
  currentHoverTarget = $state<HTMLElement | null>(null);
  highlightColors = new SvelteMap<HTMLElement, HighlightColorKey>();
  highlightAnnotations = new SvelteMap<HTMLElement, { text: string; corner: AnnotationCorner }>();

  shareCount = $derived(this.selectedElements.size);

  toggleActive(active?: boolean) {
    const newState = active !== undefined ? active : !this.isActive;
    if (!newState) {
      // Cleanup on deactivate
      this.clearAllSelections();
      if (this.currentHoverTarget) {
        this._removeHighlightClass(this.currentHoverTarget);
      }

      // Reset state
      this.isActive = false;
      this.currentHoverTarget = null;
      document.body.classList.remove(
        'cv-share-active-show',
        'cv-share-active-hide',
        'cv-share-active-highlight',
      );
    } else {
      this.isActive = true;
      this.updateBodyClass();
    }
  }

  setSelectionMode(mode: SelectionMode) {
    if (this.selectionMode === mode) return;

    this.selectionMode = mode;

    // Update styling for all currently selected elements
    this.selectedElements.forEach((el) => {
      this._removeSelectionClass(el);
      this._addSelectionClass(el);
    });

    if (this.isActive) {
      this.updateBodyClass();
    }
  }

  updateBodyClass() {
    document.body.classList.remove(
      'cv-share-active-show',
      'cv-share-active-hide',
      'cv-share-active-highlight',
    );
    document.body.classList.add(`cv-share-active-${this.selectionMode}`);
  }

  setHoverTarget(target: HTMLElement | null) {
    // Clear previous highlight
    if (this.currentHoverTarget && this.currentHoverTarget !== target) {
      this._removeHighlightClass(this.currentHoverTarget);
    }

    // Set new highlight
    if (target) {
      this._addHighlightClass(target);
    }

    this.currentHoverTarget = target;
  }

  toggleElementSelection(el: HTMLElement) {
    const { updatedSelection, changesMade } = calculateNewSelection(this.selectedElements, el);

    if (changesMade) {
      // We need to sync the classes on the DOM elements
      // 1. Remove classes from elements that are no longer selected
      this.selectedElements.forEach((oldEl) => {
        if (!updatedSelection.has(oldEl)) {
          this._removeSelectionClass(oldEl);
          this.highlightColors.delete(oldEl);
          this.highlightAnnotations.delete(oldEl);
        }
      });

      // 2. Add classes to elements that are newly selected
      updatedSelection.forEach((newEl) => {
        if (!this.selectedElements.has(newEl)) {
          this._addSelectionClass(newEl);
        }
      });

      // 3. Update the state
      this.selectedElements = updatedSelection;
    }
  }

  toggleMultipleElements(elements: HTMLElement[]) {
    // TODO: Optimization: we could batch this in logic if needed, but simple iteration works for now
    for (const el of elements) {
      this.toggleElementSelection(el);
    }
  }

  clearAllSelections() {
    this.selectedElements.forEach((el) => this._removeSelectionClass(el));
    this.selectedElements.clear();
    this.highlightColors.clear();
    this.highlightAnnotations.clear();
  }

  setAnnotation(el: HTMLElement, text: string, corner: AnnotationCorner) {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      if (corner !== DEFAULT_ANNOTATION_CORNER) {
        this.highlightAnnotations.set(el, { text: '', corner });
      } else {
        this.highlightAnnotations.delete(el);
      }
    } else {
      const validatedText = trimmed.length > MAX_ANNOTATION_LENGTH
        ? trimmed.substring(0, MAX_ANNOTATION_LENGTH)
        : trimmed;
      this.highlightAnnotations.set(el, { text: validatedText, corner });
    }
  }

  setHighlightColor(el: HTMLElement, color: HighlightColorKey) {
    this.highlightColors.set(el, color);
  }

  setAllHighlightColors(color: HighlightColorKey) {
    this.selectedElements.forEach((el) => {
      this.highlightColors.set(el, color);
    });
  }

  private _addHighlightClass(el: HTMLElement) {
    if (this.selectionMode === 'hide') {
      el.classList.add(HIDE_HIGHLIGHT_TARGET_CLASS);
    } else if (this.selectionMode === 'highlight') {
      el.classList.add(HIGHLIGHT_TARGET_MODE_CLASS);
    } else {
      el.classList.add(HIGHLIGHT_TARGET_CLASS);
    }
  }

  private _removeHighlightClass(el: HTMLElement) {
    el.classList.remove(
      HIGHLIGHT_TARGET_CLASS,
      HIDE_HIGHLIGHT_TARGET_CLASS,
      HIGHLIGHT_TARGET_MODE_CLASS,
    );
  }

  private _addSelectionClass(el: HTMLElement) {
    if (this.selectionMode === 'hide') {
      el.classList.add(HIDE_SELECTED_CLASS);
    } else if (this.selectionMode === 'highlight') {
      el.classList.add(HIGHLIGHT_SELECTED_CLASS);
    } else {
      el.classList.add(SELECTED_CLASS);
    }
  }

  private _removeSelectionClass(el: HTMLElement) {
    el.classList.remove(SELECTED_CLASS, HIDE_SELECTED_CLASS, HIGHLIGHT_SELECTED_CLASS);
  }

  generateLink() {
    if (this.selectedElements.size === 0) {
      showToast('Please select at least one item.');
      return;
    }

    const descriptors = this._buildDescriptors();
    let serialized: string;
    try {
      serialized = DomElementLocator.serialize(descriptors);
    } catch {
      showToast('Failed to generate link. Please try selecting fewer items.');
      return;
    }

    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const url = new URL(window.location.href);

    // Clear all potential params first
    url.searchParams.delete('cv-show');
    url.searchParams.delete('cv-hide');
    url.searchParams.delete('cv-highlight');

    if (this.selectionMode === 'hide') {
      url.searchParams.set('cv-hide', serialized);
    } else if (this.selectionMode === 'highlight') {
      url.searchParams.set('cv-highlight', serialized);
    } else {
      url.searchParams.set('cv-show', serialized);
    }

    // Copy to clipboard
    navigator.clipboard
      .writeText(url.href)
      .then(() => {
        showToast('Link copied to clipboard!');
      })
      .catch(() => {
        showToast('Failed to copy to clipboard');
      });
  }

  previewLink() {
    if (this.selectedElements.size === 0) {
      showToast('Please select at least one item.');
      return;
    }

    const descriptors = this._buildDescriptors();
    const serialized = DomElementLocator.serialize(descriptors);

    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const url = new URL(window.location.href);
    url.searchParams.delete('cv-show');
    url.searchParams.delete('cv-hide');
    url.searchParams.delete('cv-highlight');

    if (this.selectionMode === 'hide') {
      url.searchParams.set('cv-hide', serialized);
    } else if (this.selectionMode === 'highlight') {
      url.searchParams.set('cv-highlight', serialized);
    } else {
      url.searchParams.set('cv-show', serialized);
    }

    window.open(url.toString(), '_blank');
  }

  private _buildDescriptors(): DomElementLocator.AnchorDescriptor[] {
    return Array.from(this.selectedElements).map((el) => {
      const desc = DomElementLocator.createDescriptor(el);
      if (this.selectionMode === 'highlight') {
        const color = this.highlightColors.get(el);
        if (color !== undefined) desc.color = color;
        const annotation = this.highlightAnnotations.get(el);
        if (annotation !== undefined) {
          desc.annotation = annotation.text;
          desc.annotationCorner = annotation.corner;
        }
      }
      return desc;
    });
  }
}

export const shareStore = new ShareStore();
