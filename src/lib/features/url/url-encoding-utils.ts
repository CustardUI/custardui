/**
 * Encodes a list of IDs into a comma-separated query-safe string.
 *
 * Each ID is individually encoded with `encodeURIComponent` so that any commas
 * or special characters *within* an ID are escaped (e.g. `%2C`).
 */
export function encodeList(items: string[]): string {
  return items.map(encodeURIComponent).join(',');
}

/**
 * Encodes key:value pairs into a comma-separated query-safe string.
 *
 * Keys and values are individually encoded so that the structural separators
 * (`:` between key/value, `,` between pairs) remain unambiguous.
 */
export function encodePairs(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}:${encodeURIComponent(v)}`)
    .join(',');
}

/**
 * Extracts the raw (un-decoded) value of a query parameter from a search string.
 *
 * We avoid `URLSearchParams.get()` here because it decodes the entire value,
 * converting our content-level `%2C` back into literal commas and making them
 * indistinguishable from the structural commas that separate list items.
 */
export function getRawParam(search: string, paramName: string): string | null {
  const escaped = paramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`[?&]${escaped}=([^&]*)`).exec(search);
  return match?.[1] ?? null;
}

/**
 * Splits a raw query parameter value by structural commas and decodes each item.
 *
 * Because values were encoded with `encodeURIComponent` before joining with `,`,
 * splitting on literal commas is safe — any commas inside values appear as `%2C`.
 */
export function splitAndDecode(search: string, paramName: string): string[] {
  const raw = getRawParam(search, paramName);
  if (!raw) return [];

  return raw
    .split(',')
    .map((item) => {
      try {
        // application/x-www-form-urlencoded often uses + for spaces
        return decodeURIComponent(item.replace(/\+/g, '%20'));
      } catch {
        console.warn(`[CustardUI] URLStateManager: Failed to decode ${paramName} item: ${item}`);
        return item;
      }
    })
    .filter(Boolean);
}

/**
 * Parses `key:value` pairs from a raw comma-delimited list into a Record.
 * Entries without a colon, or with empty keys, are silently dropped.
 */
export function decodePairs(search: string, paramName: string): Record<string, string> {
  const pairs = splitAndDecode(search, paramName);
  const result: Record<string, string> = {};
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(':');
    if (colonIdx > 0) {
      const key = pair.slice(0, colonIdx);
      const value = pair.slice(colonIdx + 1);
      if (key) result[key] = value;
    }
  }
  return result;
}
