/* eslint-disable @typescript-eslint/no-explicit-any */
import { type HighlightColorKey, DEFAULT_COLOR_KEY, HIGHLIGHT_COLORS } from '$features/highlight/services/highlight-colors';
import { type AnnotationCorner, DEFAULT_ANNOTATION_CORNER, ANNOTATION_CORNERS } from '$features/highlight/services/highlight-annotations';

/**
 * Descriptor for an anchor that represents a DOM element.
 */
export interface AnchorDescriptor {
  tag: string; // e.g., "P", "BLOCKQUOTE"
  index: number; // e.g., 2 (It is the 2nd <p> in the container)
  parentId?: string; // ID of the nearest parent that HAS a hard ID (e.g., #section-configuration)
  textSnippet: string; // First 32 chars of text content (normalized)
  textHash: number; // A simple hash of the full text content
  elementId?: string; // The element's own ID if present
  color?: HighlightColorKey; // Per-element highlight color (omitted = default yellow)
  annotation?: string; // Optional text annotation (≤280 chars)
  annotationCorner?: AnnotationCorner; // Which corner the annotation anchors to
}

/**
 * Generates a simple hash code for a string.
 */
function hashCode(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Normalizes text content by removing excessive whitespace.
 */
function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Creates an AnchorDescriptor for a given DOM element.
 */
export function createDescriptor(el: HTMLElement): AnchorDescriptor {
  const tag = el.tagName;
  const textContent = el.textContent || '';
  const normalizedText = normalizeText(textContent);

  // Find nearest parent with an ID
  let parentId: string | undefined;
  let parent = el.parentElement;
  while (parent) {
    if (parent.id) {
      parentId = parent.id;
      break;
    }
    parent = parent.parentElement;
  }

  // Calculate index relative to the container
  const container = parent || document.body;
  const siblings = Array.from(container.querySelectorAll(tag));
  const index = siblings.indexOf(el);

  const descriptor: AnchorDescriptor = {
    tag,
    index: index !== -1 ? index : 0,
    textSnippet: normalizedText.substring(0, 32),
    textHash: hashCode(normalizedText),
    elementId: el.id,
  };

  if (parentId) {
    descriptor.parentId = parentId;
  }

  return descriptor;
}

/**
 * Serializes a list of AnchorDescriptors into a URL-safe string.
 */
export function serialize(descriptors: AnchorDescriptor[]): string {
  // Check if we can use human-readable format that only uses IDs
  // AnchorDescriptor carries the element's OWN id optionally.
  const minified = descriptors.map((d) => ({
    t: d.tag,
    i: d.index,
    p: d.parentId,
    s: d.textSnippet,
    h: d.textHash,
    id: d.elementId,
    ...(d.color && d.color !== DEFAULT_COLOR_KEY ? { c: d.color } : {}),
    ...(d.annotationCorner && d.annotationCorner !== DEFAULT_ANNOTATION_CORNER ? { nc: d.annotationCorner } : {}),
    ...(d.annotation ? { n: d.annotation } : {}),
  }));

  // When all elements have stable IDs, use a human-readable format.
  // Annotations are encoded via encodeURIComponent so the format stays URL-readable.
  // Format per element:
  //   no color, no note  → "id"
  //   color only         → "id:color"
  //   color + note       → "id:color:corner:encodedNote"  (always 4 parts)
  //   note, no color     → "id::corner:encodedNote"
  const allHaveIds = minified.every((m) => !!m.id);
  if (allHaveIds) {
    return minified.map((m) => {
      const id = m.id!;
      const c = (m as { c?: string }).c ?? '';
      const n = (m as { n?: string }).n;
      const nc = (m as { nc?: string }).nc ?? DEFAULT_ANNOTATION_CORNER;
      if (n) {
        return `${id}:${c}:${nc}:${encodeURIComponent(n)}`;
      }
      return c ? `${id}:${c}` : id;
    }).join(',');
  }

  const json = JSON.stringify(minified);

  // Modern UTF-8 safe Base64 encoding
  try {
    const bytes = new TextEncoder().encode(json);
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
    return btoa(binString);
  } catch (e) {
    console.error('Failed to encode anchor:', e);
    throw new Error('Failed to generate link signature.');
  }
}

/**
 * Deserializes a URL-safe string back into a list of AnchorDescriptors.
 */
export function deserialize(encoded: string): AnchorDescriptor[] {
  if (!encoded) return [];

  // Heuristic: If it contains spaces, it's definitely a list of IDs (Base64 doesn't have spaces)
  if (encoded.includes(' ')) {
    return parseIds(encoded);
  }

  // Heuristic: Check for characters invalid in standard Base64 (btoa uses +/)
  // Common IDs use - or _ or . which are not in Base64
  const isBase64Candidate = /^[A-Za-z0-9+/]*={0,2}$/.test(encoded);
  if (!isBase64Candidate) {
    return parseIds(encoded);
  }

  try {
    // Modern UTF-8 safe Base64 decoding
    const binString = atob(encoded);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0) || 0);
    const json = new TextDecoder().decode(bytes);

    const minified = JSON.parse(json);

    // Robustness: Ensure result is an array
    if (!Array.isArray(minified)) {
      throw new Error('Decoded JSON is not an array');
    }

    return minified.map((m: any) => {
      // Robustness: Ensure item is an object
      if (typeof m !== 'object' || m === null) throw new Error('Item is not an object');

      const descriptor: AnchorDescriptor = {
        tag: m.t,
        index: m.i,
        parentId: m.p,
        textSnippet: m.s,
        textHash: m.h,
        elementId: m.id,
      };
      if (m.c) descriptor.color = m.c as HighlightColorKey;
      if (m.n) {
        descriptor.annotation = m.n as string;
        descriptor.annotationCorner = (m.nc ?? DEFAULT_ANNOTATION_CORNER) as AnnotationCorner;
      } else if (m.nc) {
        descriptor.annotationCorner = m.nc as AnnotationCorner;
      }
      return descriptor;
    });
  } catch {
    // This handles cases where an ID string happens to look like Base64 but does not match the expected schema
    return parseIds(encoded);
  }
}

