<frontmatter>
  title: Author Guide - Tabs
  layout: authorGuide.md
  pageNav: 3
  pageNavTitle: "Topics"
</frontmatter>

## Tabs

`<cv-tabgroup>`
`<cv-tab>`

The **Tabs** component lets you define **mutually exclusive content sections** that users can toggle between — perfect for organizing platform-specific, step-based, or categorized documentation.

When multiple tab groups (`<cv-tabgroup/>`) share the same `group-id` attribute, they stay synchronized automatically across the entire page.


<panel header="Code for Following Tab Group Example">

```md

**First TabGroup:** 

<cv-tabgroup group-id="fruit">
  <cv-tab tab-id="apple" header="Apple">

**Apple Information**

Apples are crisp, sweet fruits that come in many varieties. They are rich in fiber and vitamin C.

<box type="important" icon=":apple:">
    An apple a day keeps the doctor away!
</box>

  </cv-tab>
  <cv-tab tab-id="orange" header="Orange">

**Orange Information**

Oranges are citrus fruits known for their high vitamin C content and refreshing juice.

<box type="warning" icon=":orange:">
    The color orange was named after the fruit, not the other way around
</box>

  </cv-tab>
  <cv-tab tab-id="pear" header="Pear">

**Pear Information**

Pears are sweet, bell-shaped fruits with a soft texture when ripe. They're high in fiber and antioxidants.

<box type="success" icon=":pear:">
    Pears do not ripen on the tree; they ripen from the inside out after being picked.
</box>

  </cv-tab>
</cv-tabgroup>

**Second TabGroup:** 

<cv-tabgroup group-id="fruit">
  <cv-tab tab-id="apple">
  <cv-tab-header>

:fa-solid-heart: Apple Types
  </cv-tab-header>

  Apple types include **Granny Smith** and the **Cosmic Crisp**.
  </cv-tab>
  <cv-tab tab-id="orange">
  <cv-tab-header>

:fa-solid-circle: Orange Types
  </cv-tab-header>

  Orange types include the **Blood orange** and **Valencia orange**.
  </cv-tab>
  <cv-tab tab-id="pear">
  <cv-tab-header>

  :fa-solid-leaf: Pear Types
  </cv-tab-header>

  Pear types include the **Asian pear** and the **European pear**
  </cv-tab>
</cv-tabgroup>

```

</panel>
<br>

**First TabGroup:**

<cv-tabgroup group-id="fruit" >
  
  <cv-tab tab-id="apple" header="Apple">
  
  **Apple Information**

Apples are crisp, sweet fruits that come in many varieties. They are rich in fiber and vitamin C.

  <box type="important" icon=":apple:">
      An apple a day keeps the doctor away!
  </box>

  </cv-tab>
  <cv-tab tab-id="orange" header="Orange">
  
  **Orange Information**

Oranges are citrus fruits known for their high vitamin C content and refreshing juice.

  <box type="warning" icon=":orange:">
      The color orange was named after the fruit, not the other way around
  </box>

  </cv-tab>
  <cv-tab tab-id="pear" header="Pear">
  
  **Pear Information**

Pears are sweet, bell-shaped fruits with a soft texture when ripe. They're high in fiber and antioxidants.

  <box type="success" icon=":pear:">
    Pears do not ripen on the tree; they ripen from the inside out after being picked. 
  </box>
  </cv-tab>
</cv-tabgroup>

**Second TabGroup:**

<cv-tabgroup group-id="fruit">
  <cv-tab tab-id="apple">
  <cv-tab-header>

:fa-solid-heart: Apple Types
</cv-tab-header>
<cv-tab-body>

Apple types include **Granny Smith** and the **Cosmic Crisp**.
</cv-tab-body>
</cv-tab>
<cv-tab tab-id="orange">
<cv-tab-header>

:fa-solid-circle: Orange Types
</cv-tab-header>
<cv-tab-body>

Orange types include the **Blood orange** and **Valencia orange**.
</cv-tab-body>
</cv-tab>
<cv-tab tab-id="pear">
<cv-tab-header>

:fa-solid-leaf: Pear Types
</cv-tab-header>
<cv-tab-body>

Pear types include the **Asian pear** and the **European pear**
</cv-tab-body>
</cv-tab>
</cv-tabgroup>


<br>

- **Single-Click:** Clicking once switches tabs locally for that tab group only. 
- **Double-Click:** Clicking twice synchronizes the tab selection across all tab groups with the same `id` on the page. The state is saved to browser storage and persists across page reloads.
  - **E.g.:** If you have two tab groups with same `id`, double-clicking will sync both groups to show the same tab and save the state.

### Multi-ID Tabs

You can create a single tab that represents multiple alternative IDs by specifying multiple IDs separated by spaces or `|`

