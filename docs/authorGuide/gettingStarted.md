{% set title = "Getting Started" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Author Guide - {{ title }}"
  layout: authorGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}

++**Prerequisites**++

* a basic knowledge of [HTML](https://www.w3schools.com/html/) syntax
* (Optional) [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com/get-npm) if you plan to use the package manager


---

A lightweight add-on that brings dynamic personalization, focused sharing, and multi-tenancy to static websites.

Empowering static educational and documentation sites with dynamic reader customizations, focused sharing, and powerful multi-tenant adaptations.

Transforming text-heavy static sites into personalized, interactive experiences without the need for complex backend servers.

A framework-agnostic tool for static sites featuring user-driven content toggles, persistent tabs, and cross-institutional adaptations.


The main way to use CustardUI is by including it directly via a script tag.

## Method 1: CDN / Script Tag

<box type="info" seamless>

This method is the quickest way to get started and is ideal for static sites (Jekyll, Hugo, MarkBind, plain HTML). For more details, see the integrations section for each framework.

</box>

++**1. Add the Script Tag**++

Add the following script tag to the `<head>` or end of `<body>` in your HTML file:

```html
<!-- Load from unpkg -->
<script src="https://unpkg.com/@customviews-js/customviews" data-base-url="/"></script>

<!-- OR Load from jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@customviews-js/customviews" data-base-url="/"></script>
```

++**2. Create a Configuration File (Optional)**++

Create a `custardui.config.json` file in the same directory as your site root. This file defines the available toggles and default settings.

```json
{
  "config": {
    "toggles": [
      { "toggleId": "mac", "label": "macOS", "description": "Show content for macOS users" },
      { "toggleId": "win", "label": "Windows", "description": "Show content for Windows users" }
    ]
  },
  "settings": {
    "enabled": true,
    "panel": {
      "title": "Customize View"
    }
  }
}
```

++**3. Start Using Components**++

You can now use CustomViews attributes in your HTML:

```html
<cv-toggle toggle-id="mac">
  <p>This content is only for macOS users.</p>
</cv-toggle>

<cv-toggle toggle-id="win">
  <p>This content is only for Windows users.</p>
</cv-toggle>
```


<panel header=":fa-solid-lightbulb: Troubleshooting">

**Settings icon not appearing?**

- Check your browser console for errors.
- Ensure `custardui.config.json` is accessible (check the Network tab).
- If using a local file (file:// protocol), browser security policies might block loading the JSON config. strongly recommend using a local server (like `http-server` or VS Code's Live Server).

</panel>

<br>
<br>
