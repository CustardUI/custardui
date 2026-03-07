{% set title = "Getting Started" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Author Guide - {{ title }}"
  layout: authorGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}

## What is CustardUI?

CustardUI is a lightweight JavaScript add-on that brings **dynamic personalization** to static websites — no backend required. Readers can customize what they see: toggling platform-specific instructions, selecting tabs, filling in their own values, and sharing focused views — all persisted automatically in their browser.

**Common use cases:**

- Platform-specific docs (macOS, Windows, Linux steps on the same page)
- Multi-language tutorials (Python, Java, JavaScript side by side)
- Personalized content using reader-supplied values (username, API key, etc.)
- Shareable focused views that highlight specific sections

---

## Prerequisites

- A basic understanding of [HTML](https://www.w3schools.com/html/) syntax
- A static site to add CustardUI to (plain HTML, Jekyll, Hugo, MarkBind, etc.)

---

## Quick Start

### 1. Add the Script Tag

Add the following to your HTML `<head>` or before the closing `</body>` tag:

```html
<script src="https://unpkg.com/@custardui/custardui" data-base-url="/"></script>
```

Set `data-base-url` to your site's base path. For example, if your site is hosted at `/docs`, use `data-base-url="/docs"`.

### 2. Create a Config File

Create a `custardui.config.json` file at your site root. This tells CustardUI what toggles and options to expose:

```json
{
  "config": {
    "toggles": [
      { "toggleId": "mac", "label": "macOS", "description": "Show macOS instructions" },
      { "toggleId": "win", "label": "Windows", "description": "Show Windows instructions" }
    ]
  },
  "settings": {
    "enabled": true
  }
}
```

### 3. Use Features and Components in Your Content

Try using CustardUI's features and components in your content.

Try typing `#cv-share` in your url bar to bring up the share toolbar, and try generating a shareable link of your page.

Additionally, try using `<cv-toggle>` elements around any content you want to conditionally show or hide:

```html
<cv-toggle toggle-id="mac">
  This content is only shown to macOS users.
</cv-toggle>

<cv-toggle toggle-id="win">
  This content is only shown to Windows users.
</cv-toggle>
```

That's it. Open your page and you'll see a settings icon on the left — click it to switch between views. Selections are saved automatically.

---

## What's Next?

Now that CustardUI is running, explore its features:

- **[Toggles](./components/toggles.html)** — Show or hide sections per audience
- **[Tabs](./components/tabs.html)** — Synchronized, persistent tab groups
- **[Placeholders](./components/placeholders.html)** — Reader-customizable variables in text and code
- **[Focused Views & Sharing](./components/share.html)** — Share specific content via URL
- **[Configuration Reference](./configuration.html)** — Full list of options

Using MarkBind? See the [MarkBind integration guide](./integrations/setupWithMarkbind.html) for a plugin-based setup.

---

<panel header=":fa-solid-lightbulb: Troubleshooting" expanded>

**Settings icon not appearing?**

- Make sure `"settings": { "enabled": true }` is present in your config file.
- Check your browser console for errors.
- Ensure `custardui.config.json` is accessible via the Network tab in DevTools.

</panel>

<br><br>