const COLOR_KEYS = new Set<string>(HIGHLIGHT_COLORS.map((c) => c.key));
const CORNER_KEYS = new Set<string>(ANNOTATION_CORNERS);

/**
 * Parses a space-separated, plus-separated, or comma-separated list of IDs into a list of AnchorDescriptors.
 * Supports:
 *   "id"                        — ID only
 *   "id:color"                  — with color
 *   "id:color:corner:note"      — with color + annotation (note is percent-encoded)
 *   "id::corner:note"           — annotation, no color
 */
function parseIds(encoded: string): AnchorDescriptor[] {
  const parts = encoded.split(/[ +,]+/).filter((p) => p.length > 0);
  return parts.map((part) => {
    // Split into at most 4 segments on ':'. The note segment (4th) is the
    // remainder so it can itself contain encoded colons (%3A).
    const segs = part.split(':');
    let id = part;
    let color: HighlightColorKey | undefined;
    let annotation: string | undefined;
    let annotationCorner: AnnotationCorner | undefined;

    if (segs.length >= 4) {
      // "id:color:corner:encodedNote..."
      id = segs[0]!;
      const colorSeg = segs[1]!;
      const cornerSeg = segs[2]!;
      const noteSeg = segs.slice(3).join(':'); // re-join in case of extra colons
      if (COLOR_KEYS.has(colorSeg)) color = colorSeg as HighlightColorKey;
      annotationCorner = CORNER_KEYS.has(cornerSeg)
        ? (cornerSeg as AnnotationCorner)
        : DEFAULT_ANNOTATION_CORNER;
      try {
        annotation = decodeURIComponent(noteSeg);
      } catch {
        annotation = noteSeg;
      }
    } else if (segs.length === 2) {
      // "id:color"
      const colorSeg = segs[1]!;
      if (COLOR_KEYS.has(colorSeg)) {
        id = segs[0]!;
        color = colorSeg as HighlightColorKey;
      }
    }

    const descriptor: AnchorDescriptor = {
      tag: 'ANY',
      index: 0,
      textSnippet: '',
      textHash: 0,
      elementId: id,
    };
    if (color !== undefined) descriptor.color = color;
    if (annotation !== undefined && annotationCorner !== undefined) {
      descriptor.annotation = annotation;
      descriptor.annotationCorner = annotationCorner;
    }
    return descriptor;
  });
}

