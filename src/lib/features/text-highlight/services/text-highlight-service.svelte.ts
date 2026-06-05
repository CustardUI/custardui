import { SvelteMap } from 'svelte/reactivity';
import { showToast } from '$features/notifications/stores/toast-store.svelte';
import { resolveDescriptor } from './text-highlight-resolver';
import { deserializeTextHighlights } from './text-highlight-serializer';
import { type TextRangeDescriptor } from './text-highlight-descriptor';
import { type BoxColorKey } from '$features/box/services/box-colors';

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
export const CSS_HIGHLIGHT_SUPPORTED: boolean =
  typeof CSS !== 'undefined' && 'highlights' in CSS;

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
::highlight(cv-hl-yellow) {
  background-color: transparent;
  color: inherit;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-thickness: 16px;
  text-decoration-color: oklch(78% 0.25 96 / 0.95);
  text-underline-offset: -12px;
  text-shadow:
    5px 2px 10px oklch(72% 0.24 90 / 0.45),
    -5px -2px 10px oklch(72% 0.24 90 / 0.32),
    0 0 16px oklch(72% 0.24 90 / 0.22);
}
::highlight(cv-hl-blue) {
  background-color: transparent;
  color: inherit;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-thickness: 16px;
  text-decoration-color: oklch(62% 0.22 240 / 0.9);
  text-underline-offset: -12px;
  text-shadow:
    5px 2px 10px oklch(55% 0.2 240 / 0.4),
    -5px -2px 10px oklch(55% 0.2 240 / 0.3),
    0 0 16px oklch(50% 0.18 242 / 0.2);
}
::highlight(cv-hl-red) {
  background-color: transparent;
  color: inherit;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-thickness: 16px;
  text-decoration-color: oklch(65% 0.22 20 / 0.9);
  text-underline-offset: -12px;
  text-shadow:
    5px 2px 10px oklch(58% 0.2 20 / 0.4),
    -5px -2px 10px oklch(58% 0.2 20 / 0.3),
    0 0 16px oklch(52% 0.18 22 / 0.2);
}
::highlight(cv-hl-green) {
  background-color: transparent;
  color: inherit;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-thickness: 16px;
  text-decoration-color: oklch(65% 0.22 145 / 0.9);
  text-underline-offset: -12px;
  text-shadow:
    5px 2px 10px oklch(58% 0.2 148 / 0.4),
    -5px -2px 10px oklch(58% 0.2 148 / 0.3),
    0 0 16px oklch(52% 0.18 150 / 0.2);
}
::highlight(cv-hl-black) {
  background-color: oklch(10% 0 0 / 0.95);
  color: oklch(97% 0 0);
  text-shadow: 4px 1px 8px rgba(0,0,0,0.6), -4px -1px 8px rgba(0,0,0,0.5);
}
`.trim();

const FALLBACK_CSS = `
.cv-hl-fallback {
  border-radius: 2px;
  padding: 2px 2px;
  clip-path: polygon(3px 0%, 100% 2px, calc(100% - 3px) 100%, 0% calc(100% - 2px));
  mix-blend-mode: multiply;
}
.cv-hl-fallback--yellow {
  background-color: rgba(230, 190, 0, 0.88);
  color: inherit;
  text-shadow: 5px 2px 10px rgba(180, 140, 0, 0.35), -5px -2px 10px rgba(180, 140, 0, 0.25);
}
.cv-hl-fallback--blue {
  background-color: rgba(37, 99, 235, 0.72);
  color: #fff;
  text-shadow: 5px 2px 10px rgba(20, 60, 180, 0.35), -5px -2px 10px rgba(20, 60, 180, 0.25);
}
.cv-hl-fallback--red {
  background-color: rgba(220, 38, 38, 0.72);
  color: #fff;
  text-shadow: 5px 2px 10px rgba(150, 20, 20, 0.35), -5px -2px 10px rgba(150, 20, 20, 0.25);
}
.cv-hl-fallback--green {
  background-color: rgba(22, 163, 74, 0.72);
  color: #fff;
  text-shadow: 5px 2px 10px rgba(10, 110, 40, 0.35), -5px -2px 10px rgba(10, 110, 40, 0.25);
}
.cv-hl-fallback--black {
  background-color: rgba(18, 18, 18, 0.92);
  color: #f5f5f5;
  text-shadow: 4px 1px 8px rgba(0,0,0,0.45), -4px -1px 8px rgba(0,0,0,0.35);
  mix-blend-mode: normal;
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
    return this.applyDescriptors(descriptors);
  }

  /**
   * Apply a list of TextRangeDescriptors directly (e.g. from the float bar).
   */
  applyDescriptors(descriptors: TextRangeDescriptor[]): Range | null {
    this.clear();
    ensureStyle();

    let firstRange: Range | null = null;
    let unverifiedCount = 0;
    const registry = getHighlightRegistry();

    for (const desc of descriptors) {
      const { range, verified } = resolveDescriptor(desc);
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
        this._injectMark(range, colorKey as BoxColorKey);
      }
    }

    if (unverifiedCount > 0) {
      showToast('Some highlighted text may have changed since this link was created.');
    }

    this.active = true;
    return firstRange;
  }

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

    this.hlMap.clear();
    this.marks = [];
    this.active = false;
  }

  private _injectMark(range: Range, color: BoxColorKey) {
    try {
      const mark = document.createElement('mark');
      mark.className = `cv-hl-fallback cv-hl-fallback--${color}`;
      range.surroundContents(mark);
      this.marks.push(mark);
    } catch {
      // Range spans element boundaries — skip gracefully
    }
  }
}

export const textHighlightService = new TextHighlightService();
