/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount, unmount } from 'svelte';
import { showToast } from '$features/notifications/stores/toast-store.svelte';
import { focusStore } from '$features/focus/stores/focus-store.svelte';
import * as DomElementLocator from '$lib/utils/dom-element-locator';
import { activeStateStore } from '$lib/stores/active-state-store.svelte';
import { derivedStore } from '$lib/stores/derived-store.svelte';
import HighlightOverlay from '$features/highlight/HighlightOverlay.svelte';
import { groupSiblings, calculateMergedRects } from '../highlight-logic';

export const HIGHLIGHT_PARAM = 'cv-highlight';

export const BODY_HIGHLIGHT_CLASS = 'cv-highlight-mode';
const ARROW_OVERLAY_ID = 'cv-highlight-overlay';

import { type RectData } from './highlight-types';
import { type HighlightColorKey } from './highlight-colors';
import { type AnnotationCorner, DEFAULT_ANNOTATION_CORNER } from './highlight-annotations';

export class HighlightState {
  rects = $state<RectData[]>([]);
}

export class HighlightService {
  private overlayApp: any;
  private state = new HighlightState();
  private resizeObserver: ResizeObserver;
  private activeTargets: HTMLElement[] = [];
  private activeColors: Map<HTMLElement, HighlightColorKey> = new Map();
  private activeAnnotations: Map<HTMLElement, { text: string; corner: AnnotationCorner }> = new Map();
  private onWindowResize = () => this.updatePositions();

  constructor(private rootEl: HTMLElement) {
    this.resizeObserver = new ResizeObserver(() => {
      this.updatePositions();
    });
  }

  public resolveTargets(encodedDescriptors: string): HTMLElement[] {
    const descriptors = DomElementLocator.deserialize(encodedDescriptors);
    if (!descriptors || descriptors.length === 0) return [];
    const targets: HTMLElement[] = [];
    descriptors.forEach((desc) => {
      const matchingEls = DomElementLocator.resolve(this.rootEl, desc);
      if (matchingEls && matchingEls.length > 0) targets.push(...matchingEls);
    });
    return targets;
  }

  public applyEncodedHighlights(encodedDescriptors: string): void {
    const descriptors = DomElementLocator.deserialize(encodedDescriptors);
    if (!descriptors || descriptors.length === 0) return;

    const targets: HTMLElement[] = [];
    const colors = new Map<HTMLElement, HighlightColorKey>();
    const annotations = new Map<HTMLElement, { text: string; corner: AnnotationCorner }>();
    descriptors.forEach((desc) => {
      const matchingEls = DomElementLocator.resolve(this.rootEl, desc);
      if (matchingEls && matchingEls.length > 0) {
        targets.push(...matchingEls);
        if (desc.color) {
          matchingEls.forEach((el) => colors.set(el, desc.color!));
        }
        if (desc.annotation || desc.annotationCorner) {
          matchingEls.forEach((el) =>
            annotations.set(el, {
              text: desc.annotation ?? '',
              corner: desc.annotationCorner ?? DEFAULT_ANNOTATION_CORNER,
            }),
          );
        }
      }
    });

    if (targets.length === 0) {
      showToast('Some highlighted sections could not be found.');
      this.exit();
      return;
    }

    if (targets.length < descriptors.length) {
      showToast('Some highlighted sections could not be found.');
    }

    // Activate Store
    focusStore.setIsActive(true);
    document.body.classList.add(BODY_HIGHLIGHT_CLASS);

    // Create Overlay across the entire page (App will be mounted into it)
    this.activeTargets = targets;
    this.activeColors = colors;
    this.activeAnnotations = annotations;

    // Start observing
    this.activeTargets.forEach((t) => this.resizeObserver.observe(t));
    this.resizeObserver.observe(document.body); // Catch layout shifts
    window.addEventListener('resize', this.onWindowResize);

    this.renderHighlightOverlay();

    // Scroll topmost highlighted box into view
    const firstRect = this.state.rects[0];
    if (firstRect) {
      this.scrollToTargetSafely(firstRect.element);
    }
  }

  public exit(): void {
    document.body.classList.remove(BODY_HIGHLIGHT_CLASS);

    this.resizeObserver.disconnect();
    window.removeEventListener('resize', this.onWindowResize);
    this.activeTargets = [];
    this.activeColors.clear();
    this.activeAnnotations.clear();
    this.state.rects = [];

    const overlay = document.getElementById(ARROW_OVERLAY_ID);
    if (this.overlayApp) {
      unmount(this.overlayApp);
      this.overlayApp = undefined;
    }
    if (overlay) overlay.remove();
  }

  private renderHighlightOverlay() {
    let overlay = document.getElementById(ARROW_OVERLAY_ID);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = ARROW_OVERLAY_ID;
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = '';

    // Initial calc
    this.updatePositions();

    // 2. Render Overlay Component
    if (this.overlayApp) {
      unmount(this.overlayApp);
    }
    this.overlayApp = mount(HighlightOverlay, {
      target: overlay,
      props: {
        box: this.state,
      },
    });
  }

  private async scrollToTarget(element: HTMLElement): Promise<void> {
    const currentShown = activeStateStore.state.shownToggles ?? [];
    const currentPeek = activeStateStore.state.peekToggles ?? [];

    // Walk ancestors, collecting toggle IDs that need expansion
    const needsExpansion: string[] = [];
    let current: HTMLElement | null = element.parentElement;
    while (current) {
      if (current.tagName.toLowerCase() === 'cv-toggle') {
        (current.getAttribute('toggle-id') || '').split(/\s+/).filter(Boolean).forEach((id) => {
          if (!currentShown.includes(id)) needsExpansion.push(id);
        });
      }
      current = current.parentElement;
    }

    // Expand any collapsed/peek ancestor toggles
    if (needsExpansion.length > 0) {
      activeStateStore.setToggles(
        [...new Set([...currentShown, ...needsExpansion])],
        currentPeek.filter((id) => !needsExpansion.includes(id)),
      );
    }

    // Wait for CSS transitions if any toggles are peek, were just expanded, or are hidden (collapsing)
    if (needsExpansion.length > 0 || currentPeek.length > 0 || derivedStore.hiddenToggleIds.length > 0) {
      // 350ms = 300ms CSS transition + 50ms buffer
      await new Promise<void>((resolve) => setTimeout(resolve, 350));
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private scrollToTargetSafely(target: HTMLElement): void {
    void this.scrollToTarget(target).catch((error) => {
      console.error('Failed to scroll to target', error);
    });
  }

  private updatePositions() {
    if (this.activeTargets.length === 0) {
      this.state.rects = [];
      return;
    }

    // Group by Parent (Siblings)
    const groups = groupSiblings(this.activeTargets);

    // Calculate Union Rect for each group, sorted top-to-bottom
    this.state.rects = calculateMergedRects(
      groups,
      (el) => el.getBoundingClientRect(),
      () => ({
        scrollTop: window.pageYOffset || document.documentElement.scrollTop,
        scrollLeft: window.pageXOffset || document.documentElement.scrollLeft,
      }),
      this.activeColors,
      this.activeAnnotations,
    ).sort((a, b) => a.top - b.top);
  }
}
