<script lang="ts">
  /* eslint-disable @typescript-eslint/no-explicit-any */

  import { onMount, getContext } from 'svelte';
  import IconGear from '$lib/app/icons/IconGear.svelte';
  import { type IconSettingsStore, ICON_SETTINGS_CTX } from '$features/settings/stores/icon-settings-store.svelte';

  const iconSettingsStore = getContext<IconSettingsStore>(ICON_SETTINGS_CTX);

  let {
    position = 'middle-left',
    title = 'Customize View',
    pulse = false,
    onclick = undefined,
    iconColor = undefined,
    backgroundColor = undefined,
    opacity = undefined,
    scale = undefined,
  }: {
    position?:
      | 'top-right'
      | 'top-left'
      | 'bottom-right'
      | 'bottom-left'
      | 'middle-left'
      | 'middle-right';
    title?: string;
    pulse?: boolean;
    onclick?: () => void;
    iconColor?: string;
    backgroundColor?: string;
    opacity?: number;
    scale?: number;
  } = $props();

  // Constants
  const VIEWPORT_MARGIN = 10;
  const DRAG_THRESHOLD = 5;
  const PEEK_WIDTH = 20;

  let isDragging = $state(false);
  let dragStartY = 0;
  let dragStartOffset = 0;
  let currentOffset = $state(iconSettingsStore.offset);
  let suppressClick = false;

  const isRight = $derived(position?.includes('right') ?? false);
  const isCollapsed = $derived(iconSettingsStore.isCollapsed);

  let minOffset = -Infinity;
  let maxOffset = Infinity;

  let settingsIconElement: HTMLElement;

  onMount(() => {
    // Global event listeners to handle drag leaving the element
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', endDrag);
    window.addEventListener('resize', constrainPositionToViewport);

    // Initial check — defer to ensure layout is ready
    constCheckTimer = setTimeout(constrainPositionToViewport, 0);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', endDrag);
      window.removeEventListener('resize', constrainPositionToViewport);
      clearTimeout(constCheckTimer);
    };
  });

  let constCheckTimer: any;

  export function resetPosition() {
    currentOffset = 0;
    dragStartOffset = 0;
    iconSettingsStore.clearOffset();
  }

  function handleCollapse(e: MouseEvent) {
    e.stopPropagation(); // don't bubble to the icon's onclick
    iconSettingsStore.setCollapsed(true);
  }

  function handleCollapseKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      e.preventDefault();
      iconSettingsStore.setCollapsed(true);
    }
  }

  function constrainPositionToViewport() {
    if (!settingsIconElement) return;

    const rect = settingsIconElement.getBoundingClientRect();
    // Calculate "zero" position (where element would be if offset was 0)
    const zeroTop = rect.top - currentOffset;
    const elementHeight = rect.height;

    const min = VIEWPORT_MARGIN - zeroTop;
    const max = window.innerHeight - VIEWPORT_MARGIN - zeroTop - elementHeight;

    // Clamp
    const clamped = Math.max(min, Math.min(max, currentOffset));

    if (clamped !== currentOffset) {
      currentOffset = clamped;
      savePosition();
    }
  }

  function onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    if (isCollapsed) return; // strip click expands via onClick; don't start drag
    startDrag(e.clientY);
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    // First tap on a peeking icon just reveals it without starting a drag
    if (isCollapsed) {
      iconSettingsStore.setCollapsed(false);
      e.preventDefault();
      return;
    }
    startDrag(e.touches[0]!.clientY);
  }

  function startDrag(clientY: number) {
    iconSettingsStore.setCollapsed(false);
    isDragging = true;
    dragStartY = clientY;
    dragStartOffset = currentOffset;
    suppressClick = false;

    calculateDragConstraints();
  }

  function calculateDragConstraints() {
    if (!settingsIconElement) return;

    const rect = settingsIconElement.getBoundingClientRect();
    const zeroTop = rect.top - currentOffset;
    const elementHeight = rect.height;

    // We want the element to stay within [VIEWPORT_MARGIN, window.innerHeight - VIEWPORT_MARGIN]
    minOffset = VIEWPORT_MARGIN - zeroTop;
    maxOffset = window.innerHeight - VIEWPORT_MARGIN - zeroTop - elementHeight;
  }

  function handleDragMove(e: MouseEvent | TouchEvent) {
    if (!isDragging) return;

    const clientY = getClientY(e);
    if (clientY === null) return;

    const deltaY = clientY - dragStartY;
    const rawOffset = dragStartOffset + deltaY;

    // Clamp the offset to keep element on screen
    currentOffset = Math.max(minOffset, Math.min(maxOffset, rawOffset));

    if (Math.abs(deltaY) > DRAG_THRESHOLD) {
      suppressClick = true;
    }
  }

  function getClientY(e: MouseEvent | TouchEvent): number | null {
    if (window.TouchEvent && e instanceof TouchEvent && e.touches.length > 0) {
      return e.touches[0]!.clientY;
    } else if (e instanceof MouseEvent) {
      return e.clientY;
    }
    return null;
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    savePosition();
  }

  function savePosition() {
    iconSettingsStore.setOffset(currentOffset);
  }

  function onClick(e: MouseEvent) {
    if (isCollapsed) {
      iconSettingsStore.setCollapsed(false);
      return;
    }
    if (suppressClick) {
      e.stopImmediatePropagation();
      e.preventDefault();
      suppressClick = false;
      return;
    }
    if (onclick) onclick();
  }

  // Key handler for accessibility
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isCollapsed) {
        iconSettingsStore.setCollapsed(false);
        return;
      }
      if (onclick) onclick();
    }
  }

  // Helper for transforms
  function getTransform(pos: string | undefined, offset: number, s: number | undefined, collapsed: boolean) {
    const isMiddle = pos && pos.includes('middle');
    const isRight = pos && pos.includes('right');
    let t = '';

    if (collapsed) {
      t = isRight
        ? `translateX(calc(100% - ${PEEK_WIDTH}px)) `
        : `translateX(calc(-100% + ${PEEK_WIDTH}px)) `;
    }

    if (isMiddle) {
      t += `translateY(calc(-50% + ${offset}px))`;
    } else {
      t += `translateY(${offset}px)`;
    }

    if (s && s !== 1) {
      t += ` scale(${s})`;
    }
    return t;
  }
