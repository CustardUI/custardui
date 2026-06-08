import { SvelteMap } from 'svelte/reactivity';
import { mount, unmount } from 'svelte';
import { showToast } from '$features/notifications/stores/toast-store.svelte';
import { resolveDescriptor } from './text-highlight-resolver';
import { deserializeTextHighlights } from './text-highlight-serializer';
import { type TextRangeDescriptor } from './text-highlight-descriptor';
import { type AnnotationColorKey } from '$features/annotations/annotation-colors';
import { DEFAULT_ANNOTATION_CORNER } from '$features/annotations/annotation-types';
import Annotation from '$features/annotations/Annotation.svelte';

// ─── CSS Custom Highlight API ─────────────────────────────────────────────────
// Use a module-level interface augmentation so we avoid repeated unsafe casts.

interface HighlightLike {
  add(range: Range): void;
}

interface HighlightRegistryLike {
  set(name: string, hl: HighlightLike): void;
  delete(name: string): boolean;
}

/** Whether the browser supports the CSS Custom Highlight API. */
export const CSS_HIGHLIGHT_SUPPORTED: boolean = typeof CSS !== 'undefined' && 'highlights' in CSS;

function getHighlightRegistry(): HighlightRegistryLike | null {
  if (!CSS_HIGHLIGHT_SUPPORTED) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (CSS as any).highlights as HighlightRegistryLike;
}

function createHighlight(): HighlightLike | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).Highlight === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (globalThis as any).Highlight() as HighlightLike;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const HIGHLIGHT_CSS = `
::highlight(cv-hl-orange) {
  background-color: rgba(255, 158, 94, 0.45);
  color: inherit;
}
::highlight(cv-hl-green) {
  background-color: rgba(226, 240, 115, 0.45);
  color: inherit;
}
::highlight(cv-hl-pink) {
  background-color: rgba(255, 126, 179, 0.45);
  color: inherit;
}
::highlight(cv-hl-yellow) {
  background-color: rgba(255, 212, 71, 0.45);
  color: inherit;
}
::highlight(cv-hl-blue) {
  background-color: rgba(126, 224, 245, 0.45);
  color: inherit;
}
`.trim();

const FALLBACK_CSS = `
.cv-hl-fallback {
  border-radius: 2px;
  padding: 2px 2px;
  clip-path: polygon(3px 0%, 100% 2px, calc(100% - 3px) 100%, 0% calc(100% - 2px));
  mix-blend-mode: multiply;
}
.cv-hl-fallback--orange {
  background-color: rgba(255, 158, 94, 0.45);
  color: inherit;
}
.cv-hl-fallback--green {
  background-color: rgba(226, 240, 115, 0.45);
  color: inherit;
}
.cv-hl-fallback--pink {
  background-color: rgba(255, 126, 179, 0.45);
  color: inherit;
}
.cv-hl-fallback--yellow {
  background-color: rgba(255, 212, 71, 0.45);
  color: inherit;
}
.cv-hl-fallback--blue {
  background-color: rgba(126, 224, 245, 0.45);
  color: inherit;
}
`.trim();

let styleInjected = false;

