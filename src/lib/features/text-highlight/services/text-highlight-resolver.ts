import { hashCode, getStableNormalizedText } from '$features/anchor/stable-text';
import { type TextRangeDescriptor } from './text-highlight-descriptor';

export interface ResolvedRange {
  range: Range | null;
  verified: boolean; // true = textHash matched exactly
}

/**
 * Resolves a TextRangeDescriptor back to a live DOM Range.
 */
export function resolveDescriptor(desc: TextRangeDescriptor): ResolvedRange {
  const container = findContainer(desc);
  if (!container) return { range: null, verified: false };

  const { entries, rawText } = buildTextNodeMap(container);
  if (!rawText || entries.length === 0) return { range: null, verified: false };

  const span = findTextSpan(rawText, desc);
  if (!span) return { range: null, verified: false };

  const { rawStart, rawEnd } = span;

  // Verify by normalising the raw slice
  const rawSlice = rawText.slice(rawStart, rawEnd);
  const normalised = rawSlice.trim().replace(/\s+/g, ' ');
  const verified =
    hashCode(normalised) === desc.textHash && normalised.length === desc.textLength;

  const startPos = rawToNodeOffset(entries, rawStart);
  const endPos = rawToNodeOffset(entries, rawEnd);
  if (!startPos || !endPos) return { range: null, verified };

  try {
    const range = document.createRange();
    range.setStart(startPos.node, startPos.offset);
    range.setEnd(endPos.node, endPos.offset);
    return { range, verified };
  } catch {
    return { range: null, verified };
  }
}

// ---------------------------------------------------------------------------
// Container resolution
// ---------------------------------------------------------------------------

function findContainer(desc: TextRangeDescriptor): HTMLElement | null {
  // ── Direct element-id lookup ──────────────────────────────────────────────
  if (desc.elementId) {
    const el = document.getElementById(desc.elementId);
    if (el instanceof HTMLElement) {
      // Verify hash if we have one; if it doesn't match, still use the element
      // (content may have changed slightly but the id is the best anchor we have)
      return el;
    }
  }

  // ── Scope to nearest ancestor id ─────────────────────────────────────────
  const scope: HTMLElement =
    (desc.containerId ? document.getElementById(desc.containerId) : null) ??
    document.body;

  if (!desc.containerTag) return null;

  const candidates = Array.from(scope.querySelectorAll(desc.containerTag)) as HTMLElement[];
  if (candidates.length === 0) return null;

  // ── Try exact index + hash match ─────────────────────────────────────────
  const byIndex = candidates[desc.containerIndex];
  if (byIndex) {
    const hash = hashCode(getStableNormalizedText(byIndex));
    if (hash === desc.containerHash) return byIndex;
  }

  // ── Fuzzy: scan all candidates for matching hash ──────────────────────────
  for (const c of candidates) {
    if (hashCode(getStableNormalizedText(c)) === desc.containerHash) return c;
  }

  // ── Last resort: use the index regardless of hash ─────────────────────────
  // (content may have changed; try anyway — text search will verify)
  return byIndex ?? candidates[0] ?? null;
}

// ---------------------------------------------------------------------------
// Text-node map
// ---------------------------------------------------------------------------

interface TextEntry {
  node: Text;
  start: number;
  end: number;
}

function buildTextNodeMap(container: HTMLElement): { entries: TextEntry[]; rawText: string } {
  const entries: TextEntry[] = [];
  let pos = 0;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;

  while (node) {
    const raw = node.nodeValue ?? '';
    entries.push({ node, start: pos, end: pos + raw.length });
    pos += raw.length;
    node = walker.nextNode() as Text | null;
  }

  return {
    entries,
    rawText: entries.map((e) => e.node.nodeValue ?? '').join(''),
  };
}

// ---------------------------------------------------------------------------
// Text span search
// ---------------------------------------------------------------------------

interface RawSpan {
  rawStart: number;
  rawEnd: number;
}