- This will create **one tab** in the navigation bar that activates when **any** of the specified IDs is selected.
- The tab header displays the label of the first ID in the list (or the `header` attribute if provided).
- The content inside the tab is shared for all IDs listed.
- **Use case:** When multiple options (e.g., `python java`) present the same content, show a single tab instead of duplicates that might confuse readers into thinking the content differs.

<!-- ------------------------ CODE OUTPUT ---------------------------- -->

**Example:**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup group-id="lang" >
  <cv-tab tab-id="python" header="Python">

Python is a high-level, interpreted programming language known for its simplicity and readability.

  </cv-tab>
  <cv-tab tab-id="java" header="Java">

Java is a statically-typed, compiled language known for its robustness and platform independence.

  </cv-tab>
  <cv-tab tab-id="javascript" header="JavaScript">

JavaScript is a dynamic language primarily used for web development.

  </cv-tab>
</cv-tabgroup>

<cv-tabgroup group-id="lang" >
  <cv-tab tab-id="python java" header="Python/Java Installation">

Both Python and Java are easy to install. Download from their official websites.

  </cv-tab>
  <cv-tab tab-id="javascript" header="JS Installation">

Install JavaScript by downloading Node.js from nodejs.org.

  </cv-tab>
</cv-tabgroup>
</variable>
</include>

<!-- ------------------------ CODE OUTPUT ---------------------------- -->

**Behavior:** In the second tab group, you'll see a single "Installation" tab in the navigation bar that becomes active when either Python or Java is selected in the first group. This avoids showing duplicate tabs with identical content.

### Setting the Default Tab

By default, the **first tab** in a group is selected when the page loads (unless the user has previously selected a different tab, in which case their selection is restored).

