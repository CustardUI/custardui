<frontmatter>
  title: CustardUI - URL Sharing
  layout: authorGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## URL Sharing

CustardUI's **Share** button generates a URL that encodes the current page's view state — which toggles are shown or hidden, which tabs are active, and what placeholder values are set — as query parameters. Anyone who visits that URL sees the exact state you intended. You can also construct these URLs manually or programmatically to create deep-links into specific documentation views, open the settings dialog, or activate focused/share views.

## All Parameters

### View State Parameters

| Parameter | Applies To | Format | Example |
|-----------|------------|--------|---------|
| `t-show`  | Toggles | Comma-separated toggle IDs | `?t-show=mac,linux` |
| `t-peek`  | Toggles | Comma-separated toggle IDs | `?t-peek=advanced` |
| `t-hide`  | Toggles | Comma-separated toggle IDs | `?t-hide=windows` |
| `tabs`    | Tab groups | Comma-separated `groupId:tabId` pairs | `?tabs=os:linux,lang:python` |
| `ph`      | Placeholders | Comma-separated `key:value` pairs | `?ph=username:alice` |

### Settings Dialog Parameters

| Parameter | Format | Description |
|-----------|--------|-------------|
| `#cv-open` | Hash | Opens the settings dialog without reloading the page |
| `?cv-open` | Query | Opens the settings dialog on page load, then auto-cleans the URL |

### Focused Views Parameters

| Trigger (Hash) | Trigger (Query) | Mode Activated |
|:---------------|:----------------|:---------------|
| `#cv-share` | `?cv-share` | Opens Share Mode (default selection mode) |
| `#cv-share-show` | `?cv-share-show` | Opens Share Mode in **Show** mode |
| `#cv-share-hide` | `?cv-share-hide` | Opens Share Mode in **Hide** mode |
| `#cv-share-highlight` | `?cv-share-highlight` | Opens Share Mode in **Highlight** mode |
| — | `?cv-show=id1,id2` | Focus View — shows only the listed element IDs |
| — | `?cv-hide=id1,id2` | Focus View — hides the listed element IDs |
| — | `?cv-highlight=id1,id2` | Focus View — highlights the listed element IDs |

## Tab Groups

The `tabs` parameter takes a comma-separated list of `groupId:tabId` pairs. Each group ID and tab ID is individually `encodeURIComponent`-encoded before being joined with `:` and then with `,`.

```
https://yoursite.com/guide.html?tabs=os:linux,lang:python
```

## Placeholders

The `ph` parameter takes a comma-separated list of `key:value` pairs with the same encoding rules as `tabs`. Because each component is `encodeURIComponent`-encoded, commas and colons inside keys or values are escaped automatically and do not break the parsing.

```
https://yoursite.com/quickstart.html?ph=username:alice,api_key:my-key
```

Placeholder values that are derived from a tab group (configured via `placeholderId` on a `TabGroupConfig`) should **not** be included in `?ph=`. They are implied by the `?tabs=` parameter and are re-derived automatically when the page loads.


## Combined Example (Tabs, Toggles, Placeholders)

A single URL can encode all three types of state at once. The following URL shows macOS and Linux content, hides Windows, selects the Linux tab in the `os` group and Python in the `lang` group, and prefills the `username` placeholder to `alice`:

```
https://yoursite.com/install.html?t-show=mac,linux&t-hide=windows&tabs=os:linux,lang:python&ph=username:alice
```

**JavaScript snippet:**

```js
const show  = ['mac', 'linux'];
const hide  = ['windows'];
const tabs  = { os: 'linux', lang: 'python' };
const ph    = { username: 'alice' };

const tabParam = Object.entries(tabs)
  .map(([g, t]) => `${encodeURIComponent(g)}:${encodeURIComponent(t)}`)
  .join(',');

const phParam = Object.entries(ph)
  .map(([k, v]) => `${encodeURIComponent(k)}:${encodeURIComponent(v)}`)
  .join(',');

const url = `https://yoursite.com/install.html`
          + `?t-show=${show.map(encodeURIComponent).join(',')}`
          + `&t-hide=${hide.map(encodeURIComponent).join(',')}`
          + `&tabs=${tabParam}`
          + `&ph=${phParam}`;