function findTextSpan(rawText: string, desc: TextRangeDescriptor): RawSpan | null {
  const { startText, endText, textLength } = desc;

  // ── 1. Exact search ───────────────────────────────────────────────────────
  let rawStart = rawText.indexOf(startText);

  // ── 2. Normalise-both fallback ────────────────────────────────────────────
  if (rawStart === -1) {
    const normHaystack = rawText.replace(/\s+/g, ' ').trim();
    const normNeedle = startText.replace(/\s+/g, ' ').trim();
    const normIdx = normHaystack.indexOf(normNeedle);
    if (normIdx !== -1) {
      rawStart = normToRaw(rawText, normIdx);
    }
  }

  if (rawStart === -1) return null;

  // ── Compute rawEnd ────────────────────────────────────────────────────────
  let rawEnd: number;

  if (startText === endText) {
    // Short selection (≤ SNIPPET_LENGTH): advance by ~textLength raw chars
    rawEnd = advanceByNormLength(rawText, rawStart, textLength);
  } else {
    // Long selection: endText should appear near rawStart + textLength
    const searchFrom = rawStart + Math.max(0, textLength - endText.length - 5);
    let found = rawText.indexOf(endText, Math.max(rawStart + startText.length - endText.length, searchFrom));

    if (found === -1) {
      // Normalise-both fallback for endText
      const normHaystack = rawText.replace(/\s+/g, ' ').trim();
      const normNeedle = endText.replace(/\s+/g, ' ').trim();
      const rawSearchFrom = Math.max(rawStart, searchFrom);
      const normSearchFrom = rawToNorm(rawText, rawSearchFrom);
      const normIdx = normHaystack.indexOf(normNeedle, normSearchFrom);
      if (normIdx !== -1) {
        found = normToRaw(rawText, normIdx);
      }
    }

    rawEnd =
      found !== -1
        ? found + endText.length
        : advanceByNormLength(rawText, rawStart, textLength);
  }

  return { rawStart, rawEnd: Math.min(rawEnd, rawText.length) };
}

/**
 * Given a raw string and a normalized index (treating whitespace-runs as 1),
 * return the corresponding raw string index.
 */
function normToRaw(raw: string, normTarget: number): number {
  let normCount = 0;
  let rawIdx = 0;
  // Skip leading whitespace (mirrors .trimStart())
  while (rawIdx < raw.length && /\s/.test(raw[rawIdx]!)) rawIdx++;

  let prevWasSpace = false;
  while (rawIdx < raw.length && normCount < normTarget) {
    const ch = raw[rawIdx]!;
    if (/\s/.test(ch)) {
      if (!prevWasSpace) { normCount++; prevWasSpace = true; }
    } else {
      normCount++;
      prevWasSpace = false;
    }
    rawIdx++;
  }
  return rawIdx;
}

/** Inverse: given a raw index, return the approximately equivalent normalised index. */
function rawToNorm(raw: string, rawTarget: number): number {
  let normCount = 0;
  let rawIdx = 0;
  while (rawIdx < raw.length && /\s/.test(raw[rawIdx]!)) rawIdx++; // skip leading ws

  let prevWasSpace = false;
  while (rawIdx < raw.length && rawIdx < rawTarget) {
    const ch = raw[rawIdx]!;
    if (/\s/.test(ch)) {
      if (!prevWasSpace) { normCount++; prevWasSpace = true; }
    } else {
      normCount++;
      prevWasSpace = false;
    }
    rawIdx++;
  }
  return normCount;
}

/**
 * From rawStart, advance approximately `normLen` normalised characters
 * (treating whitespace runs as 1) and return the resulting raw position.
 */
function advanceByNormLength(raw: string, rawStart: number, normLen: number): number {
  let count = 0;
  let i = rawStart;
  let prevWasSpace = false;

  while (i < raw.length && count < normLen) {
    const ch = raw[i]!;
    if (/\s/.test(ch)) {
      if (!prevWasSpace) { count++; prevWasSpace = true; }
    } else {
      count++;
      prevWasSpace = false;
    }
    i++;
  }
  return i;
}

// ---------------------------------------------------------------------------
// Map raw position → (Text node, in-node offset)
// ---------------------------------------------------------------------------

function rawToNodeOffset(
  entries: TextEntry[],
  rawPos: number,
): { node: Text; offset: number } | null {
  for (const entry of entries) {
    if (rawPos >= entry.start && rawPos <= entry.end) {
      return { node: entry.node, offset: rawPos - entry.start };
    }
  }
  // Clamp to last node end
  const last = entries[entries.length - 1];
  if (last) return { node: last.node, offset: last.node.nodeValue?.length ?? 0 };
  return null;
}
