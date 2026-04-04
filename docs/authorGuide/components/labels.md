<frontmatter>
  title: CustardUI - Labels
  layout: authorGuide.md
  pageNav: 3
  pageNavTitle: "Topics"
</frontmatter>

## Labels

`<cv-label>` <cv-label> cv-label</cv-label>

Labels are small inline pill badges you can place anywhere in your content. They are designed for use with adaptations, where different audiences can see different label text and colors for the same element, controlled entirely through config. Labels have no user interaction, no settings modal entry, and no persistence.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
This step is <cv-label name="optional" color="#3b82f6">OPTIONAL</cv-label> for beginners.
 
Read the <cv-label name="key" color="#ef4444">★ KEY</cv-label> sections first.
 
Check the <cv-label name="warning" color="#f59e0b">⚠ WARNING</cv-label> boxes carefully.
 
This is an <cv-label name="advanced" color="#8b5cf6">ADVANCED</cv-label> topic.
</variable>
</include>
 
### Basic Syntax
 
Place a `<cv-label>` anywhere in your content. The `name` attribute links it to a config entry. The inner text acts as the default display value and fallback:
 
```html
This step is <cv-label name="optional" color="#3b82f6">OPTIONAL</cv-label>.
```
 
Resolution order for display text and color:
 
| Priority | Source |
| :--- | :--- |
| 1 | `value` and `color` defined in `custardui.config.json` for this `name` |
| 2 | Inner text content and `color` attribute on the element |
| 3 | Default gray (`#6b7280`) if no color is set anywhere |
 
If there is no inner text and no `value` in config, the label renders nothing.
 
---


### Attributes of `<cv-label>`
 
| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **required** | Links this element to a config entry. Labels with the same `name` share the same config-defined value and color. |
| `color` | `string` | `#6b7280` | CSS background color for this label. Accepts hex colors or [shorthand letters](#shorthand-colors). Overridden by config if a matching entry exists. |
 
<box type="info">
 
**Labels are always site-managed.** Unlike toggles and placeholders, there is no user interaction. Label values are never saved to localStorage or included in shareable URLs. All label control happens through `custardui.config.json` and adaptation `preset.labels` overrides.
 
</box>
 
---
<br>
 
## Configuration
 
Labels are defined in `custardui.config.json` under the `labels` key:
 
```json
{
  "config": {
    "labels": [
      { "name": "exercise-1", "value": "OPTIONAL", "color": "#3b82f6" },
      { "name": "exercise-2", "value": "OPTIONAL", "color": "#3b82f6" },
      { "name": "exercise-3", "value": "OPTIONAL", "color": "#3b82f6" },
      { "name": "exercise-4", "value": "OPTIONAL", "color": "#3b82f6" }
    ]
  }
}
```
 
Configuration is optional — if a `<cv-label>` has no matching config entry, it falls back to its inner text and `color` attribute.
 

### Configuration Fields


| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Unique identifier matching the `name` attribute on `<cv-label>`. |
| `value` | `string` | No | Display text. If omitted, the element's inner content is used. Supports Unicode and emoji (e.g. `"★ KEY"`, `"⚠ WARNING"`). |
| `color` | `string` | No | CSS background color. Hex colors participate in automatic black/white text contrast. Non-hex colors (named colors, `rgb()`, etc.) default to white text. Takes priority over the `color` attribute on the element. Defaults to gray (`#6b7280`) if unset. |
 
### Shorthand Colors

The `color` field in config and on the element attribute accepts single-letter shorthands as a convenience. The resolved color depends on the `colorScheme` setting in `custardui.config.json` (default: `"light"`). 

| Shorthand | Light mode | Dark mode |
| :-------: | :--------- | :-------- |
| `r` | Pale red `#fca5a5` | Deep red `#dc2626` |
| `g` | Neon green `#4ade80` | Forest green `#16a34a` |
| `b` | Light blue `#93c5fd` | Royal blue `#2563eb` |
| `c` | Aqua cyan `#67e8f9` | Teal cyan `#0d9488` |
| `m` | Bright magenta `#f0abfc` | Deep magenta `#a21caf` |
| `y` | Bright yellow `#fde047` | Golden yellow `#92400e` |
| `w` | White `#f1f5f9` | Silver grey `#94a3b8` |
| `k` | Light grey `#e2e8f0` | Pure black `#0f172a` |

Text color (black or white) is auto-computed for contrast against the resolved background.

```html
<!-- Shorthand in the element attribute -->
<cv-label name="opt" color="b">OPTIONAL</cv-label>

<!-- Shorthand in config -->
{ "name": "optional", "color": "b" }
```

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-label name="sampleColor" color="r">r</cv-label>
<cv-label name="sampleColor" color="g">g</cv-label>
<cv-label name="sampleColor" color="b">b</cv-label>
<cv-label name="sampleColor" color="c">c</cv-label>
<cv-label name="sampleColor" color="m">m</cv-label>
<cv-label name="sampleColor" color="y">y</cv-label>
<cv-label name="sampleColor" color="w">w</cv-label>
<cv-label name="sampleColor" color="k">k</cv-label>
</variable>
</include>

---
<br>

### Adaptation Overrides

Labels can be overridden per adaptation via `preset.labels`. This lets different audiences see different label text and colors for the same element. For example, marking a step as "COMPULSORY" in red for one course while keeping it "OPTIONAL" in blue for others.

```json
{
  "id": "sample",
  "preset": {
    "labels": {
      "exercise-1": { "value": "COMPULSORY", "color": "#ef4444" },
      "exercise-2": { "value": "COMPULSORY", "color": "#ef4444" }
    }
  }
}
```
 
<box type="info">
 
`preset.labels` can only override labels already defined in `custardui.config.json`. Unknown names produce a warning and are ignored.
 
</box>


#### Live Demo

<span id="adaptation-override-demo"></span>

Switch adaptation: [Sample Adaptation](./labels.html?adapt=sample#adaptation-override-demo). Click here to [reset Adaptation](./labels.html?adapt=clear#adaptation-override-demo)

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
Exercise 1 is <cv-label name="exercise-1">OPTIONAL</cv-label>.

Exercise 2 is <cv-label name="exercise-2">OPTIONAL</cv-label>.

Exercise 3 is <cv-label name="exercise-3">OPTIONAL</cv-label>.

Exercise 4 is <cv-label name="exercise-4">OPTIONAL</cv-label>.
</variable>
</include>

By default all four render as blue **OPTIONAL** pills. After clicking **Sample**, the `preset.labels` in `sample.json` overrides them to red **COMPULSORY** pills. Click **Reset** to clear the adaptation and return to defaults.

