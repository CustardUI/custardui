<frontmatter>
  title: CustardUI - Toggle Component
  layout: authorGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Toggles

`<cv-toggle>`

Toggles let you show or hide sections of a page based on a category (for example: `mac`, `linux`, `windows`). They are ideal for platform-specific content, progressive disclosure, or audience-targeted sections.

<cv-toggle-control toggle-id="mac"></cv-toggle-control> 
<cv-toggle-control toggle-id="windows"></cv-toggle-control> 

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-toggle toggle-id="mac">

**macOS**: macOS-specific install steps...
* Macbook Pro
* Macbook Neo
</cv-toggle>

<cv-toggle toggle-id="windows">

**Windows**: Windows-specific install steps...
* Windows Vista
* Windows XP
* Windows 11
</cv-toggle>

</variable>
</include>

When the active toggle state includes `mac`, only the `<cv-toggle toggle-id="mac">` element will be visible. The component reactively updates based on the global toggle state.


### Toggle Peek Mode

You can set a toggle to "peek" mode, where it shows a preview of the content.
Use `show-peek-border` to add a border to the peek view to make it stand out.
Additionally, use `show-label` to add a label to the toggle, so users know what it is.
* **Short toggle content:** If the content height is less than the peek height (70px), the full content is shown without the "expand" button or fade effect.

<cv-toggle-control toggle-id="localToggle"></cv-toggle-control> 
<br>

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<cv-toggle toggle-id="localToggle" show-peek-border show-label><br>

**Local toggle content**:
* Item 1
* Item 2
* Item 3
</cv-toggle>

</variable>
</include>


### Multi-ID Toggles

You can apply multiple toggles to a single element by separating categories with spaces. This allows content to appear as long as one toggle category is active.
* **Precedence Behaviour**: When multiple IDs are used, it uses the most visible state out of all the IDs.

```html
<cv-toggle toggle-id="mac linux">
  This section appears for both macOS and Linux users.
</cv-toggle>
```


### Attributes of `<cv-toggle>`

| Name     | Type      | Default      | Description                    |
| -------- | --------- | ------------ | ------------------------------ |
| toggle-id        | `string`  | **required** | Defines the category for the cv-toggle element. E.g.: `toggle-id="mac"`. |
| show-peek-border | `boolean` | `false`      | If present, adds a subtle border to the top and sides of the toggle content. The border is only applied while the toggle is in Peek mode (whether collapsed or user‑expanded). When the toggle is fully shown (non‑Peek), no border is rendered even if this attribute is set. |
| show-label       | `boolean` | `false`      | If present, displays the category label (e.g. "MacOS") at the top-left corner of the toggle. |

## Toggle Control

`<cv-toggle-control>`

You can place a **toggle control** directly on the page so readers can switch a toggle's visibility state (Hide · Peek · Show) without opening the Settings modal. By default it renders as a card, matching the look of the settings panel, with the toggle's label shown on the left and the segmented control on the right.

* You can place the control anywhere, above the toggle, in a sidebar, or grouped together for multiple toggles.
* To hide the label and render only the segmented control inline, add the `no-label` attribute.
* Note: `cv-toggle-control` renders nothing for `siteManaged` toggles, since those states are controlled by the site rather than the reader.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<cv-toggle-control toggle-id="localToggle"></cv-toggle-control> <br>

Control the toggles for the id `localToggle` here: <cv-toggle-control toggle-id="localToggle" no-label></cv-toggle-control>

<cv-toggle toggle-id="localToggle"> 

**Local Toggle**: Local toggle content
* Item 1
* Item 2
* Item 3
</cv-toggle>

</variable>
</include>


### Attributes of `<cv-toggle-control>`

| Name       | Type      | Default      | Description      |
| ---------- | --------- | ------------ | ---------------- |
| toggle-id  | `string`  | **required** | The toggle ID to control. Must match a configured toggle. Only a single ID is supported (unlike `<cv-toggle>` which accepts space-separated IDs). |
| no-label   | `boolean` | `false`      | If present, hides the label and card styling, rendering only the segmented control inline. |


## Configuration

To make toggles discoverable by the settings, you must define them in your `custardui.config.json`.

```json
{
  "config": {
    "toggles": [
      {
        "toggleId": "mac",
        "label": "MacOS",
        "description": "Show content for macOS users",
        "default": "show"
      },
      {
        "toggleId": "linux",
        "label": "Linux",
        "description": "Show content for Linux users",
        "default": "peek"
      },
      { "toggleId": "windows", "label": "Windows", "default": "hide" },
      {
        "toggleId": "localToggle",
        "label": "Local Toggle",
        "description": "Show content for local users",
        "isLocal": true
      }
    ]
  }
}
```

### Configuration Fields in `custardui.config.json`

