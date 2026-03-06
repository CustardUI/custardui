<script lang="ts">
  import { shareStore } from '$features/share/stores/share-store.svelte';
  import {
    HIGHLIGHT_COLORS,
    DEFAULT_COLOR_KEY,
    type HighlightColorKey,
  } from '$features/highlight/services/highlight-colors';

  let { element }: { element: HTMLElement } = $props();

  let isExpanded = $state(false);
  let rect = $state({ top: 0, left: 0, width: 0 });

  $effect(() => {
    rect = element.getBoundingClientRect();
    const update = () => {
      rect = element.getBoundingClientRect();
    };
    window.addEventListener('scroll', update, { capture: true, passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update, { capture: true });
      window.removeEventListener('resize', update);
      if (clickTimer) clearTimeout(clickTimer);
    };
  });

  let currentColorKey = $derived(shareStore.highlightColors.get(element) ?? DEFAULT_COLOR_KEY);
  let currentHex = $derived(
    HIGHLIGHT_COLORS.find((c) => c.key === currentColorKey)?.hex ?? HIGHLIGHT_COLORS[0]!.hex,
  );

  let clickTimer: ReturnType<typeof setTimeout> | null = null;

  function handleTriggerClick(e: MouseEvent) {
    e.stopPropagation();
    isExpanded = !isExpanded;
  }

  function handleSwatchClick(e: MouseEvent, key: HighlightColorKey) {
    e.stopPropagation();
    if (clickTimer) return; // defer to potential dblclick
    clickTimer = setTimeout(() => {
      clickTimer = null;
      shareStore.setHighlightColor(element, key);
      isExpanded = false;
    }, 220);
  }

  function handleSwatchDblClick(e: MouseEvent, key: HighlightColorKey) {
    e.stopPropagation();
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }
    shareStore.setAllHighlightColors(key);
    isExpanded = false;
  }

  let centerX = $derived(rect.left + rect.width / 2);
  let topY = $derived(rect.top);
</script>

<div
  class="cv-color-picker"
  style="left: {centerX}px; top: {topY}px;"
  role="none"
>
  <button
    class="cv-color-trigger"
    onclick={handleTriggerClick}
    title="Choose highlight color"
    aria-label="Choose highlight color"
    aria-expanded={isExpanded}
  >
    <span class="cv-color-dot" style="background: {currentHex};"></span>
  </button>
  {#if isExpanded}
    <div class="cv-color-swatches" role="none">
      {#each HIGHLIGHT_COLORS as color}
        <button
          class="cv-color-swatch"
          class:active={currentColorKey === color.key}
          style="background: {color.hex};"
          onclick={(e) => handleSwatchClick(e, color.key)}
          ondblclick={(e) => handleSwatchDblClick(e, color.key)}
          title="{color.label} · dbl-click to apply to all"
          aria-label={color.label}
          aria-pressed={currentColorKey === color.key}
        ></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cv-color-picker {
    position: fixed;
    transform: translateX(-50%) translateY(-100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    pointer-events: auto;
    z-index: 9500;
    /* Nudge down so the trigger peeks above the element edge */
    margin-top: 8px;
  }

  .cv-color-trigger {
    width: 22px;
    height: 16px;
    border-radius: 100px;
    border: 1.5px solid rgba(0, 0, 0, 0.18);
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: box-shadow 0.15s;
  }

  .cv-color-trigger:hover {
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.22);
  }

  .cv-color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: block;
    border: 1px solid rgba(0, 0, 0, 0.12);
  }

  .cv-color-swatches {
    display: flex;
    flex-direction: row;
    gap: 4px;
    background: white;
    border-radius: 100px;
    padding: 4px 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .cv-color-swatch {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    transition: transform 0.1s, border-color 0.1s;
  }

  .cv-color-swatch:hover {
    transform: scale(1.2);
    border-color: rgba(0, 0, 0, 0.3);
  }

  .cv-color-swatch.active {
    border-color: rgba(0, 0, 0, 0.5);
    transform: scale(1.15);
  }
</style>
