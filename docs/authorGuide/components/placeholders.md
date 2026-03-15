<frontmatter>
  title: CustardUI - Placeholders
  layout: authorGuide.md
  pageNav: 3
  pageNavTitle: "Topics"
</frontmatter>

<!-- For this page, ignore escaped placeholders, this is because we are serving this site -->
<!-- So the placeholders are not replaced by the plugin, we need to escape them to show them as is -->

## Simple Placeholders (Variable Interpolation)

`\[[ variable_name ]]`, `<cv-placeholder/>`, `<cv-placeholder-input/>`

Placeholders allow you to create dynamic "Mad Libs" style documentation. Authors can define variable placeholders that readers can customize via the Settings Widget. The values entered by the reader are persisted and automatically update text, code blocks, and other content across the site.

## Usage

### Add the Placeholder Configuration

Placeholders are defined in your `custardui.config.json` under the `placeholders` key.

```json
{
  "config": {
    "placeholders": [
      { "name": "username", "settingsLabel": "Your Username", "settingsHint": "Enter username" },
      { "name": "api_key", "settingsLabel": "API Key", "isLocal": true }
    ]
  }
}
```

### Use the placeholder

To use the variable in your content, wrap the variable name in double square brackets: `[[ variable_name ]]`.

For example, we write `Hello, \[[username]]` here:

```markdown
Hello, \[[username]]!
↓
Hello, [[username]]!
```

The system scans the page and replaces these tokens with the current value. When the user updates the value in the settings, all instances on the page update immediately.

**Manual Component Usage**: You could also use the internal custom element directly, although it is not necessary. `<cv-placeholder name="email" fallback="support@example.com"></cv-placeholder>` is functionally equivalent to `\[[ email : support@example.com ]]` but may be useful for debugging or etc. 

## Inline Fallback

You can provide a fallback value directly in the usage syntax. This is useful if you haven't defined a formal placeholder or want a specific default for one instance.

```markdown
Contact us at \[[ email : support@example.com ]]
↓
Contact us at [[email : support@example.com]]
```

If the user has not set a value for `email`, "support@example.com" will be displayed. The resolution order is:

1. **User-set value** — what the user typed into the Settings widget or a `<cv-placeholder-input>`.
2. **Inline fallback** — the value after `:` in the syntax (e.g., `support@example.com`).
3. **Registry `defaultValue`** — the `defaultValue` field in `custardui.config.json`.
4. **Raw placeholder name** — `\[[name]]` as literal text, signalling that no fallback was provided.

> User-set empty strings (`""`) are treated as "not set" and fall through to the inline fallback, instead of displaying nothing. Use `\[[email : ]]` to explicitly show nothing as the fallback.


## Conditional Syntax (Fall-Forward)

You can render content **only when** a placeholder has a value using the conditional syntax:

```
\[[name ? truthy-template : falsy]]
```

- **`truthy-template`** — rendered when the placeholder is set. Use `$` as the insertion marker for the resolved value.
- **`falsy`** — rendered when the placeholder is not set (usually left empty).

**Examples:**

```markdown
Hello, \[[username ? $! : ]]
```

When `username` is unset, nothing is shown. When `username` is `alice`, it renders `Hello, alice!`.

### User-Set vs. Any Resolved Value

By default, the conditional triggers only when the **user has explicitly entered a value** — a registry `defaultValue` is only a display fallback and does **not** count as "set". Append `*` to the name to also trigger on registry defaults:

| Syntax | Triggers truthy when… |
| :--- | :--- |
| `\[[name ? truthy : falsy]]` | User has explicitly entered a value (registry `defaultValue` ignored) |
| `\[[name* ? truthy : falsy]]` | Any resolved value exists (user-set **or** registry `defaultValue`) |

**Example with `defaultValue: "Guest"` and no user input:**

* `\[[username ? Hi, $! : ]]` → "" (falsy — user-set only, default ignored)
* `\[[username* ? Hi, $! : ]]` → "Hi, Guest!" (any-value — default fires truthy)

Test it out here:

* `\[[username]]`: [[username]]
* `\[[username : fallback]]`: [[username : fallback]]
* `\[[username ? Hi, $! : ]]`: [[username ? Hi, $! : ]]
* `\[[username* ? Hi, $! : ]]`: [[username* ? Hi, $! : ]]

