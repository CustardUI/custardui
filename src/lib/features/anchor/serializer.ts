/* eslint-disable @typescript-eslint/no-explicit-any */
import { type HighlightColorKey, DEFAULT_COLOR_KEY, HIGHLIGHT_COLORS } from '$features/highlight/services/highlight-colors';
import { type AnnotationCorner, DEFAULT_ANNOTATION_CORNER, ANNOTATION_CORNERS } from '$features/highlight/services/highlight-annotations';
import { type AnchorDescriptor } from './types';

const COLOR_KEYS = new Set<string>(HIGHLIGHT_COLORS.map((c) => c.key));
const CORNER_KEYS = new Set<string>(ANNOTATION_CORNERS);

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
  //   corner only        → "id::corner"
  //   color + corner     → "id:color:corner"
  //   color + note       → "id:color:corner:encodedNote"  (always 4 parts)
  //   note, no color     → "id::corner:encodedNote"
  const allHaveIds = minified.every((m) => !!m.id);
  if (allHaveIds) {
    return minified.map((m) => {
      const id = m.id!;
      const c = (m as { c?: string }).c ?? '';
      const n = (m as { n?: string }).n;
      const nc = (m as { nc?: string }).nc;
      if (n) {
        return `${id}:${c}:${nc ?? DEFAULT_ANNOTATION_CORNER}:${encodeURIComponent(n)}`;
      }
      if (nc) {
        return `${id}:${c}:${nc}`;
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

/**
 * Parses a space-separated, plus-separated, or comma-separated list of IDs into a list of AnchorDescriptors.
 * Supports:
 *   "id"                        — ID only
 *   "id:color"                  — with color
 *   "id:color:corner"           — color + corner, no note
 *   "id::corner"                — corner only, no color, no note
 *   "id:color:corner:note"      — with color + annotation (note is percent-encoded)
 *   "id::corner:note"           — annotation, no color
 */
export function parseIds(encoded: string): AnchorDescriptor[] {
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
    } else if (segs.length === 3) {
      // "id:color:corner" — corner without note
      id = segs[0]!;
      const colorSeg = segs[1]!;
      const cornerSeg = segs[2]!;
      if (COLOR_KEYS.has(colorSeg)) color = colorSeg as HighlightColorKey;
      if (CORNER_KEYS.has(cornerSeg)) annotationCorner = cornerSeg as AnnotationCorner;
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
    if (annotation !== undefined) descriptor.annotation = annotation;
    if (annotationCorner !== undefined) descriptor.annotationCorner = annotationCorner;
    return descriptor;
  });
}
