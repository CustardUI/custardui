<script lang="ts">
  import { type AnnotationCorner, ANNOTATION_PREVIEW_LENGTH, DEFAULT_ANNOTATION_CORNER } from '$features/highlight/services/highlight-annotations';

  interface Props {
    annotation: string;
    annotationCorner?: AnnotationCorner | undefined;
  }

  let { annotation, annotationCorner }: Props = $props();
  const corner = $derived(annotationCorner ?? DEFAULT_ANNOTATION_CORNER);
  const hasText = $derived(annotation.length > 0);
  const isShort = $derived(annotation.length <= ANNOTATION_PREVIEW_LENGTH);
  const isRightCorner = $derived(corner === 'tr' || corner === 'br');

  let expanded = $state(false);

  // --- Intro wiggle state ---
  let introAnimationDone = $state(false);

  function onIntroAnimationEnd(e: AnimationEvent) {
    if (e.target !== e.currentTarget) return;
    introAnimationDone = true;
  }

  // --- Drag-to-move state ---
  let dragOffsetX = $state(0);
  let dragOffsetY = $state(0);
  let isDragging = false;
  let isPointerDown = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartOffsetX = 0;
  let dragStartOffsetY = 0;
  let containerEl: HTMLElement;

  function toggle() {
    if (isShort) return;
    expanded = !expanded;
  }

  function handleInteraction(e: Event) {
    e.stopPropagation();
    if (!isDragging) toggle();
  }

  function onPointerDown(e: PointerEvent) {
    // Only initiate drag when the pointer starts on the grip handle.
    if (!(e.target as HTMLElement).closest('.cv-ribbon-grip')) return;

    isPointerDown = true;
    isDragging = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartOffsetX = dragOffsetX;
    dragStartOffsetY = dragOffsetY;
  }

  // Hard clamp so the element can never leave the viewport.
  function clampToViewport(newX: number, newY: number): { x: number; y: number } {
    if (!containerEl) return { x: newX, y: newY };
    const rect = containerEl.getBoundingClientRect();
    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const origLeft = rect.left - dragOffsetX;
    const origTop = rect.top - dragOffsetY;

    const newLeft = origLeft + newX;
    const newTop = origTop + newY;

    let x = newX;
    let y = newY;
    if (newLeft < pad) x += pad - newLeft;
    if (newLeft + rect.width > vw - pad) x -= (newLeft + rect.width) - (vw - pad);
    if (newTop < pad) y += pad - newTop;
    if (newTop + rect.height > vh - pad) y -= (newTop + rect.height) - (vh - pad);
    return { x, y };
  }

  function onPointerMove(e: PointerEvent) {
    if (!isPointerDown) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    if (!isDragging && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      isDragging = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    if (isDragging) {
      const rawX = dragStartOffsetX + dx;
      const rawY = dragStartOffsetY + dy;
      const clamped = clampToViewport(rawX, rawY);
      dragOffsetX = clamped.x;
      dragOffsetY = clamped.y;
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (!isPointerDown) return;
    isPointerDown = false;

    if (isDragging) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      setTimeout(() => { isDragging = false; }, 50);
    }
  }

  // Cancel (e.g. touch interrupted by scroll) — reset all drag state cleanly.
  function onPointerCancel(_e: PointerEvent) {
    isPointerDown = false;
    isDragging = false;
  }

  // Nudge annotation back in-bounds when the viewport shrinks.
  $effect(() => {
    function onResize() {
      const clamped = clampToViewport(dragOffsetX, dragOffsetY);
      dragOffsetX = clamped.x;
      dragOffsetY = clamped.y;
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  /**
   * Returns CSS positioning based on the annotation corner.
   */
  function getPositionStyle(c: AnnotationCorner): string {
    switch (c) {
      case 'tr': return 'top: -6px; right: -6px;';
      case 'bl': return 'bottom: -6px; left: -6px;';
      case 'br': return 'bottom: -6px; right: -6px;';
      case 'tl':
      default:
        return 'top: -6px; left: -6px;';
    }
  }

  /**
   * Returns the ribbon clip-path. The point faces inward toward the content.
   */
  function getRibbonClipPath(c: AnnotationCorner): string {
    const pointsRight = c === 'tl' || c === 'bl';
    if (pointsRight) {
      return 'polygon(0% 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 0% 100%)';
    } else {
      return 'polygon(14px 0%, 100% 0%, 100% 100%, 14px 100%, 0% 50%)';
    }
  }
</script>

<div
  bind:this={containerEl}
  class="cv-annotation-container"
  class:cv-annotation-container--expanded={expanded}
  style="{getPositionStyle(corner)} transform: translate({dragOffsetX}px, {dragOffsetY}px);"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerCancel}
>
  {#if !expanded}
    <button
      type="button"
      class="cv-annotation-ribbon"
      class:cv-annotation-ribbon--empty={!hasText}
      class:cv-annotation-ribbon--right={isRightCorner}
      class:cv-annotation-ribbon--expandable={!isShort}
      class:cv-annotation-ribbon--intro={!introAnimationDone}
      class:cv-annotation-ribbon--periodic={introAnimationDone}
      style="clip-path: {getRibbonClipPath(corner)};"
      onclick={handleInteraction}
      onanimationend={onIntroAnimationEnd}
      aria-label={hasText ? (isShort ? annotation : 'Expand annotation') : 'Annotation marker'}
      aria-expanded={isShort ? undefined : expanded}
    >
      {#if hasText}
        {#if isRightCorner}
          <!-- Right-corner: point is LEFT, flat side is RIGHT → grip goes last -->
          {#if !isShort}
            <span class="cv-ribbon-chevron" class:cv-ribbon-chevron--bounce={introAnimationDone}>▾</span>
          {/if}
          <span class="cv-ribbon-text cv-ribbon-text--right">
            {isShort ? annotation : annotation.slice(0, ANNOTATION_PREVIEW_LENGTH) + '…'}
          </span>
          <span class="cv-ribbon-grip" aria-hidden="true">
            <span></span><span></span>
            <span></span><span></span>
            <span></span><span></span>
          </span>
        {:else}
          <!-- Left-corner: point is RIGHT, flat side is LEFT → grip goes first -->
          <span class="cv-ribbon-grip" aria-hidden="true">
            <span></span><span></span>
            <span></span><span></span>
            <span></span><span></span>
          </span>
          <span class="cv-ribbon-text">
            {isShort ? annotation : annotation.slice(0, ANNOTATION_PREVIEW_LENGTH) + '…'}
          </span>
          {#if !isShort}
            <span class="cv-ribbon-chevron" class:cv-ribbon-chevron--bounce={introAnimationDone}>▾</span>
          {/if}
        {/if}
      {/if}
    </button>
  {:else}
    <div
      class="cv-annotation-card"
      role="region"
      aria-label="Annotation"
    >
      <button
        type="button"
        class="cv-card-close"
        onclick={handleInteraction}
        aria-label="Collapse annotation"
      >✕</button>
      <span class="cv-card-text">{annotation}</span>
    </div>
  {/if}
</div>

<style>
  /* ==============================
     CONTAINER (position, drag, opacity)
     ============================== */
  .cv-annotation-container {
    position: absolute;
    z-index: 100;
    pointer-events: auto;
    touch-action: none;
    user-select: none;
    cursor: default;
    opacity: 0.88;
    transition: opacity 0.2s ease, z-index 0s;
  }

  .cv-annotation-container:hover {
    opacity: 1;
    z-index: 110;
  }

  /* ==============================
     RIBBON (home-plate)
     ============================== */
  .cv-annotation-ribbon {
    border: none;
    padding: 6px 20px 6px 8px;
    min-width: 28px;
    min-height: 24px;
    background: var(--cv-highlight-color);
    cursor: default;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;

    transform-origin: center center;
  }

  .cv-annotation-ribbon--intro {
    animation: cv-wiggle-intro 0.75s ease-in-out forwards;
  }

  .cv-annotation-ribbon--periodic {
    animation: cv-wiggle-periodic 5s ease-in-out infinite;
  }

  .cv-annotation-ribbon--right {
    padding: 6px 8px 6px 20px;
    justify-content: flex-end;
  }

  .cv-annotation-ribbon--empty {
    min-width: 24px;
    padding: 6px 16px 6px 8px;
  }

  .cv-annotation-ribbon--expandable {
    cursor: pointer;
  }

  .cv-annotation-ribbon--expandable:hover {
    filter: brightness(1.1);
  }

  /* ==============================
     RIBBON TEXT (single line)
     ============================== */
  .cv-ribbon-text {
    display: block;
    font-family: 'Segoe Print', 'Bradley Hand', 'Chilanka', cursive;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  }

  .cv-ribbon-text--right {
    text-align: right;
  }

  .cv-ribbon-chevron {
    font-size: 22px;
    opacity: 1;
    flex-shrink: 0;
    line-height: 1;
    color: #fff;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  }

  .cv-ribbon-chevron--bounce {
    animation: cv-chevron-bounce 3s ease-in-out infinite;
  }

  /* ==============================
     DRAG GRIP (6-dot grid on flat side)
     ============================== */
  .cv-ribbon-grip {
    display: grid;
    grid-template-columns: repeat(2, 3px);
    gap: 3px;
    flex-shrink: 0;
    opacity: 0.7;
    cursor: grab;
    padding: 2px;
  }

  .cv-ribbon-grip:active {
    cursor: grabbing;
  }

  .cv-ribbon-grip > span {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.4);
  }

  /* ==============================
     CARD (sticky note)
     ============================== */
  .cv-annotation-card {
    background: #FFFDF5;
    border: 1.5px solid var(--cv-highlight-color);
    border-radius: 4px;
    padding: 10px 12px;
    max-width: 280px;
    min-width: 120px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
    position: relative;
    animation: cv-cardPop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  .cv-card-close {
    position: absolute;
    top: 3px;
    right: 5px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 12px;
    color: #aaa;
    padding: 2px 4px;
    line-height: 1;
    font-family: sans-serif;
  }

  .cv-card-close:hover {
    color: #555;
  }

  .cv-card-text {
    display: block;
    font-family: 'Segoe Print', 'Bradley Hand', 'Chilanka', cursive;
    font-size: 13px;
    font-weight: 600;
    color: #333;
    line-height: 1.45;
    word-break: break-word;
    white-space: pre-wrap;
    padding-right: 15px;
  }

  /* ==============================
     ANIMATIONS
     ============================== */
  @keyframes cv-wiggle-intro {
    0%   { transform: rotate(0deg); }
    10%  { transform: rotate(-6deg); }
    25%  { transform: rotate(6deg); }
    40%  { transform: rotate(-5deg); }
    55%  { transform: rotate(5deg); }
    68%  { transform: rotate(-3deg); }
    80%  { transform: rotate(2.5deg); }
    90%  { transform: rotate(-1deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes cv-wiggle-periodic {
    0%, 85%, 100% { transform: rotate(0deg); }
    87% { transform: rotate(1.2deg); }
    90% { transform: rotate(-1.2deg); }
    93% { transform: rotate(0.8deg); }
    96% { transform: rotate(-0.5deg); }
  }

  @keyframes cv-cardPop {
    from { opacity: 0; transform: scale(0.9) translateY(5px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes cv-chevron-bounce {
    0%, 70%, 100% { transform: translateY(0); }
    78%           { transform: translateY(-3px); }
    86%           { transform: translateY(1px); }
    93%           { transform: translateY(-1.5px); }
  }
</style>