</script>

<div
  bind:this={settingsIconElement}
  class="cv-settings-icon cv-settings-{position} {pulse ? 'cv-pulse' : ''}"
  class:cv-is-dragging={isDragging}
  class:cv-is-collapsed={isCollapsed}
  {title}
  role="button"
  tabindex="0"
  aria-label={isCollapsed ? 'Expand settings' : 'Open Custom Views Settings'}
  onmousedown={onMouseDown}
  ontouchstart={onTouchStart}
  onclick={onClick}
  onkeydown={onKeyDown}
  style:--cv-icon-color={iconColor}
  style:--cv-icon-bg={backgroundColor}
  style:--cv-icon-opacity={opacity}
  style:transform={getTransform(position, currentOffset, scale, isCollapsed)}
  style:cursor={isDragging ? 'grabbing' : isCollapsed ? 'pointer' : 'grab'}
>
  <span class="cv-gear"><IconGear /></span>

  <!-- Collapse tab: outer (screen-edge) side, always visible -->
  <button
    class="cv-collapse-btn"
    data-side={isRight ? 'right' : 'left'}
    onclick={handleCollapse}
    onkeydown={handleCollapseKeydown}
    aria-label="Collapse settings icon"
  >{isRight ? '›' : '‹'}</button>

  <!-- Dismiss button: shown above peek strip when collapsed -->
  {#if isCollapsed}
    <button
      class="cv-dismiss-btn"
      data-side={isRight ? 'left' : 'right'}
      onclick={(e) => { e.stopPropagation(); iconSettingsStore.dismiss(); }}
      aria-label="Dismiss settings icon"
    >✕</button>
  {/if}

</div>

<style>
  .cv-gear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
  }

  .cv-gear :global(svg) {
    width: 18px;
    height: 18px;
  }

  .cv-gear :global(svg path) {
    fill: currentColor;
  }

  .cv-settings-icon {
    position: fixed;
    background: var(--cv-icon-bg, rgba(255, 255, 255, 0.92));
    color: var(--cv-icon-color, rgba(0, 0, 0, 0.9));
    opacity: var(--cv-icon-opacity, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    cursor: grab; /* Default cursor */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 2px solid rgba(0, 0, 0, 0.2);
    z-index: 9998;
    transition:
      width 0.3s ease,
      background 0.3s ease,
      color 0.3s ease,
      opacity 0.3s ease,
      border-color 0.3s ease,
      transform 0.4s ease; /* transform transition drives the peek slide animation */
    touch-action: none; /* Crucial for touch dragging */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-sizing: border-box;
    user-select: none; /* Prevent text selection while dragging */
  }

  .cv-settings-icon:active {
    cursor: grabbing;
  }

  .cv-settings-icon:hover {
    background: var(--cv-icon-bg, rgba(255, 255, 255, 1));
    color: var(--cv-icon-color, rgba(0, 0, 0, 1));
    opacity: 1;
    border-color: rgba(0, 0, 0, 0.3);
  }

  /* Remove transform transition during drag so it tracks the pointer without lag */
  .cv-settings-icon.cv-is-dragging {
    transition:
      width 0.3s ease,
      background 0.3s ease,
      color 0.3s ease,
      opacity 0.3s ease,
      border-color 0.3s ease;
  }

  /* When collapsed, dim the strip */
  .cv-settings-icon.cv-is-collapsed {
    opacity: 0.5;
  }

  .cv-settings-icon.cv-is-collapsed:hover {
    opacity: 0.85;
  }

  .cv-collapse-btn {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.12);
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 13px;
    line-height: 1;
    color: inherit;
    opacity: 0.5;
    transition: opacity 0.15s ease, background 0.15s ease;
  }

  .cv-collapse-btn[data-side='left'] {
    left: 0; /* outer = screen-edge side for left icons */
    border-radius: 0 6px 6px 0;
  }

  .cv-collapse-btn[data-side='right'] {
    right: 0; /* outer = screen-edge side for right icons */
    border-radius: 6px 0 0 6px;
  }

  .cv-collapse-btn:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.22);
  }

  /* Hide collapse tab when already collapsed */
  .cv-settings-icon.cv-is-collapsed .cv-collapse-btn {
    display: none;
  }

  .cv-dismiss-btn {
    position: absolute;
    bottom: calc(100% + 4px);
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.15);
    border: none;
    border-radius: 50%;
    padding: 0;
    cursor: pointer;
    font-size: 9px;
    line-height: 1;
    color: inherit;
    opacity: 0.5;
    transition: opacity 0.15s ease, background 0.15s ease;
  }

  .cv-dismiss-btn[data-side='left'] { left: 0; }
  .cv-dismiss-btn[data-side='right'] { right: 0; }

  .cv-dismiss-btn:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.25);
  }


  /* Top-right */
  .cv-settings-top-right {
    top: 20px;
    right: 0;
    border-radius: 18px 0 0 18px;
    padding-left: 6px;
    justify-content: flex-start;
    border-right: none;
  }

  /* Top-left */
  .cv-settings-top-left {
    top: 20px;
    left: 0;
    border-radius: 0 18px 18px 0;
    padding-right: 6px;
    justify-content: flex-end;
    border-left: none;
  }

  /* Bottom-right */
  .cv-settings-bottom-right {
    bottom: 20px;
    right: 0;
    border-radius: 18px 0 0 18px;
    padding-left: 6px;
    justify-content: flex-start;
    border-right: none;
  }

  /* Bottom-left */
  .cv-settings-bottom-left {
    bottom: 20px;
    left: 0;
    border-radius: 0 18px 18px 0;
    padding-right: 6px;
    justify-content: flex-end;
    border-left: none;
  }

  /* Middle-left */
  .cv-settings-middle-left {
    top: 50%;
    left: 0;
    /* transform handled by inline style now */
    border-radius: 0 18px 18px 0;
    padding-right: 6px;
    justify-content: flex-end;
    border-left: none;
  }

  /* Middle-right */
  .cv-settings-middle-right {
    top: 50%;
    right: 0;
    /* transform handled by inline style now */
    border-radius: 18px 0 0 18px;
    padding-left: 6px;
    justify-content: flex-start;
    border-right: none;
  }

  .cv-settings-top-right,
  .cv-settings-middle-right,
  .cv-settings-bottom-right,
  .cv-settings-top-left,
  .cv-settings-middle-left,
  .cv-settings-bottom-left {
    height: 36px;
    width: 36px;
  }

  .cv-settings-middle-right:hover,
  .cv-settings-top-right:hover,
  .cv-settings-bottom-right:hover,
  .cv-settings-top-left:hover,
  .cv-settings-middle-left:hover,
  .cv-settings-bottom-left:hover {
    width: 55px;
  }

  :global(.cv-pulse) {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.15),
        0 0 0 0 rgba(62, 132, 244, 0.7);
    }
    70% {
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.15),
        0 0 0 10px rgba(62, 132, 244, 0);
    }
    100% {
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.15),
        0 0 0 0 rgba(62, 132, 244, 0);
    }
  }

  @media (max-width: 768px) {
    .cv-settings-top-right,
    .cv-settings-top-left {
      top: 10px;
    }

    .cv-settings-bottom-right,
    .cv-settings-bottom-left {
      bottom: 10px;
    }

    .cv-settings-top-right,
    .cv-settings-bottom-right,
    .cv-settings-middle-right {
      right: 0;
    }

    .cv-settings-top-left,
    .cv-settings-bottom-left,
    .cv-settings-middle-left {
      left: 0;
    }

    .cv-settings-icon {
      width: 60px;
      height: 32px;
    }

    .cv-settings-icon:hover {
      width: 75px;
    }
  }

  @media print {
    .cv-settings-icon {
      display: none !important;
    }
  }
</style>
