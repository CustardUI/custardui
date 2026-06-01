import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { type BoxColorKey } from '$features/box/services/box-colors';
import {
  type AnnotationCorner,
  DEFAULT_ANNOTATION_CORNER,
  MAX_ANNOTATION_LENGTH,
} from '$features/box/services/box-annotations';
import { showToast } from '$features/notifications/stores/toast-store.svelte';
import * as DomElementLocator from '$features/anchor';
import {
  calculateNewSelection,
  SELECTED_CLASS,
  BOX_TARGET_CLASS,
  HIDE_SELECTED_CLASS,
  HIDE_BOX_TARGET_CLASS,
  BOX_SELECTED_CLASS,
  BOX_TARGET_MODE_CLASS,
} from '../share-logic';

export type SelectionMode = 'show' | 'hide' | 'box' | 'highlight';

export class ShareStore {
  isActive = $state(false);
  selectionMode = $state<SelectionMode>('box');
  selectedElements = $state<SvelteSet<HTMLElement>>(new SvelteSet<HTMLElement>());
  currentHoverTarget = $state<HTMLElement | null>(null);
  boxColors = new SvelteMap<HTMLElement, BoxColorKey>();
  boxAnnotations = new SvelteMap<HTMLElement, { text: string; corner: AnnotationCorner }>();

  shareCount = $derived(this.selectedElements.size);

  toggleActive(active?: boolean) {
    const newState = active !== undefined ? active : !this.isActive;
    if (!newState) {
      // Cleanup on deactivate
      this.clearAllSelections();
      if (this.currentHoverTarget) {
        this._removeBoxHoverClass(this.currentHoverTarget);
      }

      // Reset state
      this.isActive = false;
      this.currentHoverTarget = null;
      document.body.classList.remove(
        'cv-share-active-show',
        'cv-share-active-hide',
        'cv-share-active-box',
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
      'cv-share-active-box',
      'cv-share-active-highlight',
    );
    document.body.classList.add(`cv-share-active-${this.selectionMode}`);
  }

  setHoverTarget(target: HTMLElement | null) {
    // In text highlight mode, element hover is completely disabled
    if (this.selectionMode === 'highlight') return;

    // Clear previous hover
    if (this.currentHoverTarget && this.currentHoverTarget !== target) {
      this._removeBoxHoverClass(this.currentHoverTarget);
    }

    // Set new hover
    if (target) {
      this._addBoxHoverClass(target);
    }

    this.currentHoverTarget = target;
  }

  toggleElementSelection(el: HTMLElement) {
    // In text highlight mode, element clicking is completely disabled
    if (this.selectionMode === 'highlight') return;

    const { updatedSelection, changesMade } = calculateNewSelection(this.selectedElements, el);

    if (changesMade) {
      // 1. Remove classes from elements no longer selected
      this.selectedElements.forEach((oldEl) => {
        if (!updatedSelection.has(oldEl)) {
          this._removeSelectionClass(oldEl);
          this.boxColors.delete(oldEl);
          this.boxAnnotations.delete(oldEl);
        }
      });

      // 2. Add classes to newly selected elements
      updatedSelection.forEach((newEl) => {
        if (!this.selectedElements.has(newEl)) {
          this._addSelectionClass(newEl);
        }
      });

      // 3. Update state
      this.selectedElements = updatedSelection;
    }
  }

  toggleMultipleElements(elements: HTMLElement[]) {
    for (const el of elements) {
      this.toggleElementSelection(el);
    }
  }

  clearAllSelections() {
    this.selectedElements.forEach((el) => this._removeSelectionClass(el));
    this.selectedElements.clear();
    this.boxColors.clear();
    this.boxAnnotations.clear();
  }

  setAnnotation(el: HTMLElement, text: string, corner: AnnotationCorner) {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      if (corner !== DEFAULT_ANNOTATION_CORNER) {
        this.boxAnnotations.set(el, { text: '', corner });
      } else {
        this.boxAnnotations.delete(el);
      }
    } else {
      const validatedText =
        trimmed.length > MAX_ANNOTATION_LENGTH
          ? trimmed.substring(0, MAX_ANNOTATION_LENGTH)
          : trimmed;
      this.boxAnnotations.set(el, { text: validatedText, corner });
    }
  }

  setBoxColor(el: HTMLElement, color: BoxColorKey) {
    this.boxColors.set(el, color);
  }

  setAllBoxColors(color: BoxColorKey) {
    this.selectedElements.forEach((el) => {
      this.boxColors.set(el, color);
    });
  }

  private _addBoxHoverClass(el: HTMLElement) {
    if (this.selectionMode === 'hide') {
      el.classList.add(HIDE_BOX_TARGET_CLASS);
    } else if (this.selectionMode === 'box') {
      el.classList.add(BOX_TARGET_MODE_CLASS);
    } else {
      el.classList.add(BOX_TARGET_CLASS);
    }
  }

  private _removeBoxHoverClass(el: HTMLElement) {
    el.classList.remove(BOX_TARGET_CLASS, HIDE_BOX_TARGET_CLASS, BOX_TARGET_MODE_CLASS);
  }

  private _addSelectionClass(el: HTMLElement) {
    if (this.selectionMode === 'hide') {
      el.classList.add(HIDE_SELECTED_CLASS);
    } else if (this.selectionMode === 'box') {
      el.classList.add(BOX_SELECTED_CLASS);
    } else {
      el.classList.add(SELECTED_CLASS);
    }
  }

  private _removeSelectionClass(el: HTMLElement) {
    el.classList.remove(SELECTED_CLASS, HIDE_SELECTED_CLASS, BOX_SELECTED_CLASS);
  }

  generateLink() {
    if (this.selectionMode === 'highlight') {
      showToast('Use the text selection toolbar to copy a highlight link.');
      return;
    }

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
    url.searchParams.delete('cv-box');

    if (this.selectionMode === 'hide') {
      url.searchParams.set('cv-hide', serialized);
    } else if (this.selectionMode === 'box') {
      url.searchParams.set('cv-box', serialized);
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
    if (this.selectionMode === 'highlight') {
      showToast('Use the text selection toolbar to preview a highlight link.');
      return;
    }

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
    url.searchParams.delete('cv-box');

    if (this.selectionMode === 'hide') {
      url.searchParams.set('cv-hide', serialized);
    } else if (this.selectionMode === 'box') {
      url.searchParams.set('cv-box', serialized);
    } else {
      url.searchParams.set('cv-show', serialized);
    }

    window.open(url.toString(), '_blank');
  }

  private _buildDescriptors(): DomElementLocator.AnchorDescriptor[] {
    return Array.from(this.selectedElements).map((el) => {
      const desc = DomElementLocator.createDescriptor(el);
      if (this.selectionMode === 'box') {
        const color = this.boxColors.get(el);
        if (color !== undefined) desc.color = color;
        const annotation = this.boxAnnotations.get(el);
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
