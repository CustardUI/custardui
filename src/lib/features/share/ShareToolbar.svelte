<script lang="ts">
  import { shareStore } from '$features/share/stores/share-store.svelte';
  import { fly } from 'svelte/transition';
  import { ANNOTATION_COLORS } from '$features/annotations/annotation-colors';

  function handleClear() {
    shareStore.clearAllSelections();
  }

  function handlePreview() {
    shareStore.previewLink();
  }

  function handleGenerate() {
    shareStore.generateLink();
  }

  function handleExit() {
    shareStore.toggleActive(false);
  }
</script>

<div class="floating-bar" transition:fly={{ y: 50, duration: 200 }}>
  <div class="mode-toggle">
    <button
      type="button"
      class="mode-btn {shareStore.selectionMode === 'highlight' ? 'active' : ''}"
      onclick={() => shareStore.setSelectionMode('highlight')}
      title="Highlight selected text"
      aria-pressed={shareStore.selectionMode === 'highlight'}
    >
      Highlight
    </button>
    <button
      type="button"
      class="mode-btn {shareStore.selectionMode === 'box' ? 'active' : ''}"
      onclick={() => shareStore.setSelectionMode('box')}
      title="Box selected elements"
      aria-pressed={shareStore.selectionMode === 'box'}
    >
      Box
    </button>
    <button
      type="button"
      class="mode-btn {shareStore.selectionMode === 'show' ? 'active' : ''}"
      onclick={() => shareStore.setSelectionMode('show')}
      title="Show only selected elements"
      aria-pressed={shareStore.selectionMode === 'show'}
    >
      Show
    </button>
    <button
      type="button"
      class="mode-btn {shareStore.selectionMode === 'hide' ? 'active' : ''}"
      onclick={() => shareStore.setSelectionMode('hide')}
      title="Hide selected elements"
      aria-pressed={shareStore.selectionMode === 'hide'}
    >
      Hide
    </button>
  </div>

  <span class="divider"></span>

  {#if shareStore.selectionMode === 'highlight'}
    <div class="cv-hl-swatches" role="group" aria-label="Highlight color">
      {#each ANNOTATION_COLORS as col (col.key)}
        <button
          type="button"
          class="cv-hl-swatch"
          class:active={shareStore.selectedTextColor === col.key}
          style="--swatch-color: {col.hex};"
          onclick={() => (shareStore.selectedTextColor = col.key)}
          title={col.label}
          aria-label={col.label}
          aria-pressed={shareStore.selectedTextColor === col.key}
        ></button>
      {/each}
    </div>
    <span class="divider"></span>
  {/if}

  <span class="count">
    {#if shareStore.selectionMode === 'highlight'}
      {shareStore.shareCount} highlight{shareStore.shareCount === 1 ? '' : 's'}
    {:else}
      {shareStore.shareCount} item{shareStore.shareCount === 1 ? '' : 's'} to
      {shareStore.selectionMode === 'show'
        ? 'show'
        : shareStore.selectionMode === 'box'
          ? 'box'
          : 'hide'}
    {/if}
  </span>

  <button type="button" class="btn clear" onclick={handleClear}>Clear</button>

  <label class="label-wrapper">
    <span class="label-text">Label:</span>
    <input
      type="text"
      class="label-input"
      bind:value={shareStore.linkLabel}
      placeholder="Optional link label"
      aria-label="Optional link label"
    />
  </label>

  <button type="button" class="btn preview" onclick={handlePreview}>Preview</button>
  <button type="button" class="btn generate" onclick={handleGenerate}>Copy Link</button>
  <button type="button" class="btn exit" onclick={handleExit}>Exit</button>
</div>

<style>
  .floating-bar {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #2c2c2c;
    color: #f1f1f1;
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 99999;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    font-size: 14px;
    border: 1px solid #4a4a4a;
    pointer-events: auto;
    white-space: nowrap;
    min-width: 500px;
  }

  .mode-toggle {
    display: flex;
    background: #1a1a1a;
    border-radius: 6px;
    padding: 2px;
    border: 1px solid #4a4a4a;
  }

  .mode-btn {
    background: transparent;
    color: #aeaeae;
    border: none;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 13px;
    transition: all 0.2s;
  }

  .mode-btn:hover {
    color: #fff;
  }

  .mode-btn.active {
    background: #4a4a4a;
    color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .divider {
    width: 1px;
    height: 20px;
    background: #4a4a4a;
    margin: 0 4px;
  }

  .count {
    font-weight: 500;
    min-width: 120px;
    text-align: center;
    font-size: 13px;
    color: #ccc;
  }

  .label-wrapper {
    display: flex;
    align-items: center;
    background: #1a1a1a;
    border: 1px solid #4a4a4a;
    border-radius: 4px;
    padding: 2px 2px 2px 8px;
    font-size: 13px;
    transition: all 0.2s ease;
  }

  .label-wrapper:focus-within {
    border-color: #0078d4;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.3);
  }

  .label-text {
    color: #888;
    pointer-events: none;
  }

  .label-input {
    background: transparent;
    border: none;
    color: #fff;
    padding: 4px 6px;
    width: 70px;
    font-size: 13px;
    outline: none;
    transition: width 0.2s ease;
  }

  .label-input::placeholder {
    color: #555;
  }

  .label-input:focus {
    width: 120px;
  }

  .btn {
    background-color: #0078d4;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
    font-size: 13px;
  }

  .btn:hover {
    background-color: #005a9e;
  }

  .btn.clear {
    background-color: transparent;
    border: 1px solid #5a5a5a;
    color: #dadada;
  }
  .btn.clear:hover {
    background-color: #3a3a3a;
    color: white;
  }

  .btn.preview {
    background-color: #333;
    border: 1px solid #555;
  }
  .btn.preview:hover {
    background-color: #444;
  }

  .btn.exit {
    background-color: transparent;
    color: #ff6b6b;
    padding: 6px 10px;
  }
  .btn.exit:hover {
    background-color: rgba(255, 107, 107, 0.1);
  }

  @media (max-width: 600px) {
    .floating-bar {
      display: flex;
      flex-wrap: wrap;
      min-width: unset;
      width: 90%;
      max-width: 400px;
      height: auto;
      padding: 12px;
      gap: 10px;
      bottom: 30px;
    }

    .mode-toggle {
      margin-right: auto;
      order: 1;
    }

    .btn.exit {
      margin-left: auto;
      order: 2;
    }

    .divider {
      display: none;
    }

    .count {
      width: 100%;
      text-align: center;
      order: 3;
      padding: 8px 0;
      border-top: 1px solid #3a3a3a;
      border-bottom: 1px solid #3a3a3a;
      margin: 4px 0;
    }

    .label-input {
      order: 4;
      flex: 1;
      width: auto;
      min-width: 80px;
    }

    .label-input:focus {
      width: auto;
    }

    .btn.clear,
    .btn.preview,
    .btn.generate {
      flex: 1;
      text-align: center;
      font-size: 12px;
      padding: 8px 4px;
      order: 5;
    }

    .btn.generate {
      flex: 1.5;
    }
  }

  /* ── Swatches ─────────────────────────────────── */

  .cv-hl-swatches {
    display: grid;
    grid-template-columns: repeat(5, 18px);
    gap: 6px;
    align-items: center;
    justify-items: center;
  }

  .cv-hl-swatch {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--swatch-color);
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    transition:
      transform 0.12s ease,
      border-color 0.12s ease,
      box-shadow 0.12s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .cv-hl-swatch:hover {
    transform: scale(1.2);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  }

  .cv-hl-swatch.active {
    border-color: rgba(255, 255, 255, 0.85);
    transform: scale(1.15);
    box-shadow:
      0 0 0 2px var(--swatch-color),
      0 2px 8px rgba(0, 0, 0, 0.4);
  }
</style>
