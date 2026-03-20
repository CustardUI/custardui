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

Place the file at `{baseUrl}/{id}/{id}.json`. For a site with `data-base-url="/docs"` and adaptation id `dark`:

```
/docs/dark/dark.json
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

That's it. No script tag changes needed — the path is derived automatically from `data-base-url`.

---

## File Placement

Adaptation JSON files are resolved relative to your site's `data-base-url`:

```
{baseUrl}/{id}/{id}.json
```

| `data-base-url` | Adaptation id | Fetched from |
| --- | --- | --- |
| `/docs` | `nus` | `/docs/nus/nus.json` |
| *(empty)* | `client-a` | `/client-a/client-a.json` |

The convention co-locates the adaptation JSON with any landing page content for that variant:

```
docs/
  nus/
    index.md       ← NUS landing page
    nus.json       ← adaptation config
```


## Per-Page Activation

To activate a specific adaptation on a particular page — so that visiting the page always switches to that adaptation regardless of what is currently stored — add a meta tag to the page's `<head>`:

```html
<meta name="cv-adapt" content="ntu">
```

In MarkBind, use the `<head-bottom>` tag:

```html
<head-bottom>
  <meta name="cv-adapt" content="ntu">
</head-bottom>
```

This is useful for institution-specific landing pages: visiting `/nus/` always switches the visitor to the NUS theme, even if they previously had a different adaptation active.

<box type="info">

The meta tag wins over `localStorage` but not over `?adapt=clear`. A visitor who explicitly clears their adaptation and then navigates back to the page will have the adaptation re-activated by the meta tag.

</box>

---

## Activation Landing Page

`{id}/index.md` is the page users reach when they navigate directly to `/{baseUrl}/{id}/` — for example, from a shared institution link or a navbar entry. Without it, the SSG serves a 404 or an empty page.

The recommended pattern is:

1. A **meta tag** in the page activates the adaptation (highest priority, fires before any `localStorage` value).
2. A **client-side JS redirect** immediately sends the user to the main content page.

Because the meta tag is processed before the redirect fires, the adaptation is already persisted to `localStorage` by the time the user arrives on the main page — so they see the correct theme without any flicker or extra round-trip.

**MarkBind example**

Create a layout file that injects the meta tag:

`_markbind/layouts/nus.md`
```html
<head-bottom>
  <meta name="cv-adapt" content="nus">
</head-bottom>
```

Then use that layout in the landing page and add the redirect:

`docs/nus/index.md`
```html
<frontmatter>
  layout: nus.md
</frontmatter>

<script>
  window.location.href = "../index.html"
</script>
```

**Alternative: real landing page**

If you want users to actually land on `/{id}/` rather than be redirected, omit the `<script>` block and put your content directly in `index.md`. The meta tag alone is enough to activate the adaptation.

---

## Clearing an Adaptation

To deactivate the current adaptation and return to the site defaults, link to `?adapt=clear`:

```html
<a href="?adapt=clear">Reset to default theme</a>
```

This removes the stored adaptation. On the next page load (without a page meta tag), no adaptation will be active.

---