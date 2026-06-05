import { type BoxColorKey, BOX_COLORS } from '$features/box/services/box-colors';
import { type TextRangeDescriptor } from './text-highlight-descriptor';

// ─── Constants ───────────────────────────────────────────────────────────────

const COLOR_KEYS = new Set<string>(BOX_COLORS.map((c) => c.key));
const FIELD_SEP = ':';
const DESC_SEP = ',';

/**
 * URL format (human-readable):
 *
 * elementId anchor  →  e:<startEnc>:<endEnc>:<textLen>:<elementId>:<containerHash>:<textHash>[:<color>]
 * containerId anchor → c:<startEnc>:<endEnc>:<textLen>:<containerId>:<containerTag>:<containerIndex>:<containerHash>:<textHash>[:<color>]
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
  // We replace %20 with a literal space ' ' so that when URLSearchParams
  // serializes it into the final URL, it converts the ' ' into a '+' for readability.
  const s = encodeURIComponent(desc.startText).replace(/%20/g, ' ');
  // If endText is identical to startText (short highlights), omit it to prevent duplication
  const e = desc.startText === desc.endText ? '' : encodeURIComponent(desc.endText).replace(/%20/g, ' ');
  const colorSuffix = desc.color && desc.color !== 'yellow' ? FIELD_SEP + desc.color : '';

  if (desc.elementId) {
    // e:<startEnc>:<endEnc>:<textLen>:<elementId>:<containerHash>:<textHash>[:<color>]
    return (
      `e${FIELD_SEP}${s}${FIELD_SEP}${e}${FIELD_SEP}${desc.textLength}` +
      `${FIELD_SEP}${desc.elementId}${FIELD_SEP}${desc.containerHash}${FIELD_SEP}${desc.textHash}${colorSuffix}`
    );
  }

  if (desc.containerId) {
    // c:<startEnc>:<endEnc>:<textLen>:<containerId>:<containerTag>:<containerIndex>:<containerHash>:<textHash>[:<color>]
    return (
      `c${FIELD_SEP}${s}${FIELD_SEP}${e}${FIELD_SEP}${desc.textLength}` +
      `${FIELD_SEP}${desc.containerId}${FIELD_SEP}${desc.containerTag}${FIELD_SEP}${desc.containerIndex}` +
      `${FIELD_SEP}${desc.containerHash}${FIELD_SEP}${desc.textHash}${colorSuffix}`
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
 * Parse: <startEnc>:<endEnc>:<textLen>:<elementId>:<containerHash>:<textHash>[:<color>]
 */
function parseElementId(rest: string): TextRangeDescriptor | null {
  try {
    // Split into at most 7 parts to handle colons in the id (edge case)
    const fields = rest.split(FIELD_SEP);
    if (fields.length < 6) return null;

    // startEnc is fields[0], then endEnc, textLen, elementId, containerHash, textHash, [color]
    const startText = decodeURIComponent(fields[0]!);
    const endText = fields[1] === '' ? startText : decodeURIComponent(fields[1]!);
    const textLength = parseInt(fields[2]!, 10);
    const elementId = fields[3]!;
    const containerHash = parseInt(fields[4]!, 10);
    const textHash = parseInt(fields[5]!, 10);
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
 * Parse: <startEnc>:<endEnc>:<textLen>:<containerId>:<containerTag>:<containerIndex>:<containerHash>:<textHash>[:<color>]
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
      desc.color = obj['c'] as BoxColorKey;
    }
    return desc;
  } catch {
    return null;
  }
}