Regular display syntax (`\[[name]]`, `\[[name : fallback]]`) is unchanged and always uses the full resolution chain.

For attributes with `class="cv-bind"`:

```html
<img src="https://cdn.example.com\[[user ? /avatar/$ : ]]" class="cv-bind" alt="Avatar" />
```

No `user` → `src="https://cdn.example.com"`. With `user=alice` → `src="https://cdn.example.com/avatar/alice"`.

> **URL encoding**: In `href` and `src` attributes, the `$` value is URL-encoded automatically (same as regular placeholders).

> **Known limitation**: The `:` character cannot appear inside the truthy template (e.g., URLs with ports like `localhost:8080`). Use a regular placeholder or construct the value differently in those cases.

## Placeholder-Driven Toggle Visibility

You can show or hide a block of content based on whether a placeholder has a value, using the `placeholder-id` attribute on `<cv-toggle>`:

```html
<cv-toggle placeholder-id="username">Welcome, [[username]]!</cv-toggle>
```

The block is **hidden** when `username` has no value, and **visible** when it does. This is useful for conditional sections that only make sense once a user has provided input. Like the conditional syntax, toggle visibility by default requires the **user to have explicitly entered a value**. Append `*` to also show when a registry `defaultValue` exists.

* `placeholder-id="username"`: Toggle only shows when user has explicitly entered a value, irregardless of a default value.
* `placeholder-id="username*"`: Toggle shows when user has explicitly entered a value AND when a default value is available.



```html
<!-- Hidden unless user has set a value (registry default ignored) -->
<cv-toggle placeholder-id="username">Welcome, [[username]]!</cv-toggle>

<!-- Visible if user has set a value OR a registry defaultValue exists -->
<cv-toggle placeholder-id="username*">Welcome, [[username]]!</cv-toggle>
```

Placeholder mode has no peek, label, or border behaviour. `placeholder-id` takes precedence over `toggle-id`, and should not be used on the same element.


## HTML Attribute Interpolation

In addition to text, you can interpolate variables into HTML attributes, such as `href` or `src`. This is useful for creating dynamic links or loading images based on user preferences.

**Requirements:**

1. You must use standard HTML syntax (e.g., `<a href="...">`) rather than Markdown links.
2. You must add the `class="cv-bind"` (or `data-cv-bind`) attribute to the element. This signals the system to scan the element's attributes.


**Example: Dynamic Query Parameter:**

```html
<!-- Use it in a link -->
<a href="https://www.google.com/search?q=\[[searchQuery]]" class="cv-bind">
  Search Google for '\[[searchQuery]]'
</a>
```

Update the placeholder value here: <cv-placeholder-input name="searchQuery" />.

This renders into:
<a href="https://www.google.com/search?q=[[searchQuery]]" class="cv-bind">
Search Google for '[[searchQuery]]'
</a>

If the user sets `searchQuery` to `hello/world`, the link becomes `https://www.google.com/search?q=hello%2Fworld`.



> **Automatic Encoding**: Placeholders used in `href` and `src` attributes are URL-encoded to ensure valid URLs (e.g. `/` becomes `%2F`). Else, if the placeholder value is a full URL (e.g. `https://example.com`), a relative path (e.g. `/assets/logo.png`) or a special protocol (e.g. `mailto:email@example.com`), it will not be encoded.

> **Note**: The `class` attribute is **excluded** from placeholder binding to prevent conflicts with dynamic class manipulation by JavaScript or CSS frameworks. If you need dynamic classes, use JavaScript or CSS to add/remove classes instead.
> Or raise an issue to explore the use case!

**Dynamic Image Source:**

```html
<img src="https://example.com/assets/[[theme]].png" class="cv-bind" alt="Theme Preview" />
```

## Escaping Syntax

You can "escape" the placeholder syntax if you want to display the literal brackets instead of a variable.

- **In Markdown Text**: Use two backslashes: `\\\[[ variable ]]`.
- **In Code Blocks**: Use one backslash: `\\[[ variable ]]`.

## Inline Editing of Placeholders
 
You can allow users to edit placeholders directly on the page using the `<cv-placeholder-input>` component. By default, the component renders inline with text. For example, you can update your username placeholder here: <cv-placeholder-input name="username" width="150px" hint="Your Name" appearance="underline"></cv-placeholder-input>, which updates your username: [[username]].

