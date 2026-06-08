import { type AnnotationColorKey, ANNOTATION_COLORS } from '$features/annotations/annotation-colors';
import {
  type AnnotationCorner,
  ANNOTATION_CORNERS,
  DEFAULT_ANNOTATION_CORNER,
} from '$features/annotations/annotation-types';
import { type TextRangeDescriptor } from './text-highlight-descriptor';

// ─── Constants ───────────────────────────────────────────────────────────────

const COLOR_KEYS = new Set<string>(ANNOTATION_COLORS.map((c) => c.key));
const CORNER_KEYS = new Set<string>(ANNOTATION_CORNERS);
const FIELD_SEP = ':';
const DESC_SEP = ',';

/**
 * URL format (human-readable):
 *
 * elementId anchor  →  e:<startEnc>:<endEnc>:<textLen>:<elementId>:<containerHash>:<textHash>[:<color>][:<corner>:<note>]
 * containerId anchor → c:<startEnc>:<endEnc>:<textLen>:<containerId>:<containerTag>:<containerIndex>:<containerHash>:<textHash>[:<color>][:<corner>:<note>]
 *
 * Field separator is ':'. Text fields are percent-encoded so colons in text become %3A.
 * Spaces in text snippets are left as literal spaces so URLSearchParams encodes them as '+'.
 * Multiple descriptors are comma-separated.
 * Fallback (no id available): base64-encoded minified JSON.
 *
 * Annotation suffix (when present): :<corner>:<encodedNote>
 *   corner = 'tl' | 'tr' | 'bl' | 'br'
 *   note   = encodeURIComponent(annotation text)
 */

// ─── Public API ──────────────────────────────────────────────────────────────

export function serializeTextHighlights(descriptors: TextRangeDescriptor[]): string {
  return descriptors.map(serializeOne).filter(Boolean).join(DESC_SEP);
}

export function deserializeTextHighlights(encoded: string): TextRangeDescriptor[] {
  if (!encoded) return [];
  return encoded
    .split(DESC_SEP)
    .map(parseOne)
    .filter((d): d is TextRangeDescriptor => d !== null);
}

// ─── Serialise ────────────────────────────────────────────────────────────────

function buildAnnotationSuffix(desc: TextRangeDescriptor): string {
  if (!desc.annotation) return '';
  const corner = desc.annotationCorner ?? DEFAULT_ANNOTATION_CORNER;
  return `${FIELD_SEP}${corner}${FIELD_SEP}${encodeURIComponent(desc.annotation)}`;
}

function serializeOne(desc: TextRangeDescriptor): string {
  // We replace %20 with a literal space ' ' so that when URLSearchParams
  // serializes it into the final URL, it converts the ' ' into a '+' for readability.
  const s = encodeURIComponent(desc.startText).replace(/%20/g, ' ');
  // If endText is identical to startText (short highlights), omit it to prevent duplication
  const e =
    desc.startText === desc.endText ? '' : encodeURIComponent(desc.endText).replace(/%20/g, ' ');
  const colorSuffix = desc.color && desc.color !== 'yellow' ? FIELD_SEP + desc.color : '';
  const annotationSuffix = buildAnnotationSuffix(desc);

  if (desc.elementId) {
    // e:<startEnc>:<endEnc>:<textLen>:<elementId>:<containerHash>:<textHash>[:<color>][:<anchor>:<corner>:<note>]
    return (
      `e${FIELD_SEP}${s}${FIELD_SEP}${e}${FIELD_SEP}${desc.textLength}` +
      `${FIELD_SEP}${desc.elementId}${FIELD_SEP}${desc.containerHash}${FIELD_SEP}${desc.textHash}${colorSuffix}${annotationSuffix}`
    );
  }

  if (desc.containerId) {
    // c:<startEnc>:<endEnc>:<textLen>:<containerId>:<containerTag>:<containerIndex>:<containerHash>:<textHash>[:<color>][:<anchor>:<corner>:<note>]
    return (
      `c${FIELD_SEP}${s}${FIELD_SEP}${e}${FIELD_SEP}${desc.textLength}` +
      `${FIELD_SEP}${desc.containerId}${FIELD_SEP}${desc.containerTag}${FIELD_SEP}${desc.containerIndex}` +
      `${FIELD_SEP}${desc.containerHash}${FIELD_SEP}${desc.textHash}${colorSuffix}${annotationSuffix}`
    );
  }

  // Fallback: base64 JSON
  return serializeBase64(desc);
}

