<frontmatter>
  title: "Developer Guide - DOM Element Locator and Anchors"
  layout: devGuide.md
  pageNav: 3
</frontmatter>

## Overview

**Plugin needs a way to identify and locate specific unstructured DOM elements.**

The **Anchor** system (`src/lib/features/anchor/`) provides a way to durably identify, serialize, and re-locate specific DOM elements, across page reloads and minor content change. It is the backbone of the Share, Highlight, and Focus features, all of which need to encode element selections into URLs and recover them on the next visit.

* A naive approach to identify a DOM element might be to use exact position or a CSS/XPath selector. However, both break easily: e.g. if we add a sentence above or rename a class. The anchor system instead creates a **content fingerprint**, a compact snapshot that combines structural position *and* hashed text content. This makes element identification resilient to surrounding edits while remaining cheap to compute and URL-safe to store. 

## Generating an Anchor Descriptor

In order to create a stable anchor, we need to capture information of the HTML element. An anchor descriptor is a small record that captures everything needed to identify an element. `createDescriptor(el)` captures four orthogonal signals — type, location, content, and identity — each capturing a dimension to improve the fingerprinting.

| Field | Source | Role in resolution |
|---|---|---|
| `tag` | `el.tagName` | **Type** — filters the candidate pool to the same element type |
| `index` | Position among all same-tag descendants of the `parentId` element | **Location** — structural fast-path, O(1) if the DOM is unchanged |
| `parentId` | Nearest ancestor `.id` walked up the parent chain | **Location** — narrows the search scope; index is relative to this subtree |
| `textSnippet` | First 32 chars of normalized text | **Content** — cheap prefix check when hash fails |
| `textHash` | 32-bit hash of full normalized text | **Content** — high-confidence match; survives index drift |
| `elementId` | `el.id` | **Identity** — direct O(1) lookup; bypasses all scoring when present |
| `color`, `annotation`, `annotationCorner` | User-set at selection time | Not used in resolution; carried for feature rendering |

