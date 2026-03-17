/**
 * Generates a simple hash code for a string.
 */
export function hashCode(str: string): number {
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
 * Matches raw (un-hydrated) placeholder tokens in text content, including
 * escaped forms like \[[ name ]]:
 *   [[ name ]], [[ name : fallback ]], [[ name ? truthy : falsy ]], \[[ name ]]
 * Captures the placeholder name in group 1. Used to normalize tokens before hashing.
 *
 * The optional `(?:\\)?` prefix intentionally consumes the leading backslash so that
 * \[[ name ]] normalizes to [[name]] — the same canonical form that PlaceholderBinder
 * emits for escaped tokens ([[ name ]] literal text). This keeps the hash stable
 * across raw and hydrated DOM states.
 */
export const RAW_PLACEHOLDER_RE = /(?:\\)?\[\[\s*([a-zA-Z0-9_-]+)[^\]]*\]\]/g;

/**
 * Recursively walks `node`, appending stable placeholder-canonical text to `parts`.
 * - Text nodes: raw [[ ... ]] tokens are normalized to [[name]] before appending.
 * - <cv-placeholder> elements: appends [[name]] from the `name` attribute; skips children
 *   (children hold the live resolved value, not the canonical template form).
 * - All other elements: recurse into children.
 */
export function collectStableText(node: Node, parts: string[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue || '';
    parts.push(text.replace(RAW_PLACEHOLDER_RE, '[[$1]]'));
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;
    if (el.tagName === 'CV-PLACEHOLDER') {
      parts.push(`[[${el.getAttribute('name') || ''}]]`);
      return; // Skip children — they contain the resolved runtime value
    }
    for (let i = 0; i < el.childNodes.length; i++) {
      collectStableText(el.childNodes[i]!, parts);
    }
  }
}

/**
 * Returns the text content of an element with all <cv-placeholder> custom elements
 * replaced by their canonical [[name]] template form.
 *
 * This produces a stable string regardless of the placeholder's current resolved value
 * or whether it has been hydrated yet — enabling consistent hashing across share and load time.
 *
 * Without this, an element containing [[username]] resolved to "alice" would hash as
 * "Hello alice!" at share-time but "Hello [[username]]!" at load-time, causing resolution to fail.
 */
export function getStableTextContent(el: HTMLElement): string {
  // Special case: el itself is a <cv-placeholder> — return canonical form directly.
  if (el.tagName === 'CV-PLACEHOLDER') {
    return `[[${el.getAttribute('name') || ''}]]`;
  }
  // Fast path: if no raw [[ tokens and no <cv-placeholder> descendants,
  // there are no placeholders — return textContent directly (native, no allocation).
  // Check textContent first to avoid the querySelector when raw tokens are present
  // (raw DOM elements with [[ tokens always need the slow path).
  const rawText = el.textContent || '';
  if (!rawText.includes('[[')) {
    const hasHydrated = el.querySelector('cv-placeholder') !== null;
    if (!hasHydrated) {
      return rawText;
    }
  }
  // Slow path: walk the DOM to canonicalize all placeholder forms.
  const parts: string[] = [];
  for (let i = 0; i < el.childNodes.length; i++) {
    collectStableText(el.childNodes[i]!, parts);
  }
  return parts.join('');
}

/**
 * Combines getStableTextContent and normalizeText into a single call.
 * Used wherever element text is computed for hashing or comparison.
 */
export function getStableNormalizedText(el: HTMLElement): string {
  return getStableTextContent(el).trim().replace(/\s+/g, ' ');
}