You can override this default behavior and specify which tab should be initially selected using the `custardui.config.json`, by adding a `default` property to the `tabGroup`. Refer to [TabGroup Configuration](#tabgroupconfig) for more information.

**Default Tab Example Configuration:**
To make the "orange" tab selected by default for the "fruit" group:

```json
{
  "config": {
    "tabGroups": [
      {
        "groupId": "fruit",
        "default": "orange",
        "tabs": [...]
      }
    ]
  }
}
```

<br>


### No-ID Tabs

Each tabgroup element should have a parent `id` attribute, while each tab element should have their own tab `id` as well. 
* However, if a tabgroup element does not have an `id` attribute, the tabgroup and children tabs will function as normal tabs. If the children tabs do not have `id` or `header` attributes, their headers will be enumerated.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup>
<cv-tab>

Some Tab Content
</cv-tab>
<cv-tab>

Some Other Tab Content
</cv-tab>
</cv-tabgroup>
</variable>
</include>


### Attributes of `<cv-tabgroup>`

| Name     | Type     | Default        | Description                                                                        |
| -------- | -------- | -------------- | ---------------------------------------------------------------------------------- |
| group-id | `string` | **(required)** | Unique identifier for the tab group. Tab groups with the same ID will synchronize. |
| nav      | `string` | `"auto"`       | Navigation display mode. Use `"none"` to hide navigation headers.                  |

### Attributes of `<cv-tab>`

| Name   | Type     | Default        | Description                                                                                                                     |
| ------ | -------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| tab-id | `string` | **(required)** | Unique identifier for the tab within its group.                                                                                 |
| header | `string` | Tab ID         | Display label for the tab. Supports plain text and raw HTML (e.g., icons via `<i>` tags). Does not support MarkBind shortcodes. |

## Header Syntax with Rich Formatting

In addition to the standard `header` attribute, you can use an alternative syntax with `<cv-tab-header>` and `<cv-tab-body>` elements to enable **rich HTML formatting** in your tab headers.

This is useful when you need **bold**, _italic_, or <mark>colored text</mark> in headers, **icons or badges** alongside the header text, **complex nested elements** with custom styling, or **multi-line or specially formatted headers**.

**Key Points:**

- `<cv-tab-header>` is the recommended way to define headers. Takes precedence over `header` attribute.
- **Icon Support:**
  - **Using `<cv-tab-header>` component:** Supports both your SSG's (e.g. MarkBind) shortcodes (e.g., `:fa-user:`) and raw HTML. Your SSG is able to process the content automatically.
  - **Using the `header="..."` attribute:** Supports **raw HTML only** (e.g., `header='<i class="fa-solid fa-user"></i> Title'` to display an icon, and bold is `header='<strong>Important</strong>'`). MarkBind shortcodes **will not work** in attributes.

### Syntax & Rules

**Structure:**

```html
<cv-tab tab-id="tab-id">
  <cv-tab-header>Header content (supports HTML)</cv-tab-header>
  <cv-tab-body>Tab body content (both can be used together)</cv-tab-body>
  Tab body content (both can be used together)
</cv-tab>
```

### `<cv-tab-header>` Attributes

No required attributes, just a container for the tab header content.

### `<cv-tab-body>` Attributes

No required attributes, just a container for the tab body content.

<!-- ------------------------ HEADER EXAMPLES ---------------------------- -->

<panel header="### Basic Example">

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup group-id="docs" >
  <cv-tab tab-id="overview" header="My Overview">
    <!-- <cv-tab-header><strong>Overview</strong></cv-tab-header> -->
    <cv-tab-body>
      Start here to learn the basics.
    </cv-tab-body>
  </cv-tab>
  
  <cv-tab tab-id="advanced">
    <cv-tab-header>
      
***Advanced Topics***
    </cv-tab-header>
    <cv-tab-body>
      Dive deeper into powerful features.
    </cv-tab-body>
  </cv-tab>
</cv-tabgroup>
</variable>
</include>

</panel>

<panel header="### Advanced Example with Badges">

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup>
  <cv-tab header="active">
    <cv-tab-header>
      <strong>Active</strong> 
      <span style="color: green; margin-left: 0.5rem;">●</span>
    </cv-tab-header>
    <cv-tab-body>
      Currently active items are displayed here.
    </cv-tab-body>
  </cv-tab>
  
  <cv-tab header="archived">
    <cv-tab-header>
      <i>Archived</i> 
      <span style="color: gray; margin-left: 0.5rem;">●</span>
    </cv-tab-header>

    Archived items are stored here for reference.
  </cv-tab>
</cv-tabgroup>
</variable>
</include>

</panel>

<panel header="### Using Icons in Headers">

Since `<cv-tab-header>` accepts HTML elements, you can include icons in multiple ways:

1. **Via MarkBind shortcodes** (when using MarkBind) — MarkBind pre-processes `:fa-solid-icon:` into `<i>` elements
2. **Via direct HTML** — Include Font Awesome `<i>` tags directly

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup group-id="status">
<cv-tab tab-id="enabled">
  <cv-tab-header>
  
  :fa-solid-virus: Enabled
  </cv-tab-header>
  <cv-tab-body>
    This feature is currently enabled and active.
  </cv-tab-body>
</cv-tab>

<cv-tab tab-id="disabled">
  <cv-tab-header>
  
  :fa-solid-virus-slash: Disabled
  </cv-tab-header>
  
  This feature is currently disabled.
</cv-tab>

  <cv-tab tab-id="pending">
  <cv-tab-header>
  
  :fa-solid-hourglass-end: Pending
  </cv-tab-header>
  <cv-tab-body>
    This feature is pending review.
  </cv-tab-body>
  </cv-tab>
</cv-tabgroup>
</variable>
</include>

**Example with direct HTML:**

```html
<cv-tab tab-id="enabled" header="<i class='fa-solid fa-virus'></i> Enabled">
  <cv-tab-header><i class="fa-solid fa-virus"></i> Enabled</cv-tab-header>
  <cv-tab-body>This feature is enabled.</cv-tab-body>
</cv-tab>
```

**Note:** `<cv-tab-header>` accepts any HTML elements. Icon shortcodes like `:fa-solid-virus:` work because MarkBind pre-processes them inside the element content. For `header` attributes, you must use direct HTML tags like `<i class="fa-solid fa-virus"></i>` as MarkBind does not process attributes.

</panel>


<br>


# Configuration

Tab groups work out of the box with no setup — just use the `<cv-tabgroup>` and `<cv-tab>` elements.  
By default, the first tab is shown.

For more control (such as settings integration or default selections), configure them in your `custardui.config.json`.

```json
{
  "config": {
    "tabGroups": [
      {
        "groupId": "fruit",
        "label": "Fruit Selection",
        "isLocal": false,
        "default": "apple",
        "tabs": [
          { "tabId": "apple", "label": "Apple" },
          { "tabId": "orange", "label": "Orange" },
          { "tabId": "pear", "label": "Pear" }
        ]
      },
      {
        "groupId": "localTabGroup",
        "label": "Page specific tabgroup",
        "isLocal": true,
        "default": "c",
        "tabs": [
          { "tabId": "a", "label": "Alpha" },
          { "tabId": "b", "label": "Beta" },
          { "tabId": "c", "label": "Charlie" }
        ]
      }
    ]
  }
}
```

### Configuration Fields in custardui.config.json

#### TabGroupConfig

The TabGroupConfig object is for defining tabgroups in JSON configuration.

| Name        | Type        | Default        | Description                                                                           |
| ----------- | ----------- | -------------- | ------------------------------------------------------------------------------------- |
| groupId     | `string`    | **(required)** | Group identifier (must match HTML `cv-tabgroup` id).                                  |
| label       | `string`    | -              | Display name shown in the settings.                                                   |
| description | `string`    | -              | Optional description to display below functionality.                                  |
| isLocal     | `boolean`   | `false`        | Set to `true` to make the group only appear in the settings on pages where it's used. |
| default     | `string`    | -              | The `tabId` of the tab that should be selected by default.                            |
| tabs        | TabConfig[] | **(required)** | Array of tab configurations.                                                          |

#### TabConfig

The TabConfig object is for defining tabs in JSON configuration.

| Name  | Type     | Default        | Description                                                              |
| ----- | -------- | -------------- | ------------------------------------------------------------------------ |
| tabId | `string` | **(required)** | Tab identifier (must match HTML `cv-tab` id).                            |
| label | `string` | -              | Display label for the tab (used in settings and as fallback for header). |

<box type="info">

**Note:** Configuration is completely optional. Tab groups will work fine without being added to the config file—they'll just default to showing the first tab and won't appear in the settings.
</box>

### Binding to Placeholders

You can bind a tab group to a placeholder variable. Selecting a tab will automatically set the variable's value.

| Name             | Type     | Description                                                                |
| ---------------- | -------- | -------------------------------------------------------------------------- |
| placeholderId    | `string` | Added to `TabGroupConfig`. The name of the placeholder variable to update. |
| placeholderValue | `string` | Added to `TabConfig`. The value to set when this tab is active.            |

**Example:**

```json
{
  "groupId": "code-switch",
  "placeholderId": "lang",
  "tabs": [
    { "tabId": "java", "label": "Java", "placeholderValue": "java" },
    { "tabId": "python", "label": "Python", "placeholderValue": "python" }
  ]
}
```

# Global vs. Local Tab Groups

By default, all tab groups defined in your configuration are **global**—they will appear in the settings on every page of your site.

You can mark a tab group as **local** to make it appear in the settings _only_ on pages where that specific tab group is actually used. This is useful for keeping the settings clean and only showing relevant options to the user.

To mark a tab group as local, add `"isLocal": true` to its configuration.

**Example:**

For example, this tab group is only specific to this page:

<cv-tabgroup group-id="ltab">
<cv-tab tab-id="lt1">
  Tab 1
</cv-tab>
<cv-tab tab-id="lt2">
  Tab 2
</cv-tab>
<cv-tab tab-id="lt3">
  Tab 3
</cv-tab>
</cv-tabgroup>

<panel header="Code for above Tab Group">

```html
<cv-tabgroup group-id="ltab">
  <cv-tab tab-id="lt1"> Tab 1 </cv-tab>
  <cv-tab tab-id="lt2"> Tab 2 </cv-tab>
  <cv-tab tab-id="lt3"> Tab 3 </cv-tab>
</cv-tabgroup>
```

</panel>

<br>

By setting it as **local** in the configuration, the "Local Tab Configuration" option will only show up in the settings on pages containing that tab group.

If all tab configurations (and other component configurations) are local, and a given page has no configured elements, neither the modal nor the modal icon will appear.

**Configuration file** setting this option:

```json
{
  "config": {
    "tabGroups": [
      {
        "groupId": "ltab",
        "label": "Local Tab Configuration",
        "isLocal": true, // This makes the group local
        "tabs": [
          { "tabId": "lt1", "label": "Tab Option 1" },
          { "tabId": "lt2", "label": "Tab Option 2" },
          { "tabId": "lt3", "label": "Tab Option 3" }
        ]
      }
    ]
  }
}
```

### Keeping Local Tab Groups in Settings

If you have a specific use case where you may want all local tab groups to be available in the settings on a certain page (e.g. a global settings page), you can add hidden `<cv-tabgroup>` elements to register the local tab groups on that page. That way, the plugin will pick them up and add them to the settings dialog for that page without introducing extra spacing in your layout.

* E.g. `<cv-tabgroup group-id="localTabGroup" hidden></cv-tabgroup>`


# Shareable URL

Active tab selections can be encoded in a URL using the `tabs` parameter. The format is a comma-separated list of `groupId:tabId` pairs, where each group ID and tab ID is individually encoded with `encodeURIComponent`.

| Parameter | Format | Example |
|-----------|--------|---------|
| `tabs`    | Comma-separated `groupId:tabId` pairs | `?tabs=os:linux,lang:python` |

```
?tabs=os:linux,lang:python
```

Only the tab groups explicitly listed are affected; all others retain the visitor's saved selection or the configured default.

**Constructing the URL in JavaScript:**

```js
const tabs  = { os: 'linux', lang: 'python' };
const param = Object.entries(tabs)
  .map(([g, t]) => `${encodeURIComponent(g)}:${encodeURIComponent(t)}`)
  .join(',');
const url = `https://yoursite.com/guide.html?tabs=${param}`;
```