Several attributes control the appearance and behavior of the component:
* `layout`: The layout to use (inline, stacked, or horizontal).
  * `inline` (Default): Component sits in the text flow, and the label is hidden visually.
  * `stacked`: Label sits on top of the input. Input takes full width.
  * `horizontal`: Label sits to the left of the input. Input takes remaining space.
* `appearance`: The appearance to use (outline, underline, or ghost).
  * `outline` (Default): Standard input box with border.
  * `underline`: Only a bottom border. Great for inline text.
  * `ghost`: No border until focused. Seamless blending for inline text that can be edited.
* `label`: The label to use (for stacked or horizontal layouts).
* `hint`: The hint to use (for inline layouts).
* `width`: The width of the component.


<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<!-- Inline layout -->
My username is <cv-placeholder-input name="username" layout="inline" appearance="underline" hint="Your Name"></cv-placeholder-input> and it is <cv-placeholder-input name="username" layout="inline" appearance="ghost" width="auto-grow" hint="this auto-grows"></cv-placeholder-input>.

<!-- Stacked layout -->
<cv-placeholder-input name="username" layout="stacked"></cv-placeholder-input>
 
<!-- Horizontal layout -->
<cv-placeholder-input name="username" layout="horizontal" label="Username:"></cv-placeholder-input>

</variable>
</include>



### Placeholder-Input Attributes
 
| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| name | `string` | - | **Required**. The placeholder name to bind to. |
| layout | `string` | `inline` | `inline`, `stacked`, `horizontal`. |
| appearance | `string` | `outline` | `outline`, `underline`, `ghost`. |
| label | `string` | value defined in config | Visual label text (for stacked/horizontal) or `aria-label` (for inline). |
| hint | `string` | value defined in config | Overrides the placeholder hint/placeholder text. |
| width | `string` | Varies | `100%` for stacked, `flex-fill` for horizontal, and browser default for inline. Set `auto-grow` to resize based on content (inline only). |

## Placeholder Configuration

| Field         | Type      | Description                                                                                                    |
| ------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| name          | `string`  | **Required**. Unique identifier (e.g., `api_key`).                                                             |
| settingsLabel | `string`  | Display label in Settings.                                                                                     |
| settingsHint  | `string`  | Helper text in input field.                                                                                    |
| defaultValue  | `string`  | Display fallback when no user value or inline fallback is provided. Does **not** count as "user-set" — conditional syntax (`?`) treats it as unset unless `*` is appended. |
| isLocal       | `boolean` | If `true`, the input field only appears in Settings when the placeholder is actually used on the current page. |

Example:

```json
{
  "config": {
    "placeholders": [
      { "name": "username", "settingsLabel": "Your Username", "settingsHint": "Enter username" },
      { "name": "searchQuery", "settingsLabel": "Search Query", "settingsHint": "Enter search query", "isLocal": true }
    ]
  }
}
```

## Tab Group Binding & Integration

You can bind a **Tab Group** directly to a placeholder variable in your `custardui.config.json`. This allows the variable to update automatically when the user switches tabs.

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

## Persistence

Values entered by the user are saved in the browser's `localStorage` (key: `cv-user-variables`). This means:

1. Values persist across page reloads.
2. Values persist when navigating between different pages of the documentation.

## Shareable URL

Placeholder values can be shared via URL using the `ph` parameter. The format is a comma-separated list of `key:value` pairs, with each component individually encoded with `encodeURIComponent`. This means commas inside a value appear as `%2C`, colons appear as `%3A`, spaces appear as `%20`, while the outer commas and colons are not encoded, which keeps the structural separators clear.

| Parameter | Format | Example |
|-----------|--------|---------|
| `ph`      | Comma-separated `key:value` pairs | `?ph=username:alice` |

```
?ph=username:alice,searchQuery:searchThis
```

Placeholder values that are derived from a tab group (bound via `placeholderId` in the config) should not be included in `?ph=` — they are implied by the `?tabs=` parameter and are automatically re-derived when the page loads.

**Constructing the URL in JavaScript:**

```js
const ph    = { username: 'alice', api_key: 'my-key' };
const param = Object.entries(ph)
  .map(([k, v]) => `${encodeURIComponent(k)}:${encodeURIComponent(v)}`)
  .join(',');
const url = `https://yoursite.com/quickstart.html?ph=${param}`;
```
