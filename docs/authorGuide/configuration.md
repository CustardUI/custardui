{% set title = "Configuration Reference" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>  
  title: "Author Guide - Configuration"
  layout: authorGuide.md
  pageNav: 3
  pageNavTitle: "Topics"
</frontmatter>

# {{ title }}

This page documents the configuration options available for CustardUI, that go into `custardui.config.json` or are passed as attributes to the script tag when installing CustardUI into a new site.

## Configuration File (`custardui.config.json`)

CustardUI is configured via a JSON file, typically named `custardui.config.json`. This file defines toggles, tabs, placeholders, labels, and widget settings.

### Basic Structure

```json
{
  "config": {
    "toggles": [...],
    "tabGroups": [...],
    "placeholders": [...],
    "labels": [...]
  },
  ...
}
```

## Summary of Configuration Options

Refer to individual components for more details on each configuration option.


### Core Configuration (`config`)

| Field        | Type       | Required | Description                                                         |
| ------------ | ---------- | -------- | ------------------------------------------------------------------- |
| toggles      | `object[]` | No       | Array of toggle configurations. Each object must have a `toggleId`. Supports `isLocal` and `siteManaged`. |
| tabGroups    | `object[]` | No       | Array of tab group configurations. Supports `isLocal`.              |
| placeholders | `object[]` | No       | Array of global placeholder definitions. Supports `isLocal` and `siteManaged`. |
| labels       | `object[]` | No       | Array of label definitions. Labels are always site-controlled (no user input, no persistence). |

- Tab Group Configuration Settings, see [here](./components/tabs.md#configuration)
- Toggle Configuration Settings (including `siteManaged`), see [here](./components/toggles.md#configuration)
- Placeholder Configuration Settings (including `siteManaged`), see [here](./components/placeholders.md#placeholder-configuration)
- Label Configuration Settings, see [here](./components/labels.md#label-configuration)


### Settings Configuration in `config.json`: (`settings`)

```json
{
  "config": {...},
  ...
  "settings": {
    "enabled": true,
    "panel": {
      "title": "Customize View",
      "description": ""
    },
    "callout": {
      "show": false,
      "message": "Customize your reading experience here."
    },
    "icon": {
      "position": "middle-left",
      "color": "#814C20",
      "backgroundColor": "#F2CA55",
      "opacity": 0.95,
      "scale": 1.1
    }
  }
}
```

| Field                   | Type      | Default                                     | Description                                                                                                         |
| ----------------------- | --------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| enabled                 | `boolean` | `true`                                      | Whether to show the floating settings widget on the page.                                                           |
| panel.title             | `string`  | `"Customize View"`                          | Title shown in settings tooltip and modal header.                                                                   |
| panel.description       | `string`  | `""`                                        | Description text displayed in the settings modal.                                                                   |
| panel.showTabGroups     | `boolean` | `true`                                      | Whether to show tab groups section in widget.                                                                       |
| panel.showReset         | `boolean` | `true`                                      | Whether to show the reset to default button.                                                                        |
| panel.theme             | `string`  | `"light"`                                   | Widget theme: `"light"` or `"dark"`.                                                                                |
| callout.show            | `boolean` | `false`                                     | Whether to show the callout.                                                                                        |
| callout.message         | `string`  | `"Customize your reading experience here."` | Message to display in the callout.                                                                                  |
| callout.enablePulse     | `boolean` | `true`                                      | Whether to enable pulse animation for the callout.                                                                  |
| callout.backgroundColor | `string`  | `null`                                      | Custom background color for the callout.                                                                            |
| callout.textColor       | `string`  | `null`                                      | Custom text color for the callout.                                                                                  |
| icon.position           | `string`  | `"middle-left"`                             | Widget position: `"top-right"`, `"top-left"`, `"bottom-right"`, `"bottom-left"`, `"middle-left"`, `"middle-right"`. |
| icon.color              | `string`  | `null`                                      | Custom icon color.                                                                                                  |
| icon.backgroundColor    | `string`  | `null`                                      | Custom background color for the icon.                                                                               |
| icon.opacity            | `number`  | `null`                                      | Custom opacity (0-1).                                                                                               |
| icon.scale              | `number`  | `1`                                         | Custom scale factor.                                                                                                |



### Global Options in `custardui.config.json`

| Field          | Type                           | Default   | Description                             |
| -------------- | ------------------------------ | --------- | --------------------------------------- |
| storageKey     | `string`                       | `null`    | Optional key to isolate localStorage settings across different sites. Used as a prefix (e.g., `my-unique-siteName`). |
| colorScheme    | `"light" \| "dark" \| "auto"`  | `"light"` | Controls which color variant is used: `"light"`, `"dark"`, or `"auto"`. This is intended to match the site's light/dark mode, so a light mode website uses the light variant, and a dark mode website uses the dark variant. Auto switches based on the visitor's OS preference (`prefers-color-scheme`), reactively. If any other value is provided, CustardUI falls back to the `"light"` scheme (the default). |

**Example**: 
```json
{
  "storageKey": "my-unique-siteName",
  "colorScheme": "light",
  "config": {...},
  "settings": {...}
}
```

## Script Tag Attributes

When using auto-initialization via script tag, you can override configuration:

```html
<script
  src="https://cdn.jsdelivr.net/npm/@custardui/custardui"
  data-base-url="/"
  data-config-path="/custardui.config.json"
  defer
></script>
```

| Attribute          | Default                    | Description                                                                                                          |
| ------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `data-base-url`    | `/`                        | Specifies the website's base URL (for example `/docs`). Used to resolve relative paths in features such as adaptation. |
| `data-config-path` | `/custardui.config.json`   | Path to the config file for auto-initialization. Provide an absolute or site-relative path if your config is elsewhere. |
