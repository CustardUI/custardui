<frontmatter>
  title: NUS — CustardUI Page
  layout: nus.md
</frontmatter>

# Welcome, [[username]]! (NUS)

TODO: 
> Keep it as a redirect page to the main page.
> Load nus.json as the default config file.

-----


This page automatically activates the **NUS adaptation** via its layout—no query parameter is required. You can also trigger or share the NUS theme using `?adapt=nus`, and once activated, the NUS theme persists across all pages until cleared.

[Share NUS theme link](?adapt=nus) | [Clear adaptation](?adapt=clear)
---

The NUS adaptation applies the following configuration from [`nus.json`](nus.json):

- **Theme**: NUS blue (`#003d7c`) tints the settings icon and active controls.
- **Default toggles**: `linux` defaults to **show**, `windows` defaults to **hide** — users can still override these in the settings modal.
- **Default placeholder**: `username` is pre-filled as `NUS Student` (user can override).
- **Hash indicator**: The URL bar shows `#/nus` after the adaptation loads.

---

## Content with adaptation defaults applied

<cv-toggle toggle-id="mac" show-label>

<box type="info">

**macOS content** — no default set by NUS adaptation, inherits the config file default.

</box>
</cv-toggle>

<cv-toggle toggle-id="linux" show-label>

<box type="success">

**Linux content** — defaults to **shown** under the NUS adaptation. You can still hide it in the settings modal.

</box>
</cv-toggle>

<cv-toggle toggle-id="windows" show-label>

<box>

**Windows content** — defaults to **hidden** under the NUS adaptation. You can still show it in the settings modal.

</box>
</cv-toggle>
