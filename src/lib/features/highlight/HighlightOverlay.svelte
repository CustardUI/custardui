<script lang="ts">
  import { type RectData } from '$features/highlight/services/highlight-types';
  import { HIGHLIGHT_COLORS, DEFAULT_COLOR_KEY } from '$features/highlight/services/highlight-colors';
  import HighlightTextAnnotation from '$features/highlight/HighlightTextAnnotation.svelte';

  interface Props {
    box: { rects: RectData[] };
  }

  let { box }: Props = $props();
  let rects = $derived(box.rects);

  function getColorHex(rect: RectData): string {
    const key = rect.color ?? DEFAULT_COLOR_KEY;
    return HIGHLIGHT_COLORS.find((c) => c.key === key)?.hex ?? HIGHLIGHT_COLORS[0]!.hex;
  }

  function scrollToRect(rect: RectData) {
    rect.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
</script>

<div class="cv-highlight-overlay">
  {#each rects as rect, i (rect.element)}
    <div
      class="cv-highlight-group"
      style="top: {rect.top}px; left: {rect.left}px; width: {rect.width}px; height: {rect.height}px; --cv-highlight-color: {getColorHex(rect)};"
    >
      <div class="cv-highlight-marker"></div>
      {#if rects.length > 1}
        <button
          type="button"
          class="cv-nav-arrow cv-nav-arrow--up"
          class:cv-nav-arrow--hidden={i === 0}
          onclick={() => scrollToRect(rects[i - 1]!)}
          aria-label="Previous highlight"
        >↑</button>
        <button
          type="button"
          class="cv-nav-arrow cv-nav-arrow--down"
          class:cv-nav-arrow--hidden={i === rects.length - 1}
          onclick={() => scrollToRect(rects[i + 1]!)}
          aria-label="Next highlight"
        >↓</button>
      {/if}
      <div class="cv-highlight-pill">
        <a href="https://custardui.js.org" target="_blank" rel="noopener noreferrer">
          Annotated by: CustardUI↗
        </a>
      </div>
      {#if rect.annotation}
        <HighlightTextAnnotation
          annotation={rect.annotation}
          annotationCorner={rect.annotationCorner}
        />
      {/if}
    </div>
  {/each}
</div>

<style>
  .cv-highlight-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 8000;
  }

  .cv-highlight-group {
    position: absolute;
    pointer-events: none;
  }

  .cv-highlight-marker {
    position: absolute;
    inset: 0;
    pointer-events: none;
    
    /* Marker Style */
    border: 3.5px solid var(--cv-highlight-color);
    border-radius: 200px 15px 225px 15px / 15px 225px 15px 255px;
    transform: rotate(-0.5deg);
    
    /* 3D INTERNAL VOLUME:
       Adds depth to the yellow border itself so it looks rounded.
    */
    box-shadow: 
      inset 0 1px 2px rgba(129, 73, 25, 0.2),
      inset 0 -1px 1px rgba(255, 255, 255, 0.7);

    /* 2A-3 DOUBLE LIGHT PROJECTION:
       Stacks multiple drop-shadows to cast into the box interior.
    */
    filter: 
      /* Sharp contact shadow for grounding */
      drop-shadow(0 2px 2px rgba(44, 26, 14, 0.15)) 
      /* Light Source A: Casts shadow from top-left to bottom-right */
      drop-shadow(-8px 12px 10px rgba(44, 26, 14, 0.12))
      /* Light Source B: Casts shadow from top-right to bottom-left */
      drop-shadow(8px 12px 10px rgba(44, 26, 14, 0.12));
    
    animation: highlightFadeIn 0.3s ease-out forwards;
  }

  .cv-nav-arrow {
    position: absolute;
    z-index: 10;
    right: -5px;
    pointer-events: auto;
    width: 14px;
    height: 14px;
    border-radius: 100px;
    border: 1px solid var(--cv-highlight-color);
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7px;
    color: #814919;
    font-weight: 700;
    font-family: ui-sans-serif, system-ui, sans-serif;
    line-height: 1;
    padding: 0;
    box-shadow: 0 4px 12px rgba(44, 26, 14, 0.15);
    opacity: 0.7;
  }

  .cv-nav-arrow:hover {
    opacity: 1;
  }

  .cv-nav-arrow--up {
    top: 0px;
  }

  .cv-nav-arrow--down {
    bottom: 0px;
  }

  .cv-nav-arrow--hidden {
    visibility: hidden;
    pointer-events: none;
  }

  .cv-highlight-pill {
    position: absolute;
    z-index: 10;
    bottom: -2px;
    right: 14px;
    background: white;
    height: 14px;
    padding: 0 8px;
    display: flex;
    align-items: center;
    
    border-radius: 100px;
    border: 1px solid var(--cv-highlight-color);
    pointer-events: auto;
    white-space: nowrap;
    
    /* Stronger shadow to match the frame's new altitude */
    box-shadow: 0 4px 12px rgba(44, 26, 14, 0.15);
  }

  .cv-highlight-pill a {
    font-size: 8px;
    font-weight: 700;
    color: #814919;
    text-decoration: none;
    font-family: ui-sans-serif, system-ui, sans-serif;
    line-height: 1;
  }

  .cv-highlight-pill:hover a {
    opacity: 0.8;
  }

  @keyframes highlightFadeIn {
    from { 
      opacity: 0; 
      transform: scale(0.98) rotate(-1deg); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) rotate(-0.5deg); 
    }
  }
</style>