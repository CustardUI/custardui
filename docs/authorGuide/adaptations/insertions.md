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

**View Adaptations:** [NUS](./insertions.html?adapt=nus) · [Reset to Default](./insertions.html?adapt=clear)

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-insertion insertion-id="week1-preamble">
 <md>*No note for this section.*</md>
</cv-insertion>

<cv-insertion insertion-id="week2-preamble" align="justify" default-style="none">

*No note for this section.*
</cv-insertion>

<cv-insertion insertion-id="week3-note" outline="solid"/>
</variable>
</include>

When the active adaptation has a matching block in its `insertions.html`, the `<cv-insertion>` element renders it as a styled adopter callout. When there is no matching block — or no adaptation is active — the **default slot content** (children) is shown instead. By default, this fallback content is also rendered inside the same styled callout box to prevent layout shifts. The styling can be disabled.

### Basic Syntax

```html
<cv-insertion insertion-id="exercise-1-preamble">
  Default content shown when no insertion matches.
</cv-insertion>
```

> `insertion-id` attribute is used as the lookup key for the matching `id` of the `<div id="...">` block in `insertions.html`. As `id` should be unique per page, this allows safe reuse of insertion points multiple times across a page.

### Source `insertions.html` Format

Each adopter creates an `insertions.html` file in their adaptation folder. Each `<div id="...">` element defines one injection block — the `id` is the lookup key and the `innerHTML` is what gets rendered.

**`insertions.html` / `insertions.md` (for static site generators like MarkBind)**

```html
<!-- versions/org-a/insertions.html -->
<div id="week1-preamble">
  <p>
    <strong>Students:</strong> Before starting this section, make sure you have
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

<cv-insertion default-badge="org-a">
  <p>
    <strong>Students:</strong> Before starting this section, make sure you have
    accepted the GitHub Classroom invitation and set up your individual project repository.
    Refer to the course schedule for this week's exact deadline.
  </p>
</cv-insertion>

<cv-insertion color="#ef4444" default-badge="org-a">

Complete this right after Week 1's tasks. This exercise is **examinable** —
ensure you understand each step before proceeding.

</cv-insertion>

The `insertion-id` links the tag to a `<div id="...">` in the adopter's `insertions.html`. When a match is found, the adopter's HTML replaces the default slot content and is wrapped in a labelled callout block.

* Only `<div id="...">` elements are parsed in `insertion.html`. Other elements (paragraphs, comments, etc.) not contained in these `div` elements are ignored.
* You can include any HTML inside the `<div>` blocks: paragraphs, lists, bold text, links, etc.


### Attributes of `<cv-insertion>`

| Name           | Type      | Default      | Description |
| -------------- | --------- | ------------ | ----------- |
| `insertion-id` | `string`  | —            | The lookup key. Must match the `id` attribute of a `<div>` in the active adaptation's `insertions.html`. If omitted, the element acts as a static UI component that is never replaced. |
| `color`        | `string`  | —            | Custom color for the inserted callout (e.g. `#ef4444`). Takes highest precedence, overriding the `<div>` attribute. |
| `align`        | `string`  | —            | Text alignment for both the injected content and the fallback slot (`left`, `center`, `right`, or `justify`). |
| `hide-badge`   | `boolean` | `false`      | When present, the attribution badge ("inserted for version...") is completely hidden. |
| `outline`      | `string`  | `"dashed"`   | Border style for the callout box (`dashed`, `solid`, or `none`). Applies to both default content and adaptation content. |
| `default-style`| `string`  | `"callout"`  | How the default slot content is styled when no adaptation matches (`callout` or `none`). Does not apply when adaptations are active. |
| `default-badge`| `string`  | —            | Badge text to show when rendering the default slot as a callout (e.g. `Base Version`). Does not apply when adaptations are active. |

<br>

### Attributes of `<div>` (in insertions.html)

| Name    | Type     | Default      | Description |
| ------- | -------- | ------------ | ----------- |
| `id`    | `string` | **required** | The lookup key. Must match the `insertion-id` of a `<cv-insertion>` tag. |
| `color` | `string` | —            | Custom color for the callout (e.g. `#ef4444`). Overridden by the `<cv-insertion>` tag's `color` attribute. |
| `align` | `string` | —            | Text alignment for the injected content (`left`, `center`, `right`, or `justify`). Overridden by the `<cv-insertion>` tag's `align` attribute. |
| `outline` | `string` | —            | Border style for the callout box (`dashed`, `solid`, or `none`). Overridden by the `<cv-insertion>` tag's `outline` attribute. |


### Component Rendering Behavior

The `<cv-insertion>` component behaves differently depending on the context:

1. **Default / No Active Adaptation**: When viewing the base site, the default content is rendered.
1. **Active Adaptation** with _Matching `<div id>` in `insertions.html`_: `Div` content is rendered inside the callout box.
1. **Active Adaptation** with _No Matching `insertion-id` to `<div id>`_: If an adaptation is active, but its `insertions.html` does not contain a `div` element with `id` corresponding to the `insertion-id`, nothing is rendered.

Alternatively, to use `<cv-insertion>` as a **pure UI element** that is never replaced, omit the `insertion-id` attribute. In this case, the component acts as a static UI wrapper that is never replaced, and will always render its default content across all adaptations.


### Default Content in Insertions

When the default content is displayed, it is rendered inside a styled callout box by default (`default-style="callout"`) so that the visual layout remains consistent with the adaptations. You can disable this by setting `default-style="none"` to render the fallback content completely unstyled/inline.


**Setting no default content**: If an insertion point has no meaningful default, you can use a self-closing tag. The element automatically renders nothing when there is no active adaptation enabled.

```html
<cv-insertion insertion-id="week3-note" />
```

<cv-insertion insertion-id="week3-note"/>

**View in Adaptation:** [NUS](./insertions.html?adapt=nus#default-content-in-insertions) · [Reset to Default](./insertions.html?adapt=clear#default-content-in-insertions)

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
