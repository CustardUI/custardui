import { type BoxColorKey, BOX_COLORS } from '$features/box/services/box-colors';
import { type TextRangeDescriptor } from './text-highlight-descriptor';

// ─── Constants ───────────────────────────────────────────────────────────────

const COLOR_KEYS = new Set<string>(BOX_COLORS.map((c) => c.key));
const FIELD_SEP = ':';
const DESC_SEP = ',';

/**
 * URL format (human-readable):
 *
 * elementId anchor  →  e:<elementId>:<containerHash>:<startEnc>:<endEnc>:<textHash>:<textLen>[:<color>]
 * containerId anchor → c:<containerId>:<containerTag>:<containerIndex>:<containerHash>:<startEnc>:<endEnc>:<textHash>:<textLen>[:<color>]
 *
 * Field separator is ':'. Text fields are percent-encoded so colons in text become %3A.
 * Multiple descriptors are comma-separated.
 * Fallback (no id available): base64-encoded minified JSON.
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

function serializeOne(desc: TextRangeDescriptor): string {
  const s = encodeURIComponent(desc.startText);
  const e = encodeURIComponent(desc.endText);
  const colorSuffix = desc.color && desc.color !== 'yellow' ? FIELD_SEP + desc.color : '';

  if (desc.elementId) {
    // e:<elementId>:<containerHash>:<startEnc>:<endEnc>:<textHash>:<textLen>[:<color>]
    return (
      `e${FIELD_SEP}${desc.elementId}${FIELD_SEP}${desc.containerHash}` +
      `${FIELD_SEP}${s}${FIELD_SEP}${e}${FIELD_SEP}${desc.textHash}${FIELD_SEP}${desc.textLength}${colorSuffix}`
    );
  }

  if (desc.containerId) {
    // c:<containerId>:<containerTag>:<containerIndex>:<containerHash>:<startEnc>:<endEnc>:<textHash>:<textLen>[:<color>]
    return (
      `c${FIELD_SEP}${desc.containerId}${FIELD_SEP}${desc.containerTag}${FIELD_SEP}${desc.containerIndex}${FIELD_SEP}${desc.containerHash}` +
      `${FIELD_SEP}${s}${FIELD_SEP}${e}${FIELD_SEP}${desc.textHash}${FIELD_SEP}${desc.textLength}${colorSuffix}`
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
    e: desc.endText,
    th: desc.textHash,
    tl: desc.textLength,
  };
  if (desc.color) obj['c'] = desc.color;
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
 * Parse: <elementId>:<containerHash>:<startEnc>:<endEnc>:<textHash>:<textLen>[:<color>]
 */
function parseElementId(rest: string): TextRangeDescriptor | null {
  try {
    // Split into at most 7 parts to handle colons in the id (edge case)
    const fields = rest.split(FIELD_SEP);
    if (fields.length < 6) return null;

    // elementId is fields[0], then containerHash, startEnc, endEnc, textHash, textLen, [color]
    const elementId = fields[0]!;
    const containerHash = parseInt(fields[1]!, 10);
    const startText = decodeURIComponent(fields[2]!);
    const endText = decodeURIComponent(fields[3]!);
    const textHash = parseInt(fields[4]!, 10);
    const textLength = parseInt(fields[5]!, 10);
    const color = fields[6] && COLOR_KEYS.has(fields[6]) ? (fields[6] as BoxColorKey) : undefined;

    if (!elementId || isNaN(containerHash) || isNaN(textHash) || isNaN(textLength)) return null;

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
    return desc;
  } catch {
    return null;
  }
}

/**
 * Parse: <containerId>:<containerTag>:<containerIndex>:<containerHash>:<startEnc>:<endEnc>:<textHash>:<textLen>[:<color>]
 */
function parseContainerId(rest: string): TextRangeDescriptor | null {
  try {
    const fields = rest.split(FIELD_SEP);
    if (fields.length < 8) return null;

    const containerId = fields[0]!;
    const containerTag = fields[1]!.toUpperCase();
    const containerIndex = parseInt(fields[2]!, 10);
    const containerHash = parseInt(fields[3]!, 10);
    const startText = decodeURIComponent(fields[4]!);
    const endText = decodeURIComponent(fields[5]!);
    const textHash = parseInt(fields[6]!, 10);
    const textLength = parseInt(fields[7]!, 10);
    const color = fields[8] && COLOR_KEYS.has(fields[8]) ? (fields[8] as BoxColorKey) : undefined;

    if (
      !containerId ||
      !containerTag ||
      isNaN(containerIndex) ||
      isNaN(containerHash) ||
      isNaN(textHash) ||
      isNaN(textLength)
    )
      return null;

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
      typeof e !== 'string' ||
      typeof th !== 'number' ||
      typeof tl !== 'number'
    )
      return null;

    const desc: TextRangeDescriptor = {
      containerTag: ct,
      containerIndex: ci,
      containerHash: ch,
      startText: s,
      endText: e,
      textHash: th,
      textLength: tl,
    };
    if (typeof obj['c'] === 'string' && COLOR_KEYS.has(obj['c'])) {
      desc.color = obj['c'] as BoxColorKey;
    }
    return desc;
  } catch {
    return null;
  }
}
