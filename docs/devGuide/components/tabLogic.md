<frontmatter>
  title: "Developer Guide - Tab Logic"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

## Overview

The tab system is designed to provide flexible content switching while maintaining a consistent user experience across complex pages. It manages two distinct types of state:

- **Local Selection**: Represents the tab currently visible within a specific instance of a tab group.
- **Global Marking**: Allows a specific tab choice to be synchronized across all instances of the same "group" on the page.

## Core Principles

### Declarative Visibility
Rather than forcing individual tabs to manage their own display logic, the parent group acts as a controller. It monitors selection changes and declaratively instructs child components to show or hide their content. This ensures that only one tab's body is active at a time, keeping the DOM footprint manageable and the UI responsive.

### State Synchronization
When a user "marks" a preference (e.g., via a specific action on the tab), that choice is propagated through a central store. This ensures that if the same information is presented in multiple locations (like a header and a footer section), the user's selected context is preserved everywhere simultaneously.

### Layout Stabilization (Scroll Anchoring)
One of the most significant challenges in modern web interfaces is "layout shift." When switching between tabs with vastly different content heights, the page below the tabs can "jump" up or down, causing the user to lose their visual reference or click targets.

To solve this, the tab system implements **Scroll Stabilization**:
1. **Observation**: Before a tab swap occurs, the system snapshots the visual position of the tab group relative to the user's viewport.
2. **Commitment**: The tab content is swapped, causing the browser to reflow and potentially shift the page.
3. **Restoration**: The system calculates the resulting shift and instantly compensates by adjusting the window's scroll position.

This process happens within a single browser rendering cycle, making the transition feel visually locked in place for the user, regardless of how much the content height changed.

## Key Considerations

- **Visual Inheritance**: Components are designed to be theme-agnostic, inheriting colors and typography from their parent container rather than using hardcoded values.
- **Content Flexibility**: Tabs can contain any valid HTML or other custom components, with the system automatically adjusting its stabilization logic to accommodate the resulting layout.
- **Interaction Model**: Standard clicks manage local navigation, while more intentional actions (like double-clicks or specific icon interactions) manage global marking.
