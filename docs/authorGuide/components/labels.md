<frontmatter>
  title: CustardUI - Labels
  layout: authorGuide.md
  pageNav: 3
  pageNavTitle: "Topics"
</frontmatter>

## Label Component

`<cv-label>` <cv-label> cv-label</cv-label>

Labels are small inline pill badges you can place anywhere in your content. They are meant to be used with adaptations, with no user interaction, no settings modal entry, no persistence. The color is derived from the config, and the displayed text is derived from either the config or the element's own inner content.

## Usage

### Add the (Optional) Label Configuration

Labels are defined in `custardui.config.json` under the `labels` key. It supports 3 fields: `name`, `value`, and `color`. Only `name` is required — `value` and `color` are both optional.

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

### Place Labels in Content

Use `<cv-label name="...">` anywhere in your page. The text inside the element acts as the default value and the fallback. You can also set a `color` directly on the element as a default. 
* If the label has a corresponding entry with the same `name` in the config, the `value` and `color` in the config will override the (text) `value` and `color` in the element.
* If the label has no entry in the config, it will use the inner text as the value and the color attribute as the color. If no color attribute is set, it will use default gray (`#6b7280`).
* If there is no text inside the element and no `value` is defined for that label in the config, it will render nothing.


<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
This step is <cv-label name="optional" color="#3b82f6">OPTIONAL</cv-label> for beginners.

Read the <cv-label name="key" color="#ef4444">★ KEY</cv-label> sections first.

Check the <cv-label name="warning" color="#f59e0b">⚠ WARNING</cv-label> boxes carefully.

This is an <cv-label name="advanced" color="#8b5cf6">ADVANCED</cv-label> topic.
</variable>
</include>

## Label Configuration

| Field   | Type     | Required | Description |
| :------ | :------- | :------- | :---------- |
| `name`  | `string` | **Yes**  | Unique identifier matching the `name` attribute on `<cv-label>`. |
| `value` | `string` | No       | Display text. If omitted, the element's inner content is used instead. Can include Unicode/emoji (e.g. `"★ KEY"`, `"⚠ WARNING"`). |
| `color` | `string` | No       | CSS background color. For best results, use a hex color (e.g. `#3b82f6`): only hex colors participate in automatic text contrast (black/white). For non-hex CSS colors (named colors, `rgb()`, etc.), the text color defaults to white and may not meet contrast guidelines. Takes priority over the `color` attribute on `<cv-label>`. Defaults to gray (`#6b7280`) if neither is set. |

<box type="info">

**Labels are always site-managed.** Unlike toggles and placeholders, there is no user interaction — users cannot change label values, and labels are never saved to localStorage or included in shareable URLs. All label control happens through `custardui.config.json` and adaptation `preset.labels` overrides.
</box>

## Shorthand Colors

The `color` field (both in config and on the element attribute) accepts single-letter shorthands as a convenience. Each shorthand has a light and dark variant — which one is used depends on the `colorScheme` setting in `custardui.config.json` (default: `"light"`).

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

Text color (black or white) is still auto-computed for contrast against the resolved background.

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

## Adaptation Overrides

Labels can be overridden per adaptation via `preset.labels`. This lets different adaptations show different labels — for example, marking a step as "COMPULSORY" in red for one audience while keeping it "OPTIONAL" in blue for others:

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

**Note:** Adaptation `preset.labels` can only override labels that are already defined in `custardui.config.json`. Unknown names produce a warning and are ignored.
</box>


### Live Demo

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

Labels are not user-settable and are never included in shareable URLs or `localStorage`.