**Notes**:
* `index` is computed via `container.querySelectorAll(tag)`, which returns **all** descendants of `container` with that tag, not just direct children. For example, if the tag is `p`, an element nested three levels deep inside `#section` is still counted against every other `p` anywhere inside `#section`. The index refers to the same traversal order, unless there has been a content change that has shifted the element's position. 
* If that fails, the resolver will attempt to find the element using the text hash and snippet. More info in the [below section](#resolving-an-anchor-descriptor).

```
#section
  └─ div
       ├─ <p>  ← index 0
       └─ <p>  ← index 1
  └─ <p>       ← index 2  (not index 0, even though it is a direct child)
```


### Stable Text & Placeholder Awareness

Additionally, we need to make sure that the text we use to create the anchor is stable and consistent. This is especially important when dealing with placeholders. Text hashing must be consistent between *share time* (when the page may have live placeholder values) and *load time* (when placeholders may not be resolved yet). The system canonicalizes all `[[placeholder]]` tokens to a fixed form before hashing, so that an element reading *"Hello alice!"* at share time and *"Hello \\[[username]]!"* at load time produce the same hash.

### Serialization

Descriptors are serialized to a compact, URL-safe string for embedding in query parameters (`?cv-show=...`, `?cv-hide=...`, `?cv-highlight=...`). Two formats are used:

- **Human-readable** — when every selected element has a stable `id`, the string is a simple comma-separated list of those IDs (optionally decorated with color or annotation).
- **Base64 JSON** — the fallback for elements without IDs, encoding the full descriptor payload.

Deserialization detects which format is present automatically.



## Resolving an Anchor Descriptor 

A shared link may contain one or more anchor descriptors, which each match a DOM element. Hence, when a link is opened, each descriptor must be matched back to a live DOM element, in order to highlight, show, or hide the element. Resolution uses a **priority-ordered scoring strategy**:

* **Overview of Resolution Order**: If the descriptor has an `elementId`, the resolver looks it up directly. Next, if `parentId` is set, narrow search scope to that element, else search the whole document. Within the scope, check the element at `index`, if the hash matches, return the element.  If that fails, scan all same-tag descendants in the scope, scoring by hash, snippet prefix and index position. Return best match.
* **Scope**: When creating the descriptor, if a parent with `.id` is found, the index is computed within that element's subtree; otherwise `document.body` is used. When resolving, if `parentId` resolves via `getElementById`, the search is scoped to that element; otherwise the search falls back to `document.body`. Both sides use the same fallback, so the index pool always matches.

```
Direct ID lookup  →  Index + hash perfect match  →  Full scored scan  →  No match
```

The full scan scores each candidate element by how well its content hash, text prefix, and structural index align with the descriptor. A match is only accepted if the score clears a confidence threshold, preventing false positives when content has drifted significantly. The content scan can still recover the element via text hash.

### Resolution Algorithm

`resolve(descriptor)` attempts four strategies in order of cost, returning as soon as one succeeds.

<mermaid>
flowchart LR
    A([resolve]) --> B{elementId?}
    B -- yes --> C["ID lookup\nCSS.escape(elementId)"]
    C -- found --> R1([return matches])
    C -- "not found\ntag = ANY" --> R2([return empty])
    C -- "not found\ntag ≠ ANY" --> D
    B -- no --> D

    D{parentId?} -- yes --> E["getElementById\nscope = parent"]
    D -- "no / not found" --> F[scope = document.body]
    E --> G
    F --> G

    G["querySelectorAll(tag)"] --> H{"index hit\n+ hash match?"}
    H -- yes --> R3([return — fast path])
    H -- no --> I["scored scan\n+50 hash · +30 snippet · +10 index"]
    I --> J{score > 30?}
    J -- yes --> R4([return best match])
    J -- no --> R5([return empty])
</mermaid>

### Scoring thresholds

| Signal | Score | When it fires |
|---|---|---|
| Exact text hash | +50 | Full content matches exactly |
| Snippet prefix | +30 | First 32 chars match, hash diverged (content grew/shrank) |
| Index position | +10 | Element is at the same structural slot |
| Hash + Index | 60 → early exit | Near-certain match; skip remaining candidates |
| Minimum threshold | >30 | Snippet alone (30) is **rejected**; requires hash OR snippet+index |

A snippet-only match scores exactly 30, which fails the `> 30` threshold. This is intentional: a prefix match without structural corroboration is too weak to accept as correct.

---

### Data Flow

<mermaid>
graph LR
    A[Select element] --> B(Fingerprint)
    B --> C{Stable ID?}
    C -- Yes --> D[Human-readable ID]
    C -- No --> E[Base64 JSON payload]
    D & E --> F[URL query parameter]

    F --> G[Load & Resolve from URL]
    G -- "ID present" --> H["Direct ID lookup"]
    G -- "Index/Hash hit" --> I["O(1) structural fast-path"]
    G -- "Fallback" --> J["Scored fuzzy scan"]

    H & I & J --> K[Apply feature: highlight/focus/share]
</mermaid>



## Key Considerations

- **No backend required** — the entire anchor state lives in the URL; nothing is persisted server-side.
- **Resilience over precision** — the scoring system prefers a confident near-match over failing outright when content has changed slightly.
- **Placeholder stability** — hashing always operates on the canonical template form of text, not the runtime-resolved value, so hashes remain consistent across page states.
- **Duplicate ID tolerance** — the system handles pages with duplicate HTML `id` attributes gracefully, returning all matches rather than stopping at the first.

### Inspiration and Future Work

The fingerprinting was inspired by similarity search (k-shingles and min hashing). Future work can expand on this idea.

<box type="info">

**Similarity Search**:

Similarity search is used to find objects ”similar” to each other. Distance and Similarity Measures include Euclidean Distance, Manhattan Distance, Cosine Similarity, Jaccard Similarity.
* Jaccard Similarity: |A∩B| / |A∪B|
* Jaccard Distance: 1−sJaccard(A,B)

For a case study of finding similar documents, we can use shingling and min-hash.

**Shingling**:
* A k-shingle (or k-gram) is sequence of ktokens (words / chars) that appears in
document. E.g. ’the cat is glad’ →set of 2-shingles: {’the cat’,’cat is’,’is glad’}
* Similarity Metric for Shingles: Each document $D_i$ represented as set of shingles
$C_i$. Similarity of ($D_1$, $D_2$): $s_{Jaccard}(D_1,D_2) = \frac{|C_1 \cap C_2 |}{|C_1 \cup C_2 |}$
* Challenge: For large datasets, comparing all pairs directly computationally expensive (O($N^2$) comparison). To address this, use Min-Hashing.

**Min-Hashing**: (Each shingle hashes to a int, get min int value of all shingles)
Convert large sets of shingles into short signatures while preserving similarity.
Highly similar = high probability of same signature. Dissimilar docs low prob.
1. Define a hash function hthat maps each shingle to an integer.
2. For each document, compute min hash value across all shingles →’signature’.
3. Use multiple independent hash functions to generate multiple signatures.
* Key Property of Min-Hashing: probability two documents have same MinHash
signature is equal to Jaccard similarity.
* Candidate Pairs: Compare signatures (e.g. > k matching signatures).

</box>


