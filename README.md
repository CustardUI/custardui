# CustardUI

> Rich, layered interactivity for static websites with no backend required.

CustardUI (formerly CustomViews) is a lightweight, framework-agnostic runtime that adds dynamic, memory-persistent UI components to any static site. Built for educational websites, documentation portals, and course textbooks where one size never fits all.

## What it does

- **Toggles** — let readers show, hide, or peek sections based on their preferences
- **Synced Tabs** — tab selections persist across the entire site and across visits
- **Placeholders** — personalize text with reader-defined values like names or team IDs
- **Focus & Share** — highlight and link directly to any content block on the page
- **Adaptations** — serve entirely different audiences from a single deployment, swapping images, links, and text per organization


## Getting started

Add the script tag to your base layout:
```html
<script src="https://unpkg.com/@custardui/custard" data-base-url="/"></script>
```

Add a `custard.config.json` to your site root, then start using `<cv-toggle>`, `<cv-tabgroup>`, and `[[placeholders]]` in your pages.

Full documentation and author guide → **[custardui.github.io](https://custardui.github.io)**

[View on npm](https://www.npmjs.com/package/@custardui/custard)

## License

MIT