| Name          | Type      | Default      | Description                                                                           |
| ------------- | --------- | ------------ | ------------------------------------------------------------------------------------- |
| toggleId      | `string`  | **required** | Defines the category for the cv-toggle element. Example: `toggleId="mac"`.            |
| label         | `string`  | -            | Label for the toggle in the settings.                                                 |
| description   | `string`  | -            | Description for the toggle in the settings.                                           |
| default       | `string`  | `show`       | Default state: `"show"`, `"hide"`, or `"peek"`.                                       |
| isLocal       | `boolean` | `false`      | Whether the toggle is local (only appears in the settings on pages where it is used). |
| siteManaged   | `boolean` | `false`      | If `true`, the toggle is fully controlled by the site. It is hidden from the settings modal, excluded from shareable URLs, and immune to user overrides via localStorage or URL params. Its state can only be set by the config `default` or an adaptation `preset.toggles`. |

### Visibility Resolution Order

Visibility is resolved by layering state in this order:

1.  **URL State (Sparse Overrides)**: If a toggle is explicitly mentioned in the URL (e.g., `?t-show=A`), it wins.
2.  **Persisted State**: If not in the URL, the state stored in the browser's local storage is used.
3.  **Default Configuration**: If neither of the above are present, the `default` value from `custardui.config.json` is used.

This means you can share a link that overrides specific toggles (like hiding a normally-visible section) without completely resetting the recipient's other local preferences.

## Global vs. Local Toggles

By default, all toggles defined in your configuration are **global**—they will appear in the settings on every page of your site.

You can mark a toggle as **local** to make it appear in the settings _only_ on pages where that specific toggle is actually used. This is useful for keeping the settings clean and only showing relevant options to the user.

To mark a toggle as local, add `"isLocal": true` to its configuration.

**Example:**

If you have a `mac` toggle that is only used on a few pages, setting it as local ensures the "MacOS" option only appears in the settings on those pages.

```json
{
  "config": {
    "toggles": [
      { "toggleId": "localToggle", "label": "Local Toggle", "isLocal": true },
      { "toggleId": "mac", "label": "MacOS", "isLocal": false },
      { "toggleId": "linux", "label": "Linux" },
      { "toggleId": "windows", "label": "Windows" }
    ]
  }
}
```

And present on this page:

```html
<cv-toggle toggle-id="localToggle"> Local Toggle content </cv-toggle>
```

<cv-toggle toggle-id="localToggle">

Local Toggle content

Some long long text content to make sure the box is scrollable
* item 1
* item 2
* item 3
* item 4
</cv-toggle>

### Keeping Local Toggles in Settings

If you have a specific use case where you may want all local toggles to be available in the settings on a certain page, (e.g. a global settings page), you can add hidden `cv-toggle` elements to register the local toggles on that page. That way, the plugin will pick them up and add them to the settings dialog for that page without introducing extra spacing in your layout.
* E.g. `<cv-toggle toggle-id="localToggle" hidden></cv-toggle>`

## Site-Managed Toggles

If an adaptation needs to **lock** a toggle — preventing users from changing it via the settings modal, a shared URL, or their saved preferences — mark it with `siteManaged: true`:

```json
{
  "config": {
    "toggles": [
      { "toggleId": "java",   "label": "Java",   "default": "show", "siteManaged": true },
      { "toggleId": "python", "label": "Python",  "default": "hide", "siteManaged": true }
    ]
  }
}
```

The adaptation can then override the default state via `preset.toggles`:

```json
{
  "id": "nus",
  "preset": {
    "toggles": { "java": "show", "python": "hide" }
  }
}
```

A site-managed toggle:
- **Does not appear** in the settings modal.
- **Is not included** in generated shareable URLs.
- **Ignores** any visibility state stored in localStorage or supplied via URL parameters.

See [Site-Managed Components](../adaptations/configuration.md#site-managed-components-sitemanaged) in the Adaptation Configurations guide for the full picture.


## Shareable URL

Toggle visibility states can be encoded directly in a URL so that a recipient sees the exact combination of shown, peeked, and hidden content that you intend.

| Parameter | Effect | Format |
|-----------|--------|--------|
| `t-show`  | Show these toggles | `?t-show=mac,linux` |
| `t-peek`  | Peek these toggles | `?t-peek=advanced` |
| `t-hide`  | Hide these toggles | `?t-hide=windows` |

Each toggle ID is encoded with `encodeURIComponent` and joined with commas, so IDs containing special characters are handled safely. Only the toggle IDs explicitly listed in the URL are affected — all others fall back to the visitor's saved preferences or the configured defaults.

**Example:**

```
https://yoursite.com/install.html?t-show=mac,linux&t-hide=windows
```

**Constructing the URL in JavaScript:**

```js
const show  = ['mac', 'linux'];
const hide  = ['windows'];
const url   = `https://yoursite.com/install.html`
            + `?t-show=${show.map(encodeURIComponent).join(',')}`
            + `&t-hide=${hide.map(encodeURIComponent).join(',')}`;
```

# Troubleshooting
* **Toggles not appearing in settings?** Check that your `config.toggles` array is correctly formatted with `toggleId` and `label` for each toggle.
* **No effect when toggling?** Ensure the element uses `<cv-toggle toggle-id="...">` and the category matches a configured toggle ID.
* **Settings icon not loading?** Verify the script is included and custardui.config.json is accessible.
