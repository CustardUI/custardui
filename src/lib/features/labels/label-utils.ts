/**
 * Single-letter shorthand color aliases.
 * Each maps to a light-theme and dark-theme hex value.
 */
const SHORTHAND_COLORS: Record<string, { light: string; dark: string }> = {
  r: { light: '#fca5a5', dark: '#dc2626' }, // Pale red / Deep red
  g: { light: '#4ade80', dark: '#16a34a' }, // Neon green / Forest green
  b: { light: '#93c5fd', dark: '#2563eb' }, // Light blue / Royal blue
  c: { light: '#67e8f9', dark: '#0d9488' }, // Aqua cyan / Teal cyan
  m: { light: '#f0abfc', dark: '#a21caf' }, // Bright magenta / Deep magenta
  y: { light: '#fde047', dark: '#92400e' }, // Bright yellow / Golden yellow
  w: { light: '#f1f5f9', dark: '#94a3b8' }, // White / Silver grey
  k: { light: '#e2e8f0', dark: '#0f172a' }, // Light grey / Pure black
};

/**
 * Resolves a color value, expanding single-letter shorthands to hex.
 * Pass `isDark=true` to get the dark-theme variant of a shorthand.
 * Non-shorthand values are returned unchanged.
 */
export function resolveColor(color: string, isDark: boolean): string {
  const entry = SHORTHAND_COLORS[color.trim()];
  if (entry) return isDark ? entry.dark : entry.light;
  return color;
}

/**
 * Computes a contrasting text color (black or white) for a given background color.
 * Supports #rrggbb and #rgb hex strings. Falls back to white for non-hex inputs.
 */
export function computeTextColor(bgColor: string): string {
  const hex = bgColor.replace(/^#/, '');

  let r: number, g: number, b: number;

  if (hex.length === 3) {
    r = parseInt((hex[0] ?? '') + (hex[0] ?? ''), 16);
    g = parseInt((hex[1] ?? '') + (hex[1] ?? ''), 16);
    b = parseInt((hex[2] ?? '') + (hex[2] ?? ''), 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    return '#ffffff';
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
