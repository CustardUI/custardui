<frontmatter>
  title: "Developer Guide - URL Encoding"
  layout: devGuide.md
  pageNav: 3
</frontmatter>


## Overview
This document explains the technical architecture, behavior, and URL encoding schemes used for Focused Views, specifically for tracking and resolving selected elements and highlighted text when links are shared. CustardUI's text highlighting is built to be extremely robust, enduring minor content edits and code updates without breaking.

## Text Highlighting (`?cv-highlight=`)

Standard browser text fragments can be fragile. CustardUI solves this by snapshotting selections as a list of `TextRangeDescriptor` objects.

Text highlights are stored in the URL under the `cv-highlight` query parameter. To keep the URL length manageable, the descriptors use a dense, colon-separated format instead of raw JSON. Multiple highlights are joined together using a comma `,` as the delimiter.

For each highlight descriptor, the encoding falls into one of three formats depending on the context available in the DOM:

### 1. Element ID Format (`e:`)
Used when the text container has a direct `id` attribute.

**Format:**
`e:<startEnc>:<endEnc>:<textLen>:<elementId>:<containerHash>:<textHash>[:<color>]`

- `e`: Prefix indicating the Element ID format.
- `startEnc`: URI-encoded snippet of the first 16 characters of the highlighted text (whitespace-normalized, spaces converted to `+`).
- `endEnc`: URI-encoded snippet of the last 16 characters of the highlighted text (whitespace-normalized, spaces converted to `+`). If the total highlight is 16 characters or less, this is omitted (left empty) to prevent duplication, resulting in `::`.
- `textLen`: Character length of the highlighted text.
- `elementId`: The direct DOM `id` of the container.
- `containerHash`: A numeric hash of the container's stable text content (used to verify if the container structure changed).
- `textHash`: A numeric hash of the full highlighted text.
- `color` (optional): The color key (e.g., `yellow`, `blue`). Defaults to `yellow`.

### 2. Container ID Format (`c:`)
Used when the text container doesn't have an `id`, but one of its ancestor elements does. 

**Format:**
`c:<startEnc>:<endEnc>:<textLen>:<containerId>:<containerTag>:<containerIndex>:<containerHash>:<textHash>[:<color>]`

- `c`: Prefix indicating the Container ID format.
- `startEnc`: URI-encoded snippet of the first 16 characters of the highlighted text (whitespace-normalized, spaces converted to `+`).
- `endEnc`: URI-encoded snippet of the last 16 characters of the highlighted text (whitespace-normalized, spaces converted to `+`).
- `textLen`: Character length of the highlighted text.
- `containerId`: The DOM `id` of the nearest ancestor.
- `containerTag`: The HTML tag name of the text container (e.g., `P`, `DIV`).
- `containerIndex`: The zero-based index of the container among siblings of the same tag within the scope of the `containerId`.
- The remaining fields (`containerHash`, `textHash`, `color`) follow the exact same format as above.

### 3. Fallback Format (Base64 JSON)
Used when no `id` is available anywhere in the ancestor chain. It encodes the properties into a minified JSON object and converts it to Base64 to ensure it remains URL-safe.

**Format:**
`[Base64 Encoded JSON]`

**JSON Payload:**
```json
{
  "ct": "containerTag",
  "ci": 0,       // containerIndex
  "ch": 123456,  // containerHash
  "s": "start",  // start text snippet
  "e": "end",    // end text snippet
  "th": 654321,  // textHash
  "tl": 42,      // textLength
  "c": "yellow"  // color (optional)
}
```

### Encoding Safety
To ensure the parsing delimiter `:` doesn't conflict with text content, the text snippets (`startEnc` and `endEnc`) are strictly encoded using `encodeURIComponent()` during serialization and decoded with `decodeURIComponent()` upon resolution.

## Resolution Flow on Load
When a recipient visits a CustardUI page with a `?cv-highlight=...` query parameter:

1. **Extraction**: `FocusService` extracts the parameter on page load or `popstate`.
2. **Fuzzy Container Lookup**:
   * It attempts direct element lookup via `elementId`.
   * If the ID is missing or text has changed, it falls back to the ancestor path (`containerId`, `containerTag`, `containerIndex`).
   * If the `containerHash` doesn't match, it scans neighboring sibling elements of the same tag to find a container with a matching hash.
   * If all hash checks fail (e.g. major text edits), it falls back to the original index.
3. **Text Range Matching**:
   * It builds a flat index map of all text nodes within the resolved container.
   * It searches for `startText` (exact matching first, then whitespace-normalized fallback).
   * For long ranges, it searches for `endText` near the expected offset (`startOffset + textLength`). For short ranges, it advances by `textLength`.
   * It reconstructs the browser `Range`.
4. **Integrity Validation**:
   * It calculates the hash of the resolved range.
   * If the text hash matches `textHash` exactly, the highlight is verified.
   * If the text hash does *not* match (indicating someone changed a few words inside the highlighted range in the source code), CustardUI **still applies the highlight** to the best-matching range but displays a helpful toast:
     <!-- > [!WARNING]
     > *Some highlighted text may have changed since this link was created.* -->

5. **Rendering Path**:
   * **CSS Custom Highlight API (Modern Browsers)**: Registered via `CSS.highlights.set()`. The ranges are painted using CSS pseudo-elements:
     ```css
     ::highlight(cv-hl-yellow) { background-color: oklch(91% 0.19 96); color: oklch(22% 0.05 60); }
     ```
     This method requires zero changes to the DOM tree, guaranteeing super-fast performance and preventing layout thrashing.
   * **DOM Fallback (Older Browsers)**: If the browser does not support the CSS Highlight API, the range is wrapped with a `<mark>` element:
     ```html
     <mark class="cv-hl-fallback cv-hl-fallback--yellow">highlighted text</mark>
     ```
6. **Viewport Scroll**:
   * The first successfully resolved highlight range is scrolled into view smoothly:
     ```js
     firstRange.startContainer.parentElement?.scrollIntoView({
       behavior: 'smooth',
       block: 'center'
     });
     ```
