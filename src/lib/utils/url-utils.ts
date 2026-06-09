/**
 * Helper function to prepend baseUrl to a path
 * @param path The path to prepend the baseUrl to
 * @param baseUrl The base URL to prepend
 * @returns The full URL with baseUrl prepended if applicable
 */
export function prependBaseUrl(path: string, baseUrl: string): string {
  if (!baseUrl) return path;

  // Don't prepend if the path is already absolute (starts with http:// or https://)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Ensure baseUrl doesn't end with / and path starts with /
  const cleanbaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : '/' + path;

  return cleanbaseUrl + cleanPath;
}

/**
 * Checks if a URL value starts with any of the specified dangerous protocols.
 * Strips all ASCII control and whitespace characters before matching to prevent bypasses.
 */
export function hasDangerousProtocol(
  value: string,
  blockedProtocols: string[] = ['javascript', 'vbscript'],
): boolean {
  // eslint-disable-next-line no-control-regex
  const normalized = value.replace(/[\x00-\x1F\x7F\s]/g, '');
  const pattern = new RegExp(`^(${blockedProtocols.join('|')}):`, 'i');
  return pattern.test(normalized);
}

/**
 * Sanitizes HTML sourced from user input (e.g. cv-tab-header innerHTML, label values).
 * Strips script, style, link, and all inline event handler attributes (on*)
 * and javascript:/vbscript:/data: URLs from href/src/action, preserving safe rich formatting.
 * Uses DOMParser — no external dependencies.
 */
export function sanitizeHtml(rawHtml: string): string {
  if (typeof DOMParser === 'undefined') {
    // Return rawHtml if DOMParser is not available (e.g., SSR or node context without jsdom),
    // though in our actual runtime it's browser-only.
    return rawHtml;
  }

  const doc = new DOMParser().parseFromString(rawHtml, 'text/html');

  // Remove entirely unsafe elements
  doc
    .querySelectorAll('script, style, link, object, embed, iframe, form')
    .forEach((el) => el.remove());

  // Walk all remaining elements and strip dangerous attributes
  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      // Strip all on* event handler attributes
      if (/^on/i.test(attr.name)) {
        el.removeAttribute(attr.name);
        continue;
      }
      // Strip javascript: / vbscript: / data: from URL-bearing attributes (literal or namespaced, e.g. href, xlink:href, src, action)
      // Also handles bypasses where control/whitespace characters are embedded (e.g. ja\tvascript:)
      if (/(^|:)(href|src|action|formaction)$/i.test(attr.name)) {
        if (hasDangerousProtocol(attr.value, ['javascript', 'vbscript', 'data'])) {
          el.removeAttribute(attr.name);
        }
      }
    }
  });

  return doc.body.innerHTML;
}