function serializeBase64(desc: TextRangeDescriptor): string {
  const obj: Record<string, unknown> = {
    ct: desc.containerTag,
    ci: desc.containerIndex,
    ch: desc.containerHash,
    s: desc.startText,
    th: desc.textHash,
    tl: desc.textLength,
  };
  if (desc.startText !== desc.endText) obj['e'] = desc.endText;
  if (desc.color) obj['c'] = desc.color;
  if (desc.annotation) {
    obj['n'] = desc.annotation;
    obj['nc'] = desc.annotationCorner ?? DEFAULT_ANNOTATION_CORNER;
  }
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  } catch {
    return '';
  }
}

// ─── Deserialise ─────────────────────────────────────────────────────────────

function parseOne(part: string): TextRangeDescriptor | null {
  if (!part) return null;

  if (part.startsWith('e:')) return parseElementId(part.slice(2));
  if (part.startsWith('c:')) return parseContainerId(part.slice(2));

  // Base64 fallback: only A-Za-z0-9+/= characters
  if (/^[A-Za-z0-9+/]*={0,2}$/.test(part)) {
    return parseBase64(part);
  }

  return null;
}

/**
 * Extracts annotation fields from trailing fields after the known fixed fields.
 * Annotation suffix format: <corner>:<encodedNote...>
 * Returns null if no annotation is present.
 */
function parseAnnotationSuffix(
  fields: string[],
  annotationStartIndex: number,
): { annotation: string; annotationCorner: AnnotationCorner } | null {
  if (fields.length <= annotationStartIndex) return null;
  const corner = fields[annotationStartIndex];
  const noteParts = fields.slice(annotationStartIndex + 1);
  if (!corner || noteParts.length === 0) return null;
  if (!CORNER_KEYS.has(corner)) return null;
  try {
    const annotation = decodeURIComponent(noteParts.join(FIELD_SEP));
    return {
      annotation,
      annotationCorner: corner as AnnotationCorner,
    };
  } catch {
    return null;
  }
}

/**
 * Parse: <startEnc>:<endEnc>:<textLen>:<elementId>:<containerHash>:<textHash>[:<color>][:<anchor>:<corner>:<note>]
 * Fixed fields: 0=start, 1=end, 2=len, 3=elementId, 4=containerHash, 5=textHash
 * Optional field 6: color
 * Optional fields 7+: anchor, corner, note
 */
function parseElementId(rest: string): TextRangeDescriptor | null {
  try {
    const fields = rest.split(FIELD_SEP);
    if (fields.length < 6) return null;

    const startText = decodeURIComponent(fields[0]!);
    const endText = fields[1] === '' ? startText : decodeURIComponent(fields[1]!);
    const textLength = parseInt(fields[2]!, 10);
    const elementId = fields[3]!;
    const containerHash = parseInt(fields[4]!, 10);
    const textHash = parseInt(fields[5]!, 10);

    if (!elementId || isNaN(containerHash) || isNaN(textHash) || isNaN(textLength)) return null;

    // Field 6: optional color (or legacy color) vs corner
    let color: AnnotationColorKey | undefined;
    let annotationStartIdx = 6;
    if (fields[6] && !CORNER_KEYS.has(fields[6])) {
      if (COLOR_KEYS.has(fields[6])) color = fields[6] as AnnotationColorKey;
      annotationStartIdx = 7;
    }

    const desc: TextRangeDescriptor = {
      elementId,
      containerTag: '', // not needed — resolved directly via elementId
      containerIndex: 0,
      containerHash,
      startText,
      endText,
      textHash,
      textLength,
    };
    if (color) desc.color = color;

    const ann = parseAnnotationSuffix(fields, annotationStartIdx);
    if (ann) {
      desc.annotation = ann.annotation;
      desc.annotationCorner = ann.annotationCorner;
    }

    return desc;
  } catch {
    return null;
  }
}