```

## Encoding of URL

Every individual ID, key, and value is encoded with `encodeURIComponent` before being joined. Commas act as list separators between items and are never part of an encoded value — if a toggle ID or placeholder value itself contained a comma, it would appear as `%2C` in the URL. Similarly, the colon in `tabs` and `ph` pairs separates the group/key from the tab/value; a colon inside a value is encoded as `%3A`.

For `tabs` and `ph`, the split on `:` is performed on the **first colon only**, so values that legitimately contain colons (e.g., a timestamp like `12:00`) are preserved correctly once decoded.

**Examples of special-character escaping:**

| Raw value | Encoded | URL appearance |
|-----------|---------|----------------|
| `my,key`  | `my%2Ckey` | `?ph=my%2Ckey:value` |
| `val:ue`  | `val%3Aue` | `?ph=key:val%3Aue` |
| `hello world` | `hello%20world` | `?t-show=hello%20world` |

## Precedence

URL parameters act as **sparse overrides**: only the items explicitly listed in the URL are affected. Everything else is resolved in this order:

1. **URL State** — any toggle, tab, or placeholder explicitly listed in the URL parameters wins.
2. **Persisted State** — if an item is not in the URL, the value stored in the visitor's `localStorage` is used.
3. **Default Configuration** — if neither URL nor storage has a value, the `default` from `custardui.config.json` is applied.

This means a link like `?t-hide=advanced` hides the `advanced` toggle for the recipient without touching any other toggle they may have configured locally.

The **Share button** behaves differently from a manually constructed URL: it performs an *absolute* encoding of the current page state, explicitly listing every toggle and tab group. This guarantees the recipient sees exactly what the sharer saw, regardless of their own saved preferences.

## Toggles

The three toggle parameters control visibility states independently. You can use any combination of `t-show`, `t-peek`, and `t-hide` in the same URL.

```
https://yoursite.com/install.html?t-show=mac,linux&t-hide=windows
```


## Settings Dialog

Append `#cv-open` to any page URL to open the settings dialog immediately without a page reload. This is the recommended approach for linking users to the settings from within documentation.

```markdown
[Open Settings](./guide.html#cv-open)
```

If you need to combine the settings trigger with a hash anchor (e.g., to scroll to a section), use the query parameter variant `?cv-open` instead — the hash can then remain free for the page anchor. The `?cv-open` parameter is automatically removed from the URL after the dialog opens.

```markdown
[Open Settings](./guide.html?cv-open#installation)
```

## Focused Views

CustardUI supports two families of focused-view parameters: **Share Mode triggers** that open the interactive element-selection UI, and **Focus View parameters** that directly apply a pre-built show/hide/highlight filter.

### Opening Share Mode

Hash-based triggers open Share Mode without reloading the page. Query-based triggers reload the page first, but they allow you to combine a share mode trigger with a hash anchor.

```
https://yoursite.com/guide.html#cv-share-highlight
https://yoursite.com/guide.html?cv-share-highlight#selecting-elements
```

### Direct Focus View Links

Once elements have been selected via Share Mode and a link generated, the resulting URL uses `?cv-show`, `?cv-hide`, or `?cv-highlight` with comma-separated HTML element IDs. You can also construct these directly.

```
https://yoursite.com/guide.html?cv-show=setup,config
https://yoursite.com/guide.html?cv-highlight=example-section
```

IDs are case-sensitive. Use `,` or `+` to separate multiple IDs. Standard alphanumeric IDs work without encoding; IDs with special characters should be URL-encoded.
