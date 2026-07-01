<script lang="ts">
  import {
    type AnnotationCorner,
    ANNOTATION_PREVIEW_LENGTH,
    DEFAULT_ANNOTATION_CORNER,
  } from '$features/annotations/annotation-types';

  interface Props {
    annotation: string;
    annotationCorner?: AnnotationCorner | undefined;
    verticalOffset?: number;
  }

  let { annotation, annotationCorner, verticalOffset = 14 }: Props = $props();
  const corner = $derived(annotationCorner ?? DEFAULT_ANNOTATION_CORNER);
  const hasText = $derived(annotation.length > 0);
  const isShort = $derived(annotation.length <= ANNOTATION_PREVIEW_LENGTH);
  const isMultiLine = $derived(hasText && annotation.length > 16);
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

  function toggle() {
    if (isShort) return;
    expanded = !expanded;
  }

  function handleInteraction(e: Event) {
    e.stopPropagation();
    if (!isDragging) toggle();
  }



  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return; // Only left click

    const target = e.target as HTMLElement;
    const isRibbon = target.closest('.cv-annotation-ribbon') !== null;
    const isHeader = target.closest('.cv-card-header') !== null;
    const isCloseBtn = target.closest('.cv-card-close') !== null;

    if ((!isRibbon && !isHeader) || isCloseBtn) return;

    isPointerDown = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartOffsetX = dragOffsetX;
    dragStartOffsetY = dragOffsetY;

    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (!isPointerDown) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    if (!isDragging && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      isDragging = true;
    }

    if (isDragging) {
      dragOffsetX = dragStartOffsetX + dx;
      dragOffsetY = dragStartOffsetY + dy;
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (!isPointerDown) return;
    isPointerDown = false;

    const target = e.target as HTMLElement;
    try {
      if (target.hasPointerCapture && target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* ignore */
    }

    if (isDragging) {
      setTimeout(() => {
        isDragging = false;
      }, 50);
    }
  }

  // Cancel (e.g. touch interrupted by scroll) — reset all drag state cleanly.
  function onPointerCancel(e: PointerEvent) {
    if (!isPointerDown) return;
    isPointerDown = false;
    isDragging = false;

    const target = e.target as HTMLElement;
    try {
      if (target.hasPointerCapture && target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* ignore */
    }
  }

  /**
   * Returns CSS positioning based on the annotation corner.
   */
  function getPositionStyle(c: AnnotationCorner): string {
    switch (c) {
      case 'tr':
        return `top: -${verticalOffset}px; right: -14px;`;
      case 'bl':
        return `bottom: -${verticalOffset}px; left: -14px;`;
      case 'br':
        return `bottom: -${verticalOffset}px; right: -14px;`;
      case 'tl':
      default:
        return `top: -${verticalOffset}px; left: -14px;`;
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
  class="cv-annotation-container"
  class:cv-annotation-container--expanded={expanded}
  style="{getPositionStyle(corner)} transform: translate({dragOffsetX}px, {dragOffsetY}px);"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerCancel}
  role="presentation"
>
  {#if !expanded}
    <div
      class="cv-ribbon-wrapper"
      class:cv-ribbon-wrapper--intro={!introAnimationDone}
      class:cv-ribbon-wrapper--periodic={introAnimationDone}
      onanimationend={onIntroAnimationEnd}
    >
      <div
        class="cv-ribbon-shadow"
        class:cv-ribbon-shadow--empty={!hasText}
        style="clip-path: {getRibbonClipPath(corner)};"
        aria-hidden="true"
      ></div>
      <button
        type="button"
        class="cv-annotation-ribbon"
        class:cv-annotation-ribbon--empty={!hasText}
        class:cv-annotation-ribbon--right={isRightCorner}
        class:cv-annotation-ribbon--expandable={!isShort}
        class:cv-annotation-ribbon--multiline={isMultiLine}
        style="clip-path: {getRibbonClipPath(corner)};"
        onclick={handleInteraction}
        aria-label={hasText ? (isShort ? annotation : 'Expand annotation') : 'Annotation marker'}
        aria-expanded={isShort ? undefined : expanded}
      >
        {#if hasText}
          {#if isRightCorner}
            <!-- Right-corner: point is LEFT, flat side is RIGHT → grip goes last -->
            <span class="cv-ribbon-text cv-ribbon-text--right" class:cv-ribbon-text--multiline={isMultiLine}>
              {isShort ? annotation : annotation.slice(0, ANNOTATION_PREVIEW_LENGTH)}
            </span>
            {#if !isShort}
              <span class="cv-ribbon-chevron" class:cv-ribbon-chevron--bounce={introAnimationDone}
                >▾</span
              >
            {/if}
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
            <span class="cv-ribbon-text" class:cv-ribbon-text--multiline={isMultiLine}>
              {isShort ? annotation : annotation.slice(0, ANNOTATION_PREVIEW_LENGTH)}
            </span>
            {#if !isShort}
              <span class="cv-ribbon-chevron" class:cv-ribbon-chevron--bounce={introAnimationDone}
                >▾</span
              >
            {/if}
          {/if}
        {/if}
      </button>
    </div>
  {:else}
    <div class="cv-annotation-card" role="region" aria-label="Annotation">
      <button
        type="button"
        class="cv-card-close"
        onclick={handleInteraction}
        aria-label="Collapse annotation">✕</button
      >
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
    transition:
      opacity 0.2s ease,
      z-index 0s;
  }

  .cv-annotation-container:hover {
    opacity: 1;
    z-index: 110;
  }

  /* ==============================
     WRAPPER & SHADOW
     ============================== */
  .cv-ribbon-wrapper {
    position: relative;
    transform-origin: center center;
    width: max-content;
  }

  .cv-ribbon-wrapper--intro {
    animation: cv-wiggle-intro 0.75s ease-in-out forwards;
  }

  .cv-ribbon-wrapper--periodic {
    animation: cv-wiggle-periodic 5s ease-in-out infinite;
  }

  .cv-ribbon-shadow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.25);
    transform: translate(3px, 3px);
    pointer-events: none;
    z-index: -1;
  }
  .cv-ribbon-shadow--empty {
    width: 70px;
  }

  /* ==============================
     RIBBON (home-plate)
     ============================== */
  .cv-annotation-ribbon {
    border: none;
    padding: 6px 20px 6px 8px;
    width: 160px;
    min-height: 28px;
    height: auto;
    box-sizing: border-box;
    background: var(--cv-annotation-color, var(--cv-box-color));
    cursor: default;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
  }

  .cv-annotation-ribbon--right {
    padding: 6px 8px 6px 20px;
    justify-content: flex-end;
  }

  .cv-annotation-ribbon--multiline {
    padding: 4px 18px 4px 6px;
  }
  .cv-annotation-ribbon--multiline.cv-annotation-ribbon--right {
    padding: 4px 6px 4px 18px;
  }

  .cv-annotation-ribbon--empty {
    width: 70px;
    min-height: 28px;
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
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
    font-family: 'Segoe Print', 'Bradley Hand', 'Chilanka', cursive;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
    overflow: hidden;
    flex: 1;
    min-width: 0;
    color: var(--cv-annotation-text-color, #2c2c2c);
    text-align: left;
    word-break: break-word;
  }
  
  .cv-ribbon-text--multiline {
    font-size: 12px;
    line-height: 1.15;
  }

  .cv-ribbon-text--right {
    text-align: right;
  }

  .cv-ribbon-chevron {
    font-size: 22px;
    opacity: 1;
    flex-shrink: 0;
    line-height: 1;
    color: var(--cv-annotation-text-color, #2c2c2c);
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
    background: var(--cv-annotation-text-color, #2c2c2c);
  }

  /* ==============================
     CARD (sticky note)
     ============================== */
  .cv-annotation-card {
    background: #fffdf5;
    border: 1.5px solid var(--cv-annotation-color, var(--cv-box-color));
    border-radius: 4px;
    padding: 10px 12px;
    max-width: 280px;
    min-width: 120px;
    position: relative;
    z-index: 1;
    box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.25);
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
    0% {
      transform: rotate(0deg);
    }
    10% {
      transform: rotate(-6deg);
    }
    25% {
      transform: rotate(6deg);
    }
    40% {
      transform: rotate(-5deg);
    }
    55% {
      transform: rotate(5deg);
    }
    68% {
      transform: rotate(-3deg);
    }
    80% {
      transform: rotate(2.5deg);
    }
    90% {
      transform: rotate(-1deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes cv-wiggle-periodic {
    0%,
    85%,
    100% {
      transform: rotate(0deg);
    }
    87% {
      transform: rotate(1.2deg);
    }
    90% {
      transform: rotate(-1.2deg);
    }
    93% {
      transform: rotate(0.8deg);
    }
    96% {
      transform: rotate(-0.5deg);
    }
  }

  @keyframes cv-cardPop {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(5px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes cv-chevron-bounce {
    0%,
    70%,
    100% {
      transform: translateY(0);
    }
    78% {
      transform: translateY(-3px);
    }
    86% {
      transform: translateY(1px);
    }
    93% {
      transform: translateY(-1.5px);
    }
  }
</style>