/**
 * Parse: <startEnc>:<endEnc>:<textLen>:<containerId>:<containerTag>:<containerIndex>:<containerHash>:<textHash>[:<color>][:<corner>:<note>]
 * Fixed fields: 0=start, 1=end, 2=len, 3=containerId, 4=tag, 5=index, 6=containerHash, 7=textHash
 * Optional field 8: color
 * Optional fields 9+: corner, note
 */
function parseContainerId(rest: string): TextRangeDescriptor | null {
  try {
    const fields = rest.split(FIELD_SEP);
    if (fields.length < 8) return null;

    const startText = decodeURIComponent(fields[0]!);
    const endText = fields[1] === '' ? startText : decodeURIComponent(fields[1]!);
    const textLength = parseInt(fields[2]!, 10);
    const containerId = fields[3]!;
    const containerTag = fields[4]!.toUpperCase();
    const containerIndex = parseInt(fields[5]!, 10);
    const containerHash = parseInt(fields[6]!, 10);
    const textHash = parseInt(fields[7]!, 10);

    if (
      !containerId ||
      !containerTag ||
      isNaN(containerIndex) ||
      isNaN(containerHash) ||
      isNaN(textHash) ||
      isNaN(textLength)
    )
      return null;

    // Field 8: optional color (or legacy color) vs corner
    let color: AnnotationColorKey | undefined;
    let annotationStartIdx = 8;
    if (fields[8] && !CORNER_KEYS.has(fields[8])) {
      if (COLOR_KEYS.has(fields[8])) color = fields[8] as AnnotationColorKey;
      annotationStartIdx = 9;
    }

    const desc: TextRangeDescriptor = {
      containerId,
      containerTag,
      containerIndex,
      containerHash,
      startText,
      endText,
      textHash,
      textLength,
    };
    if (color) desc.color = color;

    const ann = parseAnnotationSuffix(fields, annotationStartIdx);
    if (ann) {
      desc.annotation = ann.annotation;
      desc.annotationCorner = ann.annotationCorner;
    }

    return desc;
  } catch {
    return null;
  }
}

function parseBase64(encoded: string): TextRangeDescriptor | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const obj = JSON.parse(json) as Record<string, unknown>;

    const ct = obj['ct'];
    const ci = obj['ci'];
    const ch = obj['ch'];
    const s = obj['s'];
    const e = obj['e'];
    const th = obj['th'];
    const tl = obj['tl'];

    if (
      typeof ct !== 'string' ||
      typeof ci !== 'number' ||
      typeof ch !== 'number' ||
      typeof s !== 'string' ||
      (e !== undefined && typeof e !== 'string') ||
      typeof th !== 'number' ||
      typeof tl !== 'number'
    )
      return null;

    const desc: TextRangeDescriptor = {
      containerTag: obj.ct as string,
      containerIndex: obj.ci as number,
      containerHash: obj.ch as number,
      startText: obj.s as string,
      endText: (obj.e as string) || (obj.s as string),
      textHash: obj.th as number,
      textLength: obj.tl as number,
    };
    if (typeof obj['c'] === 'string' && COLOR_KEYS.has(obj['c'])) {
      desc.color = obj['c'] as AnnotationColorKey;
    }
    if (typeof obj['n'] === 'string') {
      desc.annotation = obj['n'];
      desc.annotationCorner = CORNER_KEYS.has(obj['nc'] as string)
        ? (obj['nc'] as AnnotationCorner)
        : DEFAULT_ANNOTATION_CORNER;
    }
    return desc;
  } catch {
    return null;
  }
}
