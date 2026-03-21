{% set title = "Adaptation Configurations" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Author Guide - Adaptation Configurations"
  layout: authorGuide.md
  pageNav: 2
  pageNavTitle: "Topics"
</frontmatter>

# {{ title }}

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
  "preset": {
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
| `preset` | `object` | No | State overrides applied before persisted user choices. |

### `theme`

| Field | Type | Description |
| --- | --- | --- |
| `cssVariables` | `Record<string, string>` | CSS custom properties set on `document.documentElement`. Applied immediately on page load — before CustardUI finishes initializing — to prevent flash of unstyled content. |
| `cssFile` | `string` | URL to an additional stylesheet to inject. The `<link>` tag is added idempotently (only once per page). |

### `preset`

Adaptation preset values are applied **before** the user's persisted state, so users can still override them from the settings modal.

| Field | Type | Description |
| --- | --- | --- |
| `toggles` | `Record<string, "show" \| "hide" \| "peek">` | Override the default state of named toggles. Toggle IDs must exist in `custardui.config.json`. Unknown IDs are warned about and ignored. |
| `tabs` | `Record<string, string>` | Override the initial selected tab per tab group. Group and tab IDs must exist in `custardui.config.json`. Users can still change the tab afterwards. |
| `placeholders` | `Record<string, string>` | Override the default value of named placeholders. |

## Site-Managed Components (`siteManaged`)

Marking a component with `siteManaged: true` in `custardui.config.json` **locks its state** so that it can only be set by the site (via adaptation presets or config defaults). Users cannot change it through any of the normal override channels:

| Channel | Effect |
| --- | --- |
| Settings modal | Hidden — the control is not shown to the user |
| Shareable URL | Excluded from URL encoding; incoming URL params are ignored |
| Browser localStorage | Stripped before saving; ignored when restoring |

This applies to **toggles** and **placeholders**. Tab groups are always interactive and cannot be site-managed.

### Site-Managed Placeholders

To lock a placeholder so only the site can set it, add `siteManaged: true` to the placeholder definition in `custardui.config.json`:

```json
{
  "name": "institutionName",
  "defaultValue": "Generic University",
  "siteManaged": true
}
```

The adaptation then overrides it via `preset.placeholders`:

```json
{
  "id": "nus",
  "preset": {
    "placeholders": { "institutionName": "NUS" }
  }
}
```

`\[[institutionName]]` renders `"NUS"` for NUS visitors and `"Generic University"` for others. The value is never shown in the settings modal, never persisted to localStorage, and never included in shared links.

#### Example placeholder

`\[[ institutionName ]]`:
* [[ institutionName ]]
* [link to NUS adaptation](./configuration.html?adapt=nus#example-placeholder),
* [link to clear adaptation](./configuration.html?adapt=clear#example-placeholder)

### Site-Managed Toggles

To lock a toggle so users cannot change its visibility, add `siteManaged: true` to the toggle definition in `custardui.config.json`. Use the `default` field to set the state enforced for all visitors, and override it per adaptation via `preset.toggles`.

**`custardui.config.json`:**

```json
{
  "config": {
    "toggles": [
      {
        "toggleId": "java",
        "label": "Java",
        "default": "show",
        "siteManaged": true
      },
      {
        "toggleId": "python",
        "label": "Python",
        "default": "hide",
        "siteManaged": true
      }
    ]
  }
}
```

An adaptation can override the toggle state via `preset.toggles`:

```json
{
  "id": "nus",
  "preset": {
    "toggles": {
      "java": "show",
      "python": "hide"
    }
  }
}
```

With this setup, the Java content is always shown and the Python content is always hidden for NUS visitors — even if a user had previously saved different preferences or arrives via a shared URL attempting to change it.

---

## State Layering Precedence

When determining the initial state for toggles, tabs, and placeholders, CustardUI applies layers in this order:

| Priority | Layer | Notes |
| --- | --- | --- |
| 1 (lowest) | Config file defaults | Defined in `custardui.config.json` |
| 2 | **Adaptation `preset`** | Overrides config defaults; user can still change |
| 3 | Persisted user state | User's previous choices from `localStorage` |
| 4 (highest) | URL delta (`?t-show=…`) | Sparse override from a shared link |

Toggles and placeholders marked `siteManaged: true` are **exempt from layers 3 and 4**. They are always initialized from their config default (layer 1) or adaptation preset (layer 2), and user overrides from localStorage or the URL are silently discarded.

---


## Example: Institution Adaptation of this Site

For example, we want this documentation site to be customized for NUS. 

**`docs/nus/index.md`**
```html
<head-bottom>
  <meta name="cv-adapt" content="nus">
</head-bottom>
```

**`docs/nus/nus.json`**
```json
{
  "id": "nus",
  "theme": {
    "cssVariables": { "--cv-primary": "#003d7c" }
  },
  "preset": {
    "toggles": { "linux": "show", "windows": "hide" },
    "placeholders": { "username": "NUS Student" }
  }
}
```

Students linked to `/nus/` get the NUS theme immediately; the theme persists as they navigate the rest of the site.

See the [live demo](/nus/) for an interactive example.


### Placeholder Adaptation Configurations

Adaptations override placeholder values via `preset.placeholders`. The preset is applied before the user's persisted state, so users can still change these values from the settings modal.

To prevent users from ever changing a placeholder — making it fully site-controlled — mark it with `siteManaged: true` in `custardui.config.json`. See [Site-Managed Components](#site-managed-components-sitemanaged) below.

### TabGroup Adaptation Configurations

Adaptations can set an initial tab selection via `preset.tabs`. The preset is applied before the user's persisted state, so users can still change the tab from the settings modal or a shared URL.

### Toggle Adaptation Configurations

Adaptations override toggle visibility via `preset.toggles`. The preset is applied before the user's persisted state, so users can still override toggle states from the settings modal or a shared URL.

To prevent users from ever changing a toggle's state — making it fully site-controlled — mark it with `siteManaged: true` in `custardui.config.json`. See [Site-Managed Components](#site-managed-components-sitemanaged) below.
