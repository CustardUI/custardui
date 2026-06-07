<frontmatter>
  title: Author Guide - Sharing
  layout: authorGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Show and Hide Modes

CustardUI provides **Show** and **Hide** modes to create focused views that filter out irrelevant content and guide the recipient's attention to the most important parts of a document. 

<!-- ![Screenshot Placeholder: Show/Hide Mode in Action](./placeholder-screenshot.png) -->

### The Two Modes
- **Show Mode (`cv-show`)**: Generates a custom view that shows *only* the specific elements you selected. All other surrounding content is hidden. This is perfect for sharing a single snippet, a specific step in a guide, or an isolated component.
- **Hide Mode (`cv-hide`)**: Generates a view that hides the selected elements, while the rest of the page remains visible. This is ideal for temporarily removing distracting content, such as a large irrelevant table or sidebar.

### Viewer Experience (Focus View)

When a recipient opens a link with Show or Hide modes applied, they enter **Focus View**:

1. **Hidden Content Markers**: Wherever content has been hidden by the system, CustardUI inserts unobtrusive inline markers (e.g., `... 3 sections hidden ...`). If the viewer needs more context, they can simply click on these markers to dynamically expand and reveal the hidden content inline.
2. **Focus Banner**: A banner appears at the top of the page, reminding the user they are viewing a focused version of the document.
3. **Show Full Page**: The focus banner provides a convenient "Show Full Page" button, allowing the recipient to instantly exit Focus View and return to the standard, unfiltered website layout.

<!-- *(Video Placeholder: Viewer expanding hidden content markers)* -->

---

## Step-by-Step Guide: Creating a Show/Hide Link

Follow these steps to generate a focused link:

1. **Enter Share Mode**:
   * Open the Settings dialog and click **Share**, or append `#cv-share-show` or `#cv-share-hide` to the URL.
2. **Select the Mode**:
   * In the floating `ShareToolbar` at the bottom of the screen, select either **Show** or **Hide**.
   * A selection box will follow your cursor, labeling the action (e.g., "Select to show").
3. **Select Elements**:
   * Hover over the desired structural elements on the page.
   * **Click** to select an element, or click and **drag** to lasso multiple elements at once!
   * Use the small tooltip helper (`↰`) to quickly select the parent container if needed.
4. **Copy or Preview**:
   * Click **Preview** in the toolbar to verify exactly how the filtered page will look to the recipient.
   * Click **Copy Link** to copy the generated URL to your clipboard.

---

## Manual URL Construction

While the Share Mode UI generates robust, encoded links automatically, you may sometimes want to manually create a readable link using known HTML element IDs. 

| Parameter | Format | Description |
| :--- | :--- | :--- |
| `cv-show` | `id1,id2` | **Shows** only the specified elements. All others are hidden. |
| `cv-hide` | `id1,id2` | **Hides** the specified elements. All others are shown. |

**Example:**
To show only the sections with IDs `#setup` and `#config`:
`https://yoursite.com/guide.html?cv-show=setup,config`

*Note: You can use commas `,` or plus signs `+` to separate multiple IDs. Commas will be URL-encoded to `%2C` by the browser.*
