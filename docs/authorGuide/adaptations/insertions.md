{% set title = "Adaptation Insertions" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Author Guide - Adaptation Insertions"
  layout: authorGuide.md
  pageNav: 3
  pageNavTitle: "Topics"
</frontmatter>

## Insertions

`<cv-insertion>`

**Insertions** let adopters inject their own content at specific points in site pages — without modifying the original source. They are ideal for institution-specific preambles, deadline reminders, or notes before exercises that the original site author has designated as injectable.

**View as:** [NUS](./insertions.html?adapt=nus) · [Reset](./insertions.html?adapt=clear)

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-insertion insertion-id="week1-preamble">

*No institution-specific note for this section.*

</cv-insertion>

<cv-insertion insertion-id="week2-preamble" align="justify" outline="none">

*No institution-specific note for this section.*

</cv-insertion>
</variable>
</include>

When the active adaptation has a matching block in its `insertions.html`, the `<cv-insertion>` element renders it as a styled adopter callout. When there is no matching block — or no adaptation is active — the **default slot content** (children) is shown instead.

### Basic Syntax

```html
<cv-insertion insertion-id="exercise-1-preamble">
  Default content shown when no insertion matches.
</cv-insertion>
```

> `insertion-id` attribute is used for the lookup key for the `<cv-insertion insertion-id="...">` element, while the matching `<div id="...">` block in `insertions.html` uses `id` as the lookup key. This is because standard `id` attributes must be unique per page. This allows you to safely reuse the same insertion point multiple times without breaking HTML validation or browser anchor routing.

### `insertions.html` Format

Each adopter creates an `insertions.html` file in their adaptation folder. Each `<div id="...">` element defines one injection block — the `id` is the lookup key and the `innerHTML` is what gets rendered.

**`insertions.html` / `insertions.md` (for static site generators like MarkBind)**

```html
<!-- versions/org-a/insertions.html -->
<div id="week1-preamble">
  <p>
    <strong>NUS CS2103T students:</strong> Before starting this section, make sure you have
    accepted the GitHub Classroom invitation and set up your individual project repository.
    Refer to the course schedule for this week's exact deadline.
  </p>
</div> 

<!-- versions/org-a/insertions.md (for MarkBind or SSGs):-->
<div id="week2-preamble" color="#ef4444">

Complete this right after Week 1's tasks. This exercise is **examinable** —
ensure you understand each step before proceeding.

</div>
```

The `insertion-id` links the tag to a `<div id="...">` in the adopter's `insertions.html`. When a match is found, the adopter's HTML replaces the default slot content and is wrapped in a labelled callout block.

<box type="info">

Only `<div id="...">` elements are extracted — at any depth in the file. Other top-level elements (paragraphs, comments, etc.) are ignored.

</box>

<box type="tip">

You can include any HTML inside the `<div>` blocks: paragraphs, lists, bold text, links, etc. The content is rendered as-is inside the adopter callout.

</box>

### Attributes of `<cv-insertion>`

| Name           | Type      | Default      | Description |
| -------------- | --------- | ------------ | ----------- |
| `insertion-id` | `string`  | **required** | The lookup key. Must match the `id` attribute of a `<div>` in the active adaptation's `insertions.html`. |
| `color`        | `string`  | —            | Custom color for the inserted callout (e.g. `#ef4444`). Takes highest precedence, overriding the `<div>` attribute. |
| `align`        | `string`  | —            | Text alignment for both the injected content and the fallback slot (`left`, `center`, `right`, or `justify`). |
| `hide-badge`   | `boolean` | `false`      | When present, the attribution badge ("inserted for version...") is completely hidden. |
| `outline`      | `string`  | `"dashed"`   | Border style for the callout box (`dashed`, `solid`, or `none`). |

**Slot (default content):** Any children inside `<cv-insertion>` are rendered when no adaptation is active, or when the active adaptation has no matching `id` in its `insertions.html`.

<br>

### Attributes of `<div>` (in insertions.html)

| Name    | Type     | Default      | Description |
| ------- | -------- | ------------ | ----------- |
| `id`    | `string` | **required** | The lookup key. Must match the `insertion-id` of a `<cv-insertion>` tag. |
| `color` | `string` | —            | Custom color for the callout (e.g. `#ef4444`). Overridden by the `<cv-insertion>` tag's `color` attribute. |
| `align` | `string` | —            | Text alignment for the injected content (`left`, `center`, `right`, or `justify`). Overridden by the `<cv-insertion>` tag's `align` attribute. |
| `outline` | `string` | —            | Border style for the callout box (`dashed`, `solid`, or `none`). Overridden by the `<cv-insertion>` tag's `outline` attribute. |


### With Custom Color

Use the `color` attribute to override the color of the callout box and its label. This is useful for color-coding specific insertions (e.g. red for deadlines, green for tips). You can provide any valid CSS color, including hex codes like `#ef4444`.

```html
<cv-insertion insertion-id="exercise-1-preamble" color="#ef4444">
  Default content shown when no insertion matches.
</cv-insertion>
```

When omitted, the color defaults to a neutral gray.

### No Default Content

If an insertion point has no meaningful default, you can use a self-closing tag. The element renders nothing when no matching block is found:

```html
<cv-insertion insertion-id="week3-note" />
```


## File Placement

By default, CustardUI looks for `insertions.html` in the same folder as the adaptation's JSON config:

```
{baseUrl}/{adaptationsPath}/{id}/insertions.html
```

| `data-base-url` | `adaptationsPath` | Adaptation id | Fetched from |
| --- | --- | --- | --- |
| `/docs` | `versions` *(default)* | `org-a` | `/docs/versions/org-a/insertions.html` |
| `/docs` | `adaptations` | `org-a` | `/docs/adaptations/org-a/insertions.html` |
| *(empty)* | `versions` *(default)* | `org-a` | `/versions/org-a/insertions.html` |

The conventional layout keeps the insertions file alongside the adaptation config:

```
versions/
  org-a/
    org-a.json       ← adaptation config
    insertions.html  ← adopter insertions
    index.md         ← optional landing page
```

### Custom Filename

To use a different filename, set `insertionsFile` in the adaptation's JSON config:

```json
{
  "id": "org-a",
  "insertionsFile": "notes.html"
}
```

CustardUI will then fetch `{adaptationsPath}/org-a/notes.html` instead. If the field is omitted, `insertions.html` is used.

<box type="info">

If the file is missing (404), CustardUI silently skips loading insertions — no error is shown and all `<cv-insertion>` tags fall back to their default slot content.

</box>

---
<br>

## Adaptation Config

The `insertionsFile` field is optional and belongs at the top level of the adaptation JSON:

```json
{
  "id": "nus",
  "name": "NUS",
  "insertionsFile": "insertions.html",
  "preset": {
    "toggles": { "nus-resources": "show" }
  }
}
```

The `name` field is used as the attribution label in all `<cv-insertion>` callout badges for this adaptation.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | — | Human-readable adaptation name. Shown as the attribution label in `<cv-insertion>` callouts. |
| `insertionsFile` | `string` | `"insertions.html"` | Filename of the insertions file within the adaptation folder. |

See [Adaptation Configuration](./configuration.html) for the full JSON schema.


## Troubleshooting

* **Insertion not showing?** Check that the `insertion-id` attribute on the tag exactly matches the `id` attribute on the `<div>` in `insertions.html` (case-sensitive).
* **Default content showing instead of adopter block?** Verify that the adaptation is active (`#/id` in the URL or `?adapt=id`), and that `insertions.html` is accessible at the expected path.
* **No content at all?** If neither the adopter block nor the default slot content appears, ensure the `<cv-insertion>` tag has children for the fallback case, or check browser network tools to confirm the insertions file was fetched.
* **Wrong attribution label?** Set the `name` field in the adaptation's JSON config.

<br>
