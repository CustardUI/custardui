<frontmatter>
  title: Author Guide - Highlighting Modes
  layout: authorGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Highlighting Modes

CustardUI provides two distinct highlighting features to guide the recipient's attention to specific sections of a document:

1. **Boxed Element Highlighting (`cv-box`)**
2. **Text Highlighting (`cv-highlight`)**

These modes solve different sharing needs. Element boxing focuses on layout elements and overall document sections, whereas text highlighting enables fine-grained text selection.

---

## 1. Boxed Element Highlighting (`cv-box`)

Boxed Element Highlighting is designed to call attention to entire structural elements of a page, such as a code block, a table, a list, or a callout box.

### Features
* **Visual Boxing**: Selected elements are outlined with a premium border and an optional background overlay.
* **Inline Customization**: When an element is selected in Box mode, an inline color picker and annotation editor seamlessly appear directly next to the element!
* **Color Selection**: Choose from multiple colors to color-code different boxed elements.
* **Annotations**: Add a custom text note (annotation) that is attached to the boxed element, providing context or instructions to the recipient.
* **Arrow Indicators**: A premium floating arrow points to the boxed element to instantly draw the eye.
* **Multi-selection**: Multiple distinct elements on a page can be boxed together in a single link.

### URL Parameter
* **Parameter**: `cv-box`
* **Format**: Comma-separated or plus-separated element IDs.
* **Example**: `?cv-box=setup-guide,code-block-config`
---

## 2. Text Highlighting (`cv-highlight`)

Text Highlighting allows authors to select specific spans of text across a document and generate a shareable link. When a reader clicks the link, the document automatically scrolls to the first highlighted range and renders the selected text in a chosen color.

### Key Visual & UX Features
* **Natural Text Selection**: The author can select any text range naturally with their mouse or keyboard.
* **Instantaneous Highlighting**: As soon as text is selected, the color highlight is instantly applied to the screen. Browser default selection overlays are automatically cleared, making the custom highlight instantly visible.
* **Smart Overlap Resolution**: If you select text that partially overlaps or touches an existing highlight, CustardUI intelligently merges them into one continuous block. Selecting a complete subset of an existing highlight is safely ignored, preventing duplicates.
* **Multiple Highlights**: Authors can make multiple text highlights in a single session! Simply select more text to add new highlighted spans to the same link.
* **Color Selection**: Authors can choose from 5 highlight colors independently using the swatches in the bottom floating toolbar *before* making the selection, i.e. yellow, blue, red, green and black.
* **Cohesive Selection Modes**: Element selections (box, show, hide) and text highlights are kept mutually exclusive. Selecting an element clears active text highlights, and selecting text automatically clears element selections, ensuring the copied link contains a clean, non-conflicting state.
* **Unified Link Generation**: Links and previews are created using the "Copy Link" and "Preview" buttons in the bottom toolbar, making the UX perfectly consistent across all selection modes.

---

## Step-by-Step Guide: Creating a Text Highlight

Follow these steps to generate a text highlight link:

1. **Enter Share Mode**:
   * Open the Settings dialog and go to the **Share** tab, or append `#cv-share` to the URL.
2. **Select the Highlight Tool**:
   * In the floating `ShareToolbar` at the bottom of the screen, select the **Highlight** button.
   * This deactivates standard element hover-outlining, sets the cursor to `text`, and unlocks native text selection.
3. **Choose Color**:
   * Select your desired highlight color using the swatches in the bottom toolbar.
4. **Highlight your Text**:
   * Select a text span on the page. The chosen color highlight is instantly applied, and the highlight count in the bottom toolbar incremented.
   * Repeat this to highlight multiple text ranges in different colors!
5. **Copy or Preview**:
   * Click **Copy Link** in the bottom toolbar to copy the generated URL to your clipboard.
   * Click **Preview** to verify exactly how the recipient will see the page.