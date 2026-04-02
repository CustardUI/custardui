<frontmatter>
  title: CustardUI - Placeholders
  layout: authorGuide.md
  pageNav: 3
  pageNavTitle: "Topics"
</frontmatter>

<!-- For this page, ignore escaped placeholders, this is because we are serving this site, take \[[ XXX ]] as it will appear as [[ ]] in the docs -->
<!-- So the placeholders are not replaced by the plugin, we need to escape them to show them like this -->

## Placeholders

`\[[ variable_name ]]`, `<cv-placeholder/>`

Placeholders let readers personalise your site to their own context. Define them once in your [configuration](#configuration) — readers fill them in via the settings panel or a [`<cv-placeholder-input>`](#placeholder-input), and every instance across the site updates immediately. Values persist across page reloads and navigation.

<cv-placeholder-input name="username" layout="card"></cv-placeholder-input>


<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">md</variable>
<variable name="code">

Hello, \[[username]]!

<img src="https://github.com/\[[username : custardui ]].png" class="cv-bind"/>


</variable>
<variable name="output">

Hello, [[username]]!
<img src="https://github.com/[[username : custardui ]].png" 
  style="height: 2.5rem; vertical-align: middle; border-radius: 50%; margin-left: 0.5rem;" 
  class="cv-bind" 
  alt="Avatar" 
/>

</variable>
</include>

---

<br>

### Basic Syntax

Wrap a placeholder name in double square brackets to insert its current value:
 
```markdown
Hello, \[[username]]!
Fork your repo at github.com/\[[username]]/ip
```
 
The plugin scans the page on load and replaces all tokens with the current value. When the reader updates the value, all instances on the page update immediately with no reload needed.

<box type="tip">
 
**Manual component usage:** `<cv-placeholder name="username" fallback="johnDoe"></cv-placeholder>` is functionally equivalent to `\[[username : johnDoe]]`. Useful for debugging, or where the shorthand syntax cannot express what you need.
 
</box>

---

### Inline Fallback Value

Provide a fallback value directly in the syntax without needing a config entry or for defining a specific fallback for an instance: 

<cv-placeholder-input name="repo" layout="card"></cv-placeholder-input>

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">md</variable>
<variable name="code">

Clone your repo: `git clone https://github.com/cs2103t/\[[repo : custom-fallback]]-ip.git`

%%Or rely on the default value in your configuration (your-repo-name)%%

Clone your repo: `git clone https://github.com/cs2103t/\[[repo]]-ip.git`

</variable>
<variable name="output">

Clone your repo: `git clone https://github.com/cs2103t/[[repo : custom-fallback]]-ip.git`

%%Or rely on the default value in your configuration (your-repo-name)%%

Clone your repo: `git clone https://github.com/cs2103t/[[repo]]-ip.git`
</variable>
</include>

When a placeholder is used, CustardUI resolves its value in this order, stopping at the first match:

| Priority | Source | Example |
| :--- | :--- | :--- |
| 1 | **User-set value** | Typed into the settings panel or a `<cv-placeholder-input>` |
| 2 | **Inline fallback** | The value after `:` in the syntax  |
| 3 | **Registry `defaultValue`** | The `defaultValue` field in `custardui.config.json` |
| 4 | **Raw placeholder name** | Displayed as-is if no fallback exists |

<box type="info">

User-set empty strings (`""`) are treated as "not set" and fall through to the next fallback. To explicitly display nothing, use `\[[repo : ]]`.

</box>

<box type="warning">

**Avoid email addresses as inline fallbacks.** Your static site generator (e.g. MarkBind) may auto-link bare email addresses (e.g. `support@example.com` → `<a href="mailto:...">`), which splits the token across DOM nodes and causes the scanner to miss it. Instead, try to keep `@` outside the token: `\[[user]]@example.com`

</box>


### Conditional Syntax 

Render content only when a placeholder has a value:

<cv-placeholder-input name="username" layout="card"></cv-placeholder-input>

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">md</variable>
<variable name="code">

\[[username ? if-set, $ : if-unset]]

</variable>
<variable name="output">

[[username ? if-set, $ : if-unset]]

</variable>
</include>

When `username` is unset, 'if-unset' is shown. When `username` is `alice`, 'if-set' is shown with the username value.

| Part | Description |
| :--- | :--- |
| `if-set` | Rendered when the placeholder is set. Use `$` as the insertion point for the resolved value. |
| `if-unset` | Rendered when the placeholder is not set. Usually left empty. |


#### Conditional Syntax and `defaultValue`

By default, the conditional only triggers when the reader has **explicitly entered a value**. A `defaultValue` in config does not count as "set". Append `*` to also trigger on registry defaults:

| Syntax | Triggers truthy when… |
| :--- | :--- |
| `\[[name ? if-set : if-unset]]` | Reader has explicitly entered a value |
| `\[[name* ? if-set : if-unset]]` | Any resolved value exists (user-set **or** `defaultValue`) |


With `defaultValue: "Guest"` and no user input:

| Expression | Result |
| :--- | :--- |
| `\[[username ? Hi, $! : ]]` | *(empty)* |
| `\[[username* ? Hi, $! : ]]` | `Hi, Guest!` |

<box type="warning">

**The `:` character cannot appear inside `then` (text content in placeholders).** The parser splits on the first `:` after `?`, so URLs containing `://` or ports like `localhost:8080` will be misread as the separator.

**Workarounds:** Hardcode the URL prefix outside the token and use `$` for the variable part only, or store the full URL as the placeholder value and reference it with `\[[name]]`, or use the manual component with `if-set`/`if-unset` attributes: `<cv-placeholder name="..." if-set="https://example.com/$" if-unset="fallback">`.

</box>


### HTML Attribute Binding


Interpolate placeholder values into HTML attributes such as `href` or `src` by adding `class="cv-bind"` to the element. This works for dynamic links, image sources, and any other attribute value. This also works with conditional syntax to build attribute values that depend on whether a placeholder is set.


<cv-placeholder-input name="username" layout="card"></cv-placeholder-input>

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<!-- Dynamic link -->
<a href="https://github.com/\[[username : custardui]]" class="cv-bind" target="_blank">
  View \[[username : CustardUI]]'s profile on GitHub
</a>

<!-- Dynamic image source -->
<img src="https://github.com/\[[username : custardui]].png" 
  style="height: 2.5rem; vertical-align: middle; border-radius: 50%; margin-left: 0.5rem;" 
  class="cv-bind" 
  alt="Avatar" 
/>

</variable>
<variable name="output">

<a href="https://github.com/[[username : custardui]]" class="cv-bind" target="_blank">
  View [[username : CustardUI]]'s profile on GitHub
</a>
<img src="https://github.com/[[username : custardui ]].png" 
  style="height: 2.5rem; vertical-align: middle; border-radius: 50%; margin-left: 0.5rem;" 
  class="cv-bind" 
  alt="Avatar" 
/>

</variable>
</include>


<box type="info">

**Requirements and notes:**
- Use standard HTML syntax — Markdown link syntax (`[text](url)`) is not supported.
- Add `class="cv-bind"` (or `data-cv-bind`) to signal the plugin to scan the element's attributes.
- The `class` attribute itself is excluded from binding to avoid conflicts with JavaScript and CSS frameworks.
- Placeholders in `href` and `src` are URL-encoded automatically (e.g. `/` → `%2F`). Full URLs, relative paths, and special protocols such as `mailto:` are not encoded.

</box>


<box type="warning">

**Security and Responsible Use**

Placeholders can be populated directly from [shareable URL parameters](#shareable-url). They must be treated as **untrusted user input**. 

- **Cross-Site Scripting (XSS):** While CustardUI automatically URL-encodes placeholder values when they are used as components of an `href` or `src` attribute (e.g. `[[username]]`), it **does not** prevent full `javascript:` URLs if the placeholder itself is a full URL.
- **Avoid Dangerous Attributes:** Never bind placeholders to event handler attributes (e.g., `onclick`, `onerror`, `onmouseover`) or `<script>` tags, as they are not sanitized and could execute arbitrary code if a malicious shareable URL is clicked.
- **Context Awareness:** Only bind placeholders to attributes where the resulting value is constrained to a safe domain or format that you control.

</box>

---
<br>

### Placeholder-Driven Toggles
 
Show or hide content based on whether a placeholder has been set, using `placeholder-id` on `<cv-toggle>`:
 
```html
<!-- Hidden until reader sets a username -->
<cv-toggle placeholder-id="username">
  Welcome, [[username]]! Here are your personalised instructions.
</cv-toggle>
 
<!-- Visible if user has set a value OR a defaultValue exists -->
<cv-toggle placeholder-id="username*">
  Welcome, [[username]]!
</cv-toggle>
```
 
| Attribute | Behaviour |
| :--- | :--- |
| `placeholder-id="name"` | Visible only when reader has explicitly entered a value |
| `placeholder-id="name*"` | Visible when reader has set a value **or** a `defaultValue` exists |
 
<box type="warning">
 
Placeholder-driven toggles have no peek, label, or border behaviour. Do not use `placeholder-id` and `toggle-id` on the same element — `placeholder-id` takes precedence.
 
</box>


---
<br>

### Attributes of `<cv-placeholder>`

`<cv-placeholder>` is the underlying custom element created by the `[[ ]]` syntax. You rarely need to use it directly, but it is useful when the shorthand syntax cannot express what you need. For example, when your fallback or truthy template contains a `:` (e.g. a full URL with `://`), since the parser uses `:` as a structural separator and would misread it.

```html
<!-- Fallback containing a URL — shorthand [[ ]] cannot do this -->
<cv-placeholder name="docsUrl" fallback="https://example.com/docs"></cv-placeholder>

<!-- Conditional with a URL in the if-set template -->
<cv-placeholder name="username" if-set="https://github.com/$" if-unset="(not set)"></cv-placeholder>

<!-- Same as \[[username* ? Hi, $! : ]], where it triggers on defaultValue as well -->
<cv-placeholder name="username" if-set="Hi, $!" if-unset="" include-default></cv-placeholder>
```

> **Cannot be used in HTML attribute binding.** `<cv-placeholder>` is a DOM element and cannot be embedded inside an attribute value. For dynamic `href`, `src`, or other attributes, use the `[[ ]]` shorthand with `class="cv-bind"` instead.

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **required** | The placeholder name to resolve. |
| `fallback` | `string` | — | Inline fallback shown when no user value is set. Equivalent to the `: fallback` part of `\[[name : fallback]]`. |
| `if-set` | `string` | — | Template rendered when the placeholder is set. Use `$` as the insertion point for the resolved value. |
| `if-unset` | `string` | — | Template rendered when the placeholder is not set. |
| `include-default` | `boolean` | `false` | When present, the conditional also fires on a registry `defaultValue` (not just user-set values). Equivalent to appending `*` in `\[[name* ? if-set : if-unset]]`. |

---

### Escaping Syntax

You can "escape" the placeholder syntax if you want to display the literal brackets instead of a variable. If you are using a static site generator, you may need to escape the backslashes.

- **In Markdown Text**: Use two backslashes: `\\\[[ variable ]]`.
- **In Code Blocks**: Use one backslash: `\\[[ variable ]]`.


---
<br>


## Placeholder Input 

`<cv-placeholder-input/>`

Place an editable input field directly on the page, allowing readers to set a placeholder value inline without opening the settings panel. The value updates all instances of the placeholder immediately.

For example, update your username here: <cv-placeholder-input name="username" hint="Your Name"></cv-placeholder-input>. Notice that the placeholder, "\\[[username]]", updates as you type, as so: <u>[[username : ]]</u>.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<!-- Inline layout -->
%%Use the inline layout to edit placeholders directly in the text flow:%%

My username is 'outline': <cv-placeholder-input name="username" appearance="outline"></cv-placeholder-input>, 
'underline': <cv-placeholder-input name="username" appearance="underline"></cv-placeholder-input>, 
and 'ghost': <cv-placeholder-input name="username" appearance="ghost" width="auto-grow"></cv-placeholder-input>.

---

<!-- Stacked layout -->
%%Alternatively, use the stacked layout:%%
<cv-placeholder-input name="username" layout="stacked"></cv-placeholder-input>

---
 
<!-- Horizontal layout -->
%%Or the horizontal layout:%%
<cv-placeholder-input name="username" layout="horizontal" label="Username:"></cv-placeholder-input>

---

<!-- Card layout -->
%%Or the card layout, which is great for settings pages:%%
<cv-placeholder-input name="username" layout="card"></cv-placeholder-input>

</variable>
</include>



### Attributes of `<cv-placeholder-input>`

Several attributes control the appearance and behavior of the component.

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| name | `string` | **required** | The placeholder name to bind to. |
| layout | `string` | `inline` | • `inline` — sits in text flow, label hidden<br>• `stacked` — label above, full-width input<br>• `horizontal` — label left, input fills remaining space<br>• `card` — styled card matching toggle controls, label left, input right |
| appearance | `string` | `outline` | • `outline` — standard bordered input<br>• `underline` — bottom border only, great for inline text<br>• `ghost` — no border until focused, blends into content |
| label | `string` | from config | Visual label (for `stacked`, `horizontal`, `card`) or `aria-label` (for `inline`). |
| hint | `string` | from config | Placeholder text shown inside the input when empty. |
| width | `string` | auto | CSS width of the input. Use `auto-grow` to resize based on content length (`inline` only). |



## Configuration

Placeholders are defined in your `custardui.config.json` under the `placeholders` key:

```json
{
  "config": {
    "placeholders": [
      {
        "name": "username",
        "defaultValue": "JohnDoe",
        "settingsLabel": "Your GitHub Username",
        "settingsHint": "Enter your GitHub username",
        "description": "Used to personalise links and commands throughout the site.",
        "isLocal": false
      },
      {
        "name": "repo",
        "settingsLabel": "Repo Name",
        "description": "Enter your GitHub repo name here",
        "settingsHint": "Enter here",
        "isLocal": true,
        "defaultValue": "your-repository-name"
      }
    ]
  }
}
```

### Configuration Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | **Required.** Unique identifier used in `\[[name]]` syntax. |
| `settingsLabel` | `string` | Display label shown in the settings panel and `card` layout. |
| `settingsHint` | `string` | Helper text shown inside the input field. |
| `description` | `string` | Optional description shown below the label in settings and `card` layout. |
| `defaultValue` | `string` | Fallback value when no user value or inline fallback exists. Does **not** count as "user-set" for conditional syntax unless `*` is appended. |
| `isLocal` | `boolean` | If `true`, the input only appears in settings when the placeholder is used on the current page. Default is `false`. |
| `siteManaged` | `boolean` | If `true`, the placeholder is fully controlled by the site — hidden from settings, excluded from shareable URLs, immune to user input. Set via `defaultValue` or adaptation presets only. Useful for institution names or logos. |

---

<br>

### Global vs. Local Placeholders

By default, all placeholders defined in your configuration are **global**, and their input fields appear in the settings panel on every page of your site.

You can mark a placeholder as **local** to make it appear in the settings _only_ on pages where that placeholder is actually used. This is useful for keeping the settings panel clean and focused on what's relevant to the current page.

To mark a placeholder as local, add `"isLocal": true` to its configuration:
```json
{
  "config": {
    "placeholders": [
      { "name": "username", "settingsLabel": "Your Username", "isLocal": false },
      { "name": "repo", "settingsLabel": "Repository Name", "isLocal": true }
    ]
  }
}
```

In this example, `repo` only appears in the settings panel on pages that contain `[[repo]]` or a `<cv-placeholder-input name="repo">`. On all other pages, only `username` is shown.

---
<br>

### Site-Managed Placeholders

If a placeholder needs to be **locked** — preventing readers from changing it via the settings panel, a shared URL, or their saved preferences — mark it with `siteManaged: true`:
```json
{
  "config": {
    "placeholders": [
      { "name": "institution", "defaultValue": "NUS", "siteManaged": true },
      { "name": "course", "defaultValue": "CS2103T", "siteManaged": true }
    ]
  }
}
```

An adaptation can then override the value via `preset.placeholders`:
```json
{
  "id": "sutd",
  "preset": {
    "placeholders": { "institution": "SUTD", "course": "50.001" }
  }
}
```

A site-managed placeholder:
- **Does not appear** in the settings panel.
- **Is not included** in generated shareable URLs.
- **Ignores** any value stored in localStorage or supplied via URL parameters.

See [Site-Managed Components](../adaptations/configuration.md#site-managed-components-sitemanaged) in the Adaptations guide for the full picture.


---
<br>

### Tab Group Binding

Bind a tab group to a placeholder so that switching tabs automatically updates the variable:

```json
"tabGroups": [
  {
    "groupId": "fruit",
    "label": "Fruit Selection",
    "description": "Select your favorite fruit.",
    "isLocal": false,
    "default": "pear",
    "placeholderId": "fruit",
    "tabs": [
      {"tabId": "apple","label": "Apple", "placeholderValue": "apple"},
      {"tabId": "orange","label": "Orange", "placeholderValue": "orange"},
      {"tabId": "pear","label": "Pear", "placeholderValue": "pear"}
    ]
  }
]
```

<box>


<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

Double click a tab below to update the variable.

<cv-tabgroup group-id="fruit">
    <cv-tab tab-id="apple"> I love apples. </cv-tab>
    <cv-tab tab-id="orange"> I love oranges. </cv-tab>
    <cv-tab tab-id="pear"> I love pears. </cv-tab>
</cv-tabgroup>

\[[fruit]]

My favourite fruit is `\[[fruit]]`, and it updates automatically!

</variable>
<variable name="output">

Double click a tab below to update the variable.

<cv-tabgroup group-id="fruit">
    <cv-tab tab-id="apple"> I love apples. </cv-tab>
    <cv-tab tab-id="orange"> I love oranges. </cv-tab>
    <cv-tab tab-id="pear"> I love pears. </cv-tab>
</cv-tabgroup>

[[fruit]]

My favourite fruit is `[[fruit]]`, and it updates automatically!

</variable>
</include>

</box>

---
 
### Shareable URLs

Values are saved in the browser's `localStorage` and persist across page reloads and navigation. They can also be shared via the `ph` URL parameter — a comma-separated list of `key:value` pairs, each component encoded with `encodeURIComponent`:
 
```
https://yoursite.com/page.html?ph=username:alice,repo:my-repo
```
 
| Parameter | Format | Example |
| :--- | :--- | :--- |
| `ph` | Comma-separated `key:value` pairs | `?ph=username:alice` |
 
<box type="info">
 
Placeholder values derived from a tab group (via `placeholderId`) should not be included in `?ph=` — they are implied by the `?tabs=` parameter and re-derived automatically on load.
 
</box>
 
**Constructing the URL in JavaScript:**
 
```js
const ph = { username: 'alice', repo: 'my-repo' };
const param = Object.entries(ph)
  .map(([k, v]) => `${encodeURIComponent(k)}:${encodeURIComponent(v)}`)
  .join(',');
const url = `https://yoursite.com/page.html?ph=${param}`;
```

<br>
