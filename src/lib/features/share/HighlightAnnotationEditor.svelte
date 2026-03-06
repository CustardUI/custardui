<script lang="ts">
  import { shareStore } from '$features/share/stores/share-store.svelte';
  import {
    DEFAULT_ANNOTATION_CORNER,
    MAX_ANNOTATION_LENGTH,
    ANNOTATION_PREVIEW_LENGTH,
    CORNER_ICONS,
    type AnnotationCorner,
  } from '$features/highlight/services/highlight-annotations';

  let { element }: { element: HTMLElement } = $props();

  let isExpanded = $state(false);
  let rect = $state({ top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 });

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
    };
  });

  let localText = $state('');
  let localCorner = $state<AnnotationCorner>(DEFAULT_ANNOTATION_CORNER);

  // Initialize from store when element changes (or annotation changes externally)
  $effect.pre(() => {
    const ann = shareStore.highlightAnnotations.get(element);
    const newText = ann?.text ?? '';
    const newCorner = ann?.corner ?? DEFAULT_ANNOTATION_CORNER;

    if (localText !== newText) {
      localText = newText;
    }
    if (localCorner !== newCorner) {
      localCorner = newCorner;
    }
  });

  function handleInput(e: Event) {
    const value = (e.target as HTMLTextAreaElement).value;
    localText = value;
    shareStore.setAnnotation(element, value, localCorner);
  }

  function setCorner(c: AnnotationCorner) {
    localCorner = c;
    shareStore.setAnnotation(element, localText, c);
  }

  function handleTabClick(e: MouseEvent) {
    e.stopPropagation();
    isExpanded = !isExpanded;
  }


  let tabStyle = $derived.by(() => {
    switch (localCorner) {
      case 'tl':
        return `top: ${rect.top}px; left: ${rect.left}px; transform: translateY(-100%);`;
      case 'tr':
        return `top: ${rect.top}px; left: ${rect.right}px; transform: translate(-100%, -100%);`;
      case 'bl':
        return `top: ${rect.bottom}px; left: ${rect.left}px;`;
      case 'br':
        return `top: ${rect.bottom}px; left: ${rect.right}px; transform: translateX(-100%);`;
    }
  });

  let preview = $derived(
    localText.length > 0 ? localText.slice(0, ANNOTATION_PREVIEW_LENGTH) + (localText.length > ANNOTATION_PREVIEW_LENGTH ? '…' : '') : null,
  );
</script>

<div class="cv-annotation-editor" style={tabStyle} role="none">
  <button
    class="cv-annotation-tab"
    class:cv-annotation-tab--has-text={localText.length > 0}
    onclick={handleTabClick}
    title={localText.length > 0 ? localText : 'Add annotation'}
    aria-label="Annotation"
    aria-expanded={isExpanded}
  >
    {#if preview}
      <span class="cv-annotation-tab-preview">{preview}</span>
    {:else}
      <span class="cv-annotation-tab-icon">+ note</span>
    {/if}
  </button>

  {#if isExpanded}
    <div class="cv-annotation-panel" role="none">
      <textarea
        class="cv-annotation-textarea"
        maxlength={MAX_ANNOTATION_LENGTH}
        value={localText}
        oninput={handleInput}
        placeholder="Add a note…"
        rows="3"
      ></textarea>
      <div class="cv-annotation-footer">
        <div class="cv-corner-selector" role="group" aria-label="Anchor corner">
          {#each CORNER_ICONS as { key, icon } (key)}
            <button
              class="cv-corner-btn"
              class:active={localCorner === key}
              onclick={(e) => {
                e.stopPropagation();
                setCorner(key);
              }}
              title="Anchor to {key}"
              aria-label="Anchor to {key}"
              aria-pressed={localCorner === key}
            >{icon}</button>
          {/each}
        </div>
        <span class="cv-char-counter">{MAX_ANNOTATION_LENGTH - localText.length}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .cv-annotation-editor {
    position: fixed;
    z-index: 9400;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .cv-annotation-tab {
    height: 20px;
    padding: 0 8px;
    border-radius: 100px;
    border: 1.5px solid rgba(0, 0, 0, 0.18);
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: box-shadow 0.15s;
    max-width: 160px;
    overflow: hidden;
  }

  .cv-annotation-tab:hover {
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.22);
  }

  .cv-annotation-tab--has-text {
    background: #fffbe6;
    border-color: rgba(180, 83, 9, 0.4);
  }

  .cv-annotation-tab-icon {
    font-size: 10px;
    line-height: 1;
    color: #6b7280;
  }

  .cv-annotation-tab-preview {
    font-size: 9px;
    font-weight: 600;
    color: #1a1a1a;
    font-family: ui-sans-serif, system-ui, sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 130px;
  }

  .cv-annotation-panel {
    background: white;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    padding: 8px;
    width: 220px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .cv-annotation-textarea {
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    padding: 5px 7px;
    font-size: 11px;
    font-family: ui-sans-serif, system-ui, sans-serif;
    color: #1a1a1a;
    line-height: 1.5;
    outline: none;
    min-height: 56px;
  }

  .cv-annotation-textarea:focus {
    border-color: #b45309;
    box-shadow: 0 0 0 2px rgba(180, 83, 9, 0.15);
  }

  .cv-annotation-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cv-corner-selector {
    display: flex;
    gap: 2px;
  }

  .cv-corner-btn {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #6b7280;
    padding: 0;
    transition: background 0.1s, border-color 0.1s;
  }

  .cv-corner-btn:hover {
    background: #fef3c7;
    border-color: #b45309;
    color: #1a1a1a;
  }

  .cv-corner-btn.active {
    background: #fef3c7;
    border-color: #b45309;
    color: #92400e;
    font-weight: 700;
  }

  .cv-char-counter {
    font-size: 9px;
    color: #9ca3af;
    font-family: ui-sans-serif, system-ui, sans-serif;
    font-variant-numeric: tabular-nums;
  }
</style>