const SCORE_EXACT_HASH = 50;
const SCORE_SNIPPET_START = 30;
const SCORE_INDEX_MATCH = 10;
const SCORE_PERFECT = 60;
const SCORE_THRESHOLD = 30;

/**
 * Finds the best DOM element match(es) for a descriptor.
 * Returns an array of elements. For specific descriptors, usually contains 0 or 1 element.
 * For ID-only descriptors (tag='ANY'), may return multiple if duplicates exist.
 */
export function resolve(root: HTMLElement, descriptor: AnchorDescriptor): HTMLElement[] {
  // 0. Direct ID Shortcut
  if (descriptor.elementId) {
    // Always support duplicate IDs for consistency, even if technically invalid HTML.
    const all = document.querySelectorAll(`[id="${CSS.escape(descriptor.elementId)}"]`);
    if (all.length > 0) return Array.from(all) as HTMLElement[];

    // If not found by ID (and it's a manual ID-only request), stop search.
    if (descriptor.tag === 'ANY') return [];
  }

  // 1. Determine Scope
  let scope: HTMLElement = root;

  // Optimization: If parentId exists, try to narrow scope immediately
  if (descriptor.parentId) {
    const foundParent = root.querySelector(`#${descriptor.parentId}`);
    if (foundParent instanceof HTMLElement) {
      scope = foundParent;
    } else {
      const globalParent = document.getElementById(descriptor.parentId);
      if (globalParent) {
        scope = globalParent;
      }
    }
  }

  // 2. Candidate Search & Scoring
  const candidates = scope.querySelectorAll(descriptor.tag);

  // Optimization: Structural Check First (Fastest)
  // If we trust the structure hasn't changed, the element at the specific index
  // is effectively O(1) access if we assume `querySelectorAll` order is stable.
  if (candidates[descriptor.index]) {
    const candidate = candidates[descriptor.index] as HTMLElement;
    const text = normalizeText(candidate.textContent || '');

    // Perfect Match Check: If index + hash match, it's virtually guaranteed.
    // This avoids checking every other candidate.
    if (hashCode(text) === descriptor.textHash) {
      return [candidate];
    }
  }

  // Fallback: Full scan if structural match failed (element moved/deleted/inserted)
  let bestMatch: HTMLElement | null = null;
  let highestScore = 0;

  // Use loop with break ability for optimization
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i] as HTMLElement;
    let score = 0;
    const text = normalizeText(candidate.textContent || '');

    // Content Match
    if (hashCode(text) === descriptor.textHash) {
      score += SCORE_EXACT_HASH;
    } else if (text.startsWith(descriptor.textSnippet)) {
      score += SCORE_SNIPPET_START;
    }

    // Structural Match (Re-calculated index)
    if (i === descriptor.index) {
      score += SCORE_INDEX_MATCH;
    }

    // Early Exit: If we find a very high score (Hash + Index), we can stop.
    if (score >= SCORE_PERFECT) {
      return [candidate];
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = candidate;
    }
  }

  // Threshold check
  return highestScore > SCORE_THRESHOLD && bestMatch ? [bestMatch] : [];
}
