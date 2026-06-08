<script lang="ts">
  import {
    type AnnotationCorner,
    DEFAULT_ANNOTATION_CORNER,
  } from '$features/annotations/annotation-types';

  interface Props {
    annotationCorner?: AnnotationCorner | undefined;
  }

  let { annotationCorner }: Props = $props();
  const corner = $derived(annotationCorner ?? DEFAULT_ANNOTATION_CORNER);
  const isRightCorner = $derived(corner === 'tr' || corner === 'br');

  let dismissed = $state(false);
  let introAnimationDone = $state(false);

  function onIntroAnimationEnd(e: AnimationEvent) {
    if (e.target !== e.currentTarget) return;
    introAnimationDone = true;
  }

  function getPositionStyle(c: AnnotationCorner): string {
    switch (c) {
      case 'tr':
        return 'top: -14px; right: -14px;';
      case 'bl':
        return 'bottom: -14px; left: -14px;';
      case 'br':
        return 'bottom: -14px; right: -14px;';
      case 'tl':
      default:
        return 'top: -14px; left: -14px;';
    }
  }

  function getRibbonClipPath(c: AnnotationCorner): string {
    const pointsRight = c === 'tl' || c === 'bl';
    if (pointsRight) {
      return 'polygon(0% 0%, 80% 0%, 100% 50%, 80% 100%, 0% 100%)';
    } else {
      return 'polygon(20% 0%, 100% 0%, 100% 100%, 20% 100%, 0% 50%)';
    }
  }

  // Position the dismiss button at the outermost corner of the container (furthest from the box).
  function getDismissStyle(c: AnnotationCorner): string {
    switch (c) {
      case 'tr':
        return 'top: -5px; right: -5px;';
      case 'bl':
        return 'bottom: -5px; left: -5px;';
      case 'br':
        return 'bottom: -5px; right: -5px;';
      case 'tl':
      default:
        return 'top: -5px; left: -5px;';
    }
  }
</script>

{#if !dismissed}
  <div class="cv-annotation-container" style={getPositionStyle(corner)}>
    <div
      class="cv-ribbon-wrapper"
      class:cv-ribbon-wrapper--intro={!introAnimationDone}
      class:cv-ribbon-wrapper--periodic={introAnimationDone}
      onanimationend={onIntroAnimationEnd}
    >
      <div
        class="cv-ribbon-shadow"
        style="clip-path: {getRibbonClipPath(corner)};"
        aria-hidden="true"
      ></div>
      <div
        class="cv-empty-ribbon"
        class:cv-empty-ribbon--right={isRightCorner}
        style="clip-path: {getRibbonClipPath(corner)};"
        role="img"
        aria-label="Annotation marker"
      ></div>
    </div>
    <button
      type="button"
      class="cv-empty-dismiss"
      style={getDismissStyle(corner)}
      onclick={() => (dismissed = true)}
      aria-label="Dismiss marker">✕</button
    >
  </div>
{/if}

<style>
  .cv-annotation-container {
    position: absolute;
    z-index: 100;
    pointer-events: auto;
    touch-action: none;
    user-select: none;
    opacity: 0.95;
    transition:
      opacity 0.2s ease,
      z-index 0s;
  }

  .cv-annotation-container:hover {
    opacity: 1;
    z-index: 110;
  }

  .cv-ribbon-wrapper {
    position: relative;
    transform-origin: center center;
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
    width: 70px;
    height: 28px;
    background: rgba(0, 0, 0, 0.25);
    transform: rotate(-3deg) translate(1px, 4px);
    pointer-events: none;
    z-index: -1;
  }

  .cv-empty-ribbon {
    width: 70px;
    height: 28px;
    box-sizing: border-box;
    background: var(--cv-annotation-color, var(--cv-box-color));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
    padding: 5px 22px 5px 10px;
    opacity: 0.95;
    transition: opacity 0.2s ease;
  }

  .cv-annotation-container:hover .cv-empty-ribbon {
    opacity: 1;
  }

  .cv-empty-ribbon--right {
    padding: 5px 10px 5px 22px;
  }

  /* Dismiss button — hidden until container is hovered */
  .cv-empty-dismiss {
    position: absolute;
    border: none;
    background: rgba(100, 100, 100, 0.55);
    color: #fff;
    font-size: 8px;
    cursor: pointer;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    opacity: 0;
    pointer-events: none;
    transition:
      opacity 0.15s ease,
      background 0.15s ease,
      color 0.15s ease;
  }

  .cv-annotation-container:hover .cv-empty-dismiss {
    opacity: 1;
    pointer-events: auto;
  }

  .cv-empty-dismiss:hover {
    background: rgba(80, 80, 80, 0.8);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.28);
  }

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
</style>