function ensureStyle() {
  if (styleInjected) return;
  styleInjected = true;
  const el = document.createElement('style');
  el.id = 'cv-text-highlight-styles';
  el.textContent = CSS_HIGHLIGHT_SUPPORTED ? HIGHLIGHT_CSS : FALLBACK_CSS;
  document.head.appendChild(el);
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class TextHighlightService {
  private hlMap = new SvelteMap<string, HighlightLike>();
  private marks: HTMLElement[] = [];
  private active = false;

  get isActive() {
    return this.active;
  }

  /** Resolved ranges indexed by descriptor position, for annotation positioning. */
  private resolvedRanges: (Range | null)[] = [];

  /** Mounted BoxAnnotation overlay wrappers. */
  private annotationWrappers: HTMLElement[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private annotationComponents: any[] = [];
  
  /** Tracks wrappers with their underlying range so they can be repositioned on resize/zoom */
  private activeAnnotations: { range: Range; wrapper: HTMLElement }[] = [];

  private _resizeListener = () => {
    requestAnimationFrame(() => this.repositionAnnotations());
  };

  private repositionAnnotations() {
    if (!this.active) return;
    for (const { range, wrapper } of this.activeAnnotations) {
      const rect = range.getBoundingClientRect();
      wrapper.style.top = `${rect.top + window.scrollY}px`;
      wrapper.style.left = `${rect.left + window.scrollX}px`;
      wrapper.style.width = `${rect.width}px`;
      wrapper.style.height = `${rect.height}px`;
    }
  }

  /**
   * Parse an encoded string (from ?cv-highlight=…) and apply highlights.
   * Returns the first resolved Range for scrolling.
   */
  applyEncoded(encoded: string): Range | null {
    const descriptors = deserializeTextHighlights(encoded);
    if (descriptors.length === 0) {
      showToast('No text highlights found in link.');
      return null;
    }
    return this.applyDescriptors(descriptors, false, true);
  }

  /**
   * Apply a list of TextRangeDescriptors directly (e.g. from the float bar).
   */
  applyDescriptors(
    descriptors: TextRangeDescriptor[],
    hideAnnotations: boolean = false,
    showWarnings: boolean = false,
  ): Range | null {
    this.clear();
    ensureStyle();

    let firstRange: Range | null = null;
    let unverifiedCount = 0;
    const registry = getHighlightRegistry();

    this.resolvedRanges = [];

    for (const desc of descriptors) {
      const { range, verified } = resolveDescriptor(desc);
      this.resolvedRanges.push(range);

      if (!range) continue;
      if (!verified) unverifiedCount++;
      if (!firstRange) firstRange = range;

      const colorKey = desc.color ?? 'yellow';

      if (registry) {
        // CSS Custom Highlight API path
        if (!this.hlMap.has(colorKey)) {
          const hl = createHighlight();
          if (!hl) continue;
          registry.set(`cv-hl-${colorKey}`, hl);
          this.hlMap.set(colorKey, hl);
        }
        this.hlMap.get(colorKey)!.add(range);
      } else {
        // DOM <mark> fallback
        this._injectMark(range, colorKey as AnnotationColorKey);
      }

      // Mount annotation overlay if this descriptor has a note
      if (desc.annotation && !hideAnnotations) {
        this._mountAnnotation(desc, range);
      }
    }

    if (unverifiedCount > 0 && showWarnings) {
      showToast('Some highlighted text may have changed since this link was created.');
    }

    if (this.activeAnnotations.length > 0) {
      window.addEventListener('resize', this._resizeListener, { passive: true });
    }

    this.active = true;
    return firstRange;
  }

  /**
   * Returns the resolved Range for the descriptor at the given index.
   * Used by ShareOverlay to check if a range exists before rendering an annotation editor.
   */
  getRange(index: number): Range | null {
    return this.resolvedRanges[index] ?? null;
  }

  /**
   * Returns the anchor DOMRect for the descriptor at the given index.
   * Uses the highlight range's overall bounding rect.
   */
  getAnchorRect(index: number): DOMRect | null {
    const range = this.resolvedRanges[index];
    if (!range) return null;
    return range.getBoundingClientRect();
  }

  private _lastDescriptors: TextRangeDescriptor[] = [];

  clear() {
    if (!this.active) return;
    const registry = getHighlightRegistry();

    if (registry) {
      for (const key of this.hlMap.keys()) {
        registry.delete(`cv-hl-${key}`);
      }
    } else {
      for (const mark of this.marks) {
        const parent = mark.parentNode;
        if (parent) {
          while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
          parent.removeChild(mark);
        }
      }
    }

    // Remove annotation overlays
    for (const comp of this.annotationComponents) {
      try {
        unmount(comp);
      } catch {
        /* ignore */
      }
    }
    for (const wrapper of this.annotationWrappers) {
      wrapper.remove();
    }
    this.annotationComponents = [];
    this.annotationWrappers = [];
    this.activeAnnotations = [];
    window.removeEventListener('resize', this._resizeListener);

    this.hlMap.clear();
    this.marks = [];
    this.resolvedRanges = [];
    this._lastDescriptors = [];
    this.active = false;
  }

  private _injectMark(range: Range, color: AnnotationColorKey) {
    try {
      const mark = document.createElement('mark');
      mark.className = `cv-hl-fallback cv-hl-fallback--${color}`;
      range.surroundContents(mark);
      this.marks.push(mark);
    } catch {
      // Range spans element boundaries — skip gracefully
    }
  }

  private _mountAnnotation(desc: TextRangeDescriptor, range: Range) {
    const corner = desc.annotationCorner ?? DEFAULT_ANNOTATION_CORNER;
    const rect = range.getBoundingClientRect();

    // Wrapper div to host the Svelte component. We position it exactly over the highlighted text,
    // using absolute positioning so it scrolls with the document natively.
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: absolute;
      z-index: 9300;
      pointer-events: none;
      top: ${rect.top + window.scrollY}px;
      left: ${rect.left + window.scrollX}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;
    document.body.appendChild(wrapper);
    this.annotationWrappers.push(wrapper);
    this.activeAnnotations.push({ range, wrapper });

    // Get the color for the box-color CSS variable
    const colorKey = desc.color ?? 'orange';
    const colorMap: Record<string, string> = {
      orange: '#ff9e5e',
      green: '#e2f073',
      pink: '#ff7eb3',
      yellow: '#ffd447',
      blue: '#7ee0f5',
    };
    wrapper.style.setProperty('--cv-annotation-color', colorMap[colorKey] ?? colorMap['orange']!);

    const component = mount(Annotation, {
      target: wrapper,
      props: {
        annotation: desc.annotation ?? '',
        annotationCorner: corner,
        verticalOffset: 22,
      },
    });
    this.annotationComponents.push(component);

    // Track descriptor for getAnchorRect
    this._lastDescriptors.push(desc);
  }
}

export const textHighlightService = new TextHighlightService();
