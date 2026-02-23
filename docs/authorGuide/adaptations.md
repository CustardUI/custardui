{% set title = "Site Adaptations" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Author Guide - Site Adaptations"
  layout: authorGuide.md
  pageNav: 2
  pageNavTitle: "Topics"
</frontmatter>

# {{ title }}

**Adaptations** let you ship pre-configured site variants — different branding and default content states — that activate for a specific audience from a single URL parameter.

Common use cases:
- A documentation site shared across multiple institutions, each with their own colour scheme and default content selections.
- A platform-specific landing page that pre-selects the relevant OS toggle for every visitor.
- A preview link sent to a client that activates their branded theme.

---

## How It Works

An adaptation is a JSON file hosted alongside your site content. When a user visits a URL with `?adapt=<id>`, CustomViews fetches that file, applies the theme and state overrides, and persists the active adaptation to `localStorage` — so it remains active across all pages without the parameter needing to be in every URL.

**Activation priority (highest wins):**

1. `?adapt=<id>` URL parameter — explicit, one-time activation via link
2. `<meta name="cv-adaptor" content="<id>">` on the page — forces a specific adaptation for that page on every visit
3. `localStorage` — persisted from a previous activation

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
  },
  "ui": {
    "badge": {
      "label": "Dark theme active"
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

---

## Adaptation JSON Schema

```json
{
  "id": "nus",
  "name": "NUS",
  "theme": {
    "cssVariables": {
      "--cv-primary": "#003d7c",
      "--cv-primary-hover": "#002d5c"
    },
    "cssFile": "/nus/nus-extra.css"
  },
  "defaults": {
    "toggles": {
      "linux": "show",
      "windows": "hide"
    },
    "placeholders": {
      "username": "NUS Student"
    }
  }
}
```

### Top-level fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | **Yes** | Must exactly match the filename and the `?adapt=` value. |
| `name` | `string` | No | Human-readable name (reserved for future UI use). |
| `theme` | `object` | No | CSS overrides applied immediately on activation. |
| `defaults` | `object` | No | State overrides applied before persisted user choices. |

### `theme`

| Field | Type | Description |
| --- | --- | --- |
| `cssVariables` | `Record<string, string>` | CSS custom properties set on `document.documentElement`. Applied immediately on page load — before CustomViews finishes initializing — to prevent flash of unstyled content. |
| `cssFile` | `string` | URL to an additional stylesheet to inject. The `<link>` tag is added idempotently (only once per page). |

### `defaults`

Adaptation defaults are applied **before** the user's persisted state, so users can still override them from the settings modal.

| Field | Type | Description |
| --- | --- | --- |
| `toggles` | `Record<string, "show" \| "hide" \| "peek">` | Override the default state of named toggles. Toggle IDs must exist in `customviews.config.json`. Unknown IDs are silently ignored. |
| `placeholders` | `Record<string, string>` | Override the default value of named placeholders. |

---

## State Layering Precedence

When determining the initial toggle state, CustomViews applies layers in this order:

| Priority | Layer | Notes |
| --- | --- | --- |
| 1 (lowest) | Config file defaults | Defined in `customviews.config.json` |
| 2 | **Adaptation `defaults`** | Override config defaults; user can still change |
| 3 | Persisted user state | User's previous choices from `localStorage` |
| 4 (highest) | URL delta (`?t-show=…`) | Sparse override from a shared link |

---

## Per-Page Activation

To activate a specific adaptation on a particular page — so that visiting the page always switches to that adaptation regardless of what is currently stored — add a meta tag to the page's `<head>`:

```html
<meta name="cv-adaptor" content="ntu">
```

In MarkBind, use the `<head-bottom>` tag:

```html
<head-bottom>
  <meta name="cv-adaptor" content="ntu">
</head-bottom>
```

This is useful for institution-specific landing pages: visiting `/nus/` always switches the visitor to the NUS theme, even if they previously had a different adaptation active.

<box type="info">

The meta tag wins over `localStorage` but not over `?adapt=clear`. A visitor who explicitly clears their adaptation and then navigates back to the page will have the adaptation re-activated by the meta tag.

</box>

---

## Clearing an Adaptation

To deactivate the current adaptation and return to the site defaults, link to `?adapt=clear`:

```html
<a href="?adapt=clear">Reset to default theme</a>
```

This removes the stored adaptation and its badge-dismissed flag from `localStorage`. On the next page load (without a page meta tag), no adaptation will be active.

---

## Example: Institution Adaptation of this Site

For example, we want this documentation site to be customized for NUS. 

**`docs/nus/index.md`**
```html
<head-bottom>
  <meta name="cv-adaptor" content="nus">
</head-bottom>
```

**`docs/nus/nus.json`**
```json
{
  "id": "nus",
  "theme": {
    "cssVariables": { "--cv-primary": "#003d7c" }
  },
  "defaults": {
    "toggles": { "linux": "show", "windows": "hide" },
    "placeholders": { "username": "NUS Student" }
  }
}
```

Students linked to `/nus/` get the NUS theme immediately; the theme persists as they navigate the rest of the site.

See the [live demo](/nus/index.md) for an interactive example.

---

<panel header=":fa-solid-lightbulb: Troubleshooting">

**Adaptation not activating?**
- Open the browser Network tab and confirm the JSON file is being fetched from `{baseUrl}/{id}/{id}.json` and returning HTTP 200.
- Check that `"id"` in the JSON exactly matches the filename and the `?adapt=` value. A mismatch causes CustomViews to silently clear the stored adaptation.

**CSS variables not applying?**
- Variables are set on `document.documentElement` (`<html>`). Make sure your CSS references them on `:root` or `html`, not a scoped selector.
- CSS variable names must include the leading `--` (e.g. `"--cv-primary": "#003d7c"`).


</panel>
