{% set title = "Adaptation Configurations" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Author Guide - Adaptation Configurations"
  layout: authorGuide.md
  pageNav: 2
  pageNavTitle: "Topics"
</frontmatter>

# {{ title }}

### Placeholder Adaptation Configurations

...

### TabGroup Adaptation Configurations 

...

### Toggle Adaptation Configurations

...


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
| `placeholders` | `Record<string, string>` | Override the default value of named placeholders. |

## Site-Managed Placeholders (`siteManaged`)

To define a placeholder that users cannot see or change — only adaptations and the config `defaultValue` can set its value — mark it with `siteManaged: true` in `custardui.config.json`:

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
    "placeholders": { "institutionName": "NU Instutition" }
  }
}
```

#### Example placeholder

`\[[institutionName]]` renders `"NUS"` for NUS visitors and `"Generic University"` for others. These values are never shown in the settings modal, never persisted to localStorage, and never included in shared links.

`\[[ institutionName ]]`:
* [[ institutionName ]]
* [link to NUS adaptation](./configuration.html?adapt=nus#example-placeholder), 
* [link to clear adaptation](./configuration.html?adapt=clear#example-placeholder)

---

## State Layering Precedence

When determining the initial toggle state, CustardUI applies layers in this order:

| Priority | Layer | Notes |
| --- | --- | --- |
| 1 (lowest) | Config file defaults | Defined in `custardui.config.json` |
| 2 | **Adaptation `preset`** | Override config defaults; user can still change |
| 3 | Persisted user state | User's previous choices from `localStorage` |
| 4 (highest) | URL delta (`?t-show=…`) | Sparse override from a shared link |

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
