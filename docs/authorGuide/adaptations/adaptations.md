{% set title = "Site Adaptations" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Author Guide - Site Adaptations"
  layout: authorGuide.md
  pageNav: 2
  pageNavTitle: "Topics"
</frontmatter>

# {{ title }}

**Adaptations** are pre-configured site variants. It is meant for websites to use the same site page, but allow different branding, customizability for a specific audience just from a single URL parameter.

A use case is: A documentation site shared across multiple institutions, each with their own colour scheme and default content selections.


---

## How It Works

An adaptation is a JSON file hosted alongside your site content. When a user visits a URL with `?adapt=<id>` or a hash indicator like `#/id` (for example, `https://example.com/#/dark`), CustardUI fetches that file, applies the theme and state overrides, and persists the active adaptation to `localStorage` — so it remains active across all pages without the parameter or hash needing to be in every URL.

**Activation priority (highest wins):**
1. `<meta name="cv-adapt" content="<id>">` on the page — forces a specific adaptation for that page on every visit
1. Explicit URL activation — `?adapt=<id>` parameter or hash `#/id` indicator
1. `localStorage` — persisted from a previous activation

---

## Quick Start

**++Step 1: Create the adaptation JSON file++**

Place the file at `{baseUrl}/versions/{id}/{id}.json`. For a site with `data-base-url="/docs"` and adaptation id `dark`:

```
/docs/versions/dark/dark.json
```

Minimal example:

```json
{
  "id": "dark",
  "theme": {
    "cssVariables": {
      "--cv-primary": "#7c3aed"
    }
  }
}
```

**++Step 2: Link to it++**

```html
<a href="?adapt=dark">Switch to dark theme</a>
```

That's it. No script tag changes needed — the path is derived automatically from `data-base-url` and the `adaptationsPath` config option.

---

## File Placement

Adaptation JSON files are resolved relative to your site's `data-base-url` and the `adaptationsPath` setting in `custardui.config.json`:

```
{baseUrl}/{adaptationsPath}/{id}/{id}.json
```

| `data-base-url` | `adaptationsPath` | Adaptation id | Fetched from |
| --- | --- | --- | --- |
| `/docs` | `versions` *(default)* | `org-a` | `/docs/versions/org-a/org-a.json` |
| `/docs` | `adaptations` | `org-a` | `/docs/adaptations/org-a/org-a.json` |
| *(empty)* | `versions` *(default)* | `org-a` | `/versions/org-a/org-a.json` |

The convention co-locates the adaptation JSON with any landing page content for that variant:

```
docs/
  versions/
    org-a/
      index.md       ← Organization A landing page
      org-a.json     ← adaptation config
    org-b/
      index.md       ← Organization B landing page
      org-b.json     ← adaptation config
```

This keeps the site root clean regardless of how many adaptations you define.

### Configuring the Adaptations Path

By default, CustardUI looks for adaptation files inside a `versions/` subfolder of your `data-base-url`. You can change this with the `adaptationsPath` field in `custardui.config.json`:

```json
{
  "adaptationsPath": "variants",
  "config": { }
}
```

| Field | Default | Description |
| --- | --- | --- |
| `adaptationsPath` | `"versions"` | Subfolder (relative to `data-base-url`) where adaptation JSON files are stored. Set to `""` to place adaptation files directly under `data-base-url`. |

<box type="tip">

**Choosing a path name:** Use a short, descriptive folder name. Common choices are `versions/` (default), `adaptations/`, or `variants/`. The name does not appear in user-facing URLs, so pick whatever makes sense for your project structure.

</box>

---

## Per-Page Activation

To activate a specific adaptation on a particular page — so that visiting the page always switches to that adaptation regardless of what is currently stored — add a meta tag to the page's `<head>`:

```html
<meta name="cv-adapt" content="org-b">
```

In MarkBind, use the `<head-bottom>` tag:

```html
<head-bottom>
  <meta name="cv-adapt" content="org-b">
</head-bottom>
```

This is useful for variant-specific landing pages: visiting `/versions/org-a/` always switches the visitor to the Organization A adaptation, even if they previously had a different adaptation active.

<box type="info">

The meta tag wins over `localStorage` but not over `?adapt=clear`. A visitor who explicitly clears their adaptation and then navigates back to the page will have the adaptation re-activated by the meta tag.

</box>

---

## Activation Landing Page

`versions/{id}/index.md` is the page users reach when they navigate directly to `/{baseUrl}/versions/{id}/` — for example, from a customised institution link.

The recommended pattern is:

1. A **meta tag** in the page activates the adaptation (highest priority, fires before any `localStorage` value).
2. A **client-side JS redirect** immediately sends the user to the main content page.

Because the meta tag is processed before the redirect fires, the adaptation is already persisted to `localStorage` by the time the user arrives on the main page — so they see the correct theme without any flicker or extra round-trip.

**MarkBind example**

Create a layout file that injects the meta tag:

`_markbind/layouts/org-a.md`
```html
<head-bottom>
  <meta name="cv-adapt" content="org-a">
</head-bottom>
```

Then use that layout in the landing page and add the redirect:

`docs/versions/org-a/index.md`
```html
<frontmatter>
  layout: org-a.md
</frontmatter>

<script>
  window.location.href = "../../index.html"
</script>
```

**Alternative: real landing page**

If you want users to actually land on `/versions/{id}/` rather than be redirected, omit the `<script>` block and put your content directly in `index.md`. The meta tag alone is enough to activate the adaptation.

---

## Clearing an Adaptation

To deactivate the current adaptation and return to the site defaults, link to `?adapt=clear`:

```html
<a href="?adapt=clear">Reset to default theme</a>
```

This removes the stored adaptation. On the next page load (without a page meta tag), no adaptation will be active.

---