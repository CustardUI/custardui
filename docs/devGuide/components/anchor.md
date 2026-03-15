<frontmatter>
  title: "Developer Guide - DOM Element Locator and Anchors"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

## Overview

The **Anchor** system (`src/lib/features/anchor/`) provides a way to durably identify, serialize, and re-locate specific DOM elements — even after a page reload or minor content change. It is the backbone of the Share, Highlight, and Focus features, all of which need to encode element selections into URLs and recover them on the next visit.

---

## The Problem It Solves

A naïve approach to identifying a DOM element might use its position in the document (e.g., "the 3rd paragraph") or a CSS/XPath selector. Both break trivially: add a sentence above and the index is off; rename a class and the selector stops matching.

The anchor system instead creates a **content fingerprint** — a compact snapshot that combines structural position *and* hashed text content. This makes element identification resilient to surrounding edits while remaining cheap to compute and URL-safe to store.

---

## Core Concepts

### 1. The Anchor Descriptor

An anchor descriptor is a small record that captures everything needed to identify an element:

- **Tag** — the element type (e.g., `P`, `BLOCKQUOTE`)
- **Index** — position among siblings of the same tag within its nearest ID-bearing ancestor
- **Parent ID** — the nearest ancestor that carries a stable HTML `id`, used to narrow the search scope
- **Own ID** — the element's own `id`, if present (enables an O(1) direct lookup)
- **Text snippet** — the first 32 characters of normalized text content (fast prefix check)
- **Text hash** — a hash of the full normalized text content (confident content match)
- **Optional metadata** — highlight color, annotation text, annotation corner

### 2. Stable Text & Placeholder Awareness

Text hashing must be consistent between *share time* (when the page may have live placeholder values) and *load time* (when placeholders may not be resolved yet). The system canonicalizes all `[[placeholder]]` tokens to a fixed form before hashing, so that an element reading *"Hello alice!"* at share time and *"Hello [[username]]!"* at load time produce the same hash.

### 3. Serialization

Descriptors are serialized to a compact, URL-safe string for embedding in query parameters (`?cv-show=...`, `?cv-hide=...`, `?cv-highlight=...`). Two formats are used:

- **Human-readable** — when every selected element has a stable `id`, the string is a simple comma-separated list of those IDs (optionally decorated with color or annotation).
- **Base64 JSON** — the fallback for elements without IDs, encoding the full descriptor payload.

Deserialization detects which format is present automatically.

### 4. Resolution (Fuzzy Matching)

When a link is opened, each descriptor must be matched back to a live DOM element. Resolution uses a **priority-ordered scoring strategy**:

```
Direct ID lookup  →  Index + hash perfect match  →  Full scored scan  →  No match
```

The full scan scores each candidate element by how well its content hash, text prefix, and structural index align with the descriptor. A match is only accepted if the score clears a confidence threshold, preventing false positives when content has drifted significantly.

---

## Data Flow

<mermaid>
graph TD
    A[User selects element] --> B(Create Descriptor)
    B --> C{Has stable ID?}
    C -- Yes --> D[Human-readable format\nid:color:corner:note]
    C -- No --> E[Base64 JSON\nfull descriptor payload]
    D --> F[URL query parameter]
    E --> F
    F --> G[Page load / link visit]
    G --> H(Deserialize from URL)
    H --> I(Resolve descriptor → DOM element)
    I --> J{Match strategy}
    J -- Own ID present --> K[ID lookup via querySelectorAll]
    J -- Index + hash match --> L[O-1 structural lookup]
    J -- Fallback --> M[Scored full scan]
    K --> N[Apply feature: highlight / focus / share]
    L --> N
    M --> N
</mermaid>

---

## Module Layout

| Module | Responsibility |
|---|---|
| `types.ts` | The `AnchorDescriptor` shape |
| `stable-text.ts` | Placeholder-aware text extraction and hashing |
| `descriptor.ts` | Building a descriptor from a live DOM element |
| `serializer.ts` | Encoding descriptors to/from URL-safe strings |
| `resolver.ts` | Locating the best-matching element in the DOM |
| `index.ts` | Public re-exports for all consuming features |

---

## Key Considerations

- **No backend required** — the entire anchor state lives in the URL; nothing is persisted server-side.
- **Resilience over precision** — the scoring system prefers a confident near-match over failing outright when content has changed slightly.
- **Placeholder stability** — hashing always operates on the canonical template form of text, not the runtime-resolved value, so hashes remain consistent across page states.
- **Duplicate ID tolerance** — the system handles pages with duplicate HTML `id` attributes gracefully, returning all matches rather than stopping at the first.
