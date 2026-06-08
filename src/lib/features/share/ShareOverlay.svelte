<script lang="ts">
  import { shareStore } from '$features/share/stores/share-store.svelte';
  import { isGenericWrapper, SHAREABLE_SELECTOR, isExcluded } from '$features/share/share-logic';
  import ShareToolbar from './ShareToolbar.svelte';
  import HoverHelper from './HoverHelper.svelte';
  import HighlightColorPicker from './HighlightColorPicker.svelte';
  import HighlightAnnotationEditor from './HighlightAnnotationEditor.svelte';
  import { mergeSelectionWithExisting } from '$features/text-highlight/text-highlight-logic';
  import { textHighlightService } from '$features/text-highlight/services/text-highlight-service.svelte';
  import { DEFAULT_ANNOTATION_CORNER } from '$features/annotations/annotation-types';

  let {
    excludedTags = ['HEADER', 'NAV', 'FOOTER'],
    excludedIds = [],
  }: { excludedTags?: string[]; excludedIds?: string[] } = $props();

  let excludedTagSet = $derived(new Set(excludedTags.map((t: string) => t.toUpperCase())));
  let excludedIdSet = $derived(new Set(excludedIds));

  // ── Highlighter pen cursor ────────────────────────────────────────────────
  // Maps each color key to a hex value for the SVG pen body fill.
  const CURSOR_COLORS: Record<string, { body: string; tip: string }> = {
    yellow: { body: '#facc15', tip: '#a16207' },
    blue: { body: '#60a5fa', tip: '#1d4ed8' },
    red: { body: '#f87171', tip: '#b91c1c' },
    green: { body: '#4ade80', tip: '#15803d' },
    black: { body: '#4b5563', tip: '#111827' },
  };

  function buildHighlighterCursor(colorKey: string): string {
    const c = CURSOR_COLORS[colorKey] ?? CURSOR_COLORS['yellow']!;
    // 28×28 SVG. The pen is drawn upright then rotated +35° around (14,10)
    // so the cap sits upper-right and the chisel nib lands at ≈ (6, 21) —
    // the cursor hot-spot — mimicking a natural hand-held highlighter angle.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <g transform="rotate(35, 14, 10)">
        <rect x="11" y="1" width="6" height="3" rx="1.5" fill="rgba(30,30,30,0.75)"/>
        <rect x="10" y="3.8" width="8" height="1" fill="rgba(0,0,0,0.22)"/>
        <rect x="10" y="4.8" width="8" height="12.5" rx="1" fill="${c.body}" stroke="rgba(0,0,0,0.2)" stroke-width="0.8"/>
        <rect x="11.5" y="6.5" width="5" height="4" rx="1" fill="rgba(255,255,255,0.42)"/>
        <rect x="10" y="16" width="8" height="1.5" fill="${c.tip}" opacity="0.85"/>
        <polygon points="10.5,17.5 17.5,17.5 15.5,22 12.5,22" fill="${c.tip}"/>
        <rect x="12.5" y="22" width="3" height="2.5" rx="0.5" fill="rgba(0,0,0,0.72)"/>
      </g>
    </svg>`;
    const encoded = encodeURIComponent(svg);
    // Hot-spot at ≈(6,21): the rotated nib tip position
    return `url("data:image/svg+xml,${encoded}") 6 21, text`;
  }

  let highlighterCursor = $derived(
    shareStore.selectionMode === 'highlight'
      ? buildHighlighterCursor(shareStore.selectedTextColor)
      : '',
  );

  $effect(() => {
    if (shareStore.selectionMode === 'highlight' && highlighterCursor) {
      document.body.style.setProperty('cursor', highlighterCursor, 'important');
    } else {
      document.body.style.removeProperty('cursor');
    }
    return () => document.body.style.removeProperty('cursor');
  });
  $effect(() => {
    document.body.classList.add('cv-share-active');
    return () => {
      document.body.classList.remove('cv-share-active');
    };
  });

  let isDragging = $state(false);
  let dragStart = $state<{ x: number; y: number } | null>(null);
  let dragCurrent = $state<{ x: number; y: number } | null>(null);
  let wasDragging = false;

  // Cache candidates when active to avoid repeated DOM queries
  let cachedCandidates: HTMLElement[] = [];

  let selectionBox = $derived.by(() => {
    if (!dragStart || !dragCurrent || !isDragging) return null;
    const left = Math.min(dragStart.x, dragCurrent.x);
    const top = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragCurrent.x - dragStart.x);
    const height = Math.abs(dragCurrent.y - dragStart.y);
    return { left, top, width, height };
  });

  /**
   * Handles window-level mouse hover events to identify and highlight shareable elements.
   */
  function handleHover(e: MouseEvent) {
    if (!shareStore.isActive || isDragging) return;

    const target = e.target as HTMLElement;

    // 1. If we are on the helper, toolbar, color picker, or annotation editor, do nothing
    if (
      target.closest('.hover-helper') ||
      target.closest('.floating-bar') ||
      target.closest('.cv-color-picker') ||
      target.closest('.cv-annotation-editor')
    ) {
      return;
    }

    // 2. Exclude by Tag/ID
    if (isOrHasExcludedParentElement(target)) return;

    // 3. Find nearest shareable
    const shareablePart = target.closest(SHAREABLE_SELECTOR);

    // If not on a shareable part, clear selection immediately
    if (!shareablePart) {
      shareStore.setHoverTarget(null);
      return;
    }

    const finalTarget = shareablePart as HTMLElement;

    // Check ancestors selection (level up logic)
    let parent = finalTarget.parentElement;
    let selectedAncestor: HTMLElement | null = null;
    while (parent) {
      if (shareStore.selectedElements.has(parent)) {
        selectedAncestor = parent;
        break;
      }
      parent = parent.parentElement;
    }

    if (selectedAncestor) {
      shareStore.setHoverTarget(selectedAncestor);
      return;
    }

    // New target
    if (isGenericWrapper(finalTarget)) {
      shareStore.setHoverTarget(null);
      return;
    }

    // Check selection is not child of current hover target
    if (shareStore.currentHoverTarget !== finalTarget) {
      if (shareStore.currentHoverTarget && shareStore.currentHoverTarget.contains(finalTarget)) {
        return;
      }

      shareStore.setHoverTarget(finalTarget);
    }
  }

  /**
   * Handles mouse down events to start a selection drag.
   */
  function handleMouseDown(e: MouseEvent) {
    if (!shareStore.isActive) return;

    // In highlight mode, do NOT intercept — let the browser handle native text selection
    if (shareStore.selectionMode === 'highlight') return;

    // Ignore clicks on UI
    const target = e.target as HTMLElement;
    if (
      target.closest('.floating-bar') ||
      target.closest('.hover-helper') ||
      target.closest('.cv-color-picker') ||
      target.closest('.cv-annotation-editor')
    )
      return;

    // Disable drag on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    // Prevent default browser text selection
    e.preventDefault();

    dragStart = { x: e.clientX, y: e.clientY };
    dragCurrent = { x: e.clientX, y: e.clientY };
    isDragging = false;
    wasDragging = false; // Ensure clean state
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragStart) return;

    dragCurrent = { x: e.clientX, y: e.clientY };

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (Math.hypot(dx, dy) > 12) {
      isDragging = true;
      shareStore.setHoverTarget(null); // Clear highlight on drag start
    }
  }

  function handleMouseUp() {
    if (shareStore.selectionMode === 'highlight') {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (range && !range.collapsed) {
          const mergedList = mergeSelectionWithExisting(
            range,
            shareStore.textHighlights,
            shareStore.selectedTextColor,
          );

          if (mergedList !== null) {
            // Update the store list
            shareStore.textHighlights = mergedList;

            // Apply the highlighted text styles to the screen instantly (without recipient annotation bubbles)
            textHighlightService.applyDescriptors(shareStore.textHighlights, true);
          }
        }
        // Remove native selection ranges to showcase Custom Highlight styling
        sel.removeAllRanges();
      }
      return;
    }

    if (isDragging && dragStart && dragCurrent) {
      // Perform selection logic
      const width = Math.abs(dragCurrent.x - dragStart.x);
      const height = Math.abs(dragCurrent.y - dragStart.y);

      // Optimization: Skip if drag area is too small (avoids accidental micro-selections)
      if (width < 10 || height < 10) {
        isDragging = false;
        dragStart = null;
        dragCurrent = null;
        return;
      }

      const left = Math.min(dragStart.x, dragCurrent.x);
      const top = Math.min(dragStart.y, dragCurrent.y);
      const right = left + width;
      const bottom = top + height;

      // Populate cache only if needed (lazy loading)
      if (cachedCandidates.length === 0) {
        cachedCandidates = Array.from(
          document.querySelectorAll(SHAREABLE_SELECTOR),
        ) as HTMLElement[];
      }

      const selected: HTMLElement[] = [];

      cachedCandidates.forEach((node) => {
        const el = node as HTMLElement;
        if (isOrHasExcludedParentElement(el)) return;

        const rect = el.getBoundingClientRect();
        // Check containment (element must be fully inside selection box)
        // AND check if it's not just a generic wrapper
        if (
          rect.left >= left &&
          rect.right <= right &&
          rect.top >= top &&
          rect.bottom <= bottom &&
          !isGenericWrapper(el)
        ) {
          selected.push(el);
        }
      });

      if (selected.length > 0) {
        shareStore.toggleMultipleElements(selected);
      }

      wasDragging = true;
    }

    isDragging = false;
    dragStart = null;
    dragCurrent = null;
  }

  function handleClick(e: MouseEvent) {
    // Don't intercept clicks in highlight mode — native text selection must work
    if (shareStore.selectionMode === 'highlight') return;

    if (wasDragging) {
      e.preventDefault();
      e.stopPropagation();
      wasDragging = false; // Synchronous reset
      return;
    }

    const target = e.target as HTMLElement;

    if (
      target.closest('.hover-helper') ||
      target.closest('.floating-bar') ||
      target.closest('.cv-color-picker') ||
      target.closest('.cv-annotation-editor')
    )
      return;

    // Intercept click on document
    e.preventDefault();
    e.stopPropagation();

    // If we have a hover target, toggle it
    const currentTarget = shareStore.currentHoverTarget;
    if (currentTarget) {
      shareStore.toggleElementSelection(currentTarget);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      shareStore.toggleActive(false);
    }
  }

  function isOrHasExcludedParentElement(el: HTMLElement): boolean {
    return isExcluded(el, excludedTagSet, excludedIdSet);
  }
</script>

<!-- https://svelte.dev/docs/svelte/svelte-window -->
<svelte:window
  on:mouseover={handleHover}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:click|capture={handleClick}
  on:keydown={handleKeydown}
/>

<div class="share-overlay-ui">
  <ShareToolbar />
  <HoverHelper />

  {#if shareStore.selectionMode === 'box'}
    {#each [...shareStore.selectedElements] as el (el)}
      <HighlightColorPicker element={el} />
      <HighlightAnnotationEditor
        getRect={() => el.getBoundingClientRect()}
        annotation={shareStore.boxAnnotations.get(el)?.text ?? ''}
        corner={shareStore.boxAnnotations.get(el)?.corner ?? DEFAULT_ANNOTATION_CORNER}
        onchange={(text, corner) => shareStore.setAnnotation(el, text, corner)}
      />
    {/each}
  {/if}

  {#if shareStore.selectionMode === 'highlight'}
    {#each shareStore.textHighlights as desc, i (i)}
      {@const resolvedRange = textHighlightService.getRange(i)}
      {#if resolvedRange}
        <HighlightAnnotationEditor
          getRect={() => textHighlightService.getAnchorRect(i) ?? new DOMRect()}
          annotation={desc.annotation ?? ''}
          corner={desc.annotationCorner ?? DEFAULT_ANNOTATION_CORNER}
          onchange={(text, corner) => shareStore.setTextHighlightAnnotation(i, text, corner)}
        />
      {/if}
    {/each}
  {/if}

  {#if selectionBox && shareStore.selectionMode !== 'highlight'}
    <div
      class="selection-box {shareStore.selectionMode === 'hide'
        ? 'hide-mode'
        : shareStore.selectionMode === 'box'
          ? 'box-mode'
          : ''}"
      style="left: {selectionBox.left}px; top: {selectionBox.top}px; width: {selectionBox.width}px; height: {selectionBox.height}px;"
    >
      <span class="selection-label">
        {shareStore.selectionMode === 'hide'
          ? 'Select to hide'
          : shareStore.selectionMode === 'box'
            ? 'Select to box'
            : 'Select to show'}
      </span>
    </div>
  {/if}
</div>

<style>
  /* Global styles injected when active */
  :global(body.cv-share-active) {
    cursor: default;
    user-select: none;
    -webkit-user-select: none;
  }

  /* Box target outlines */
  :global(.cv-box-target) {
    outline: 2px dashed #0078d4 !important;
    outline-offset: 2px;
    cursor: crosshair;
  }

  :global(.cv-share-selected) {
    outline: 3px solid #005a9e !important;
    outline-offset: 2px;
    background-color: rgba(0, 120, 212, 0.05);
  }

  :global(.cv-box-target-hide) {
    outline: 2px dashed #d13438 !important;
    outline-offset: 2px;
    cursor: crosshair;
  }

  :global(.cv-share-selected-hide) {
    outline: 3px solid #a4262c !important;
    outline-offset: 2px;
    background-color: rgba(209, 52, 56, 0.05);
  }

  :global(.cv-box-target-mode) {
    outline: 2px dashed #d97706 !important;
    outline-offset: 2px;
    cursor: crosshair;
  }

  :global(.cv-share-selected-box) {
    outline: 3px solid #b45309 !important;
    outline-offset: 2px;
    background-color: rgba(245, 158, 11, 0.05);
  }

  /* Text highlight mode — allow native text selection (cursor overridden inline per color) */
  :global(body.cv-share-active-highlight) {
    user-select: text !important;
    -webkit-user-select: text !important;
  }

  .selection-box {
    position: fixed;
    border: 1px solid rgba(0, 120, 212, 0.4);
    background-color: rgba(0, 120, 212, 0.1);
    pointer-events: none;
    z-index: 10000;
    box-sizing: border-box;
  }

  .selection-box.hide-mode {
    border: 1px solid rgba(209, 52, 56, 0.4);
    background-color: rgba(209, 52, 56, 0.1);
  }

  .selection-box.box-mode {
    border: 1px solid rgba(255, 140, 0, 0.6);
    background-color: rgba(255, 140, 0, 0.1);
  }

  .selection-label {
    position: absolute;
    top: -24px;
    left: 0;
    background: #0078d4;
    color: white;
    padding: 2px 6px;
    font-size: 11px;
    border-radius: 3px;
    white-space: nowrap;
    font-family: sans-serif;
    opacity: 0.9;
  }

  .hide-mode .selection-label {
    background: #d13438;
  }

  .box-mode .selection-label {
    background: #d97706;
  }
</style>
