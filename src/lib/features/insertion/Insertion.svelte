<svelte:options
  customElement={{
    tag: 'cv-insertion',
    props: {
      insertionId: { reflect: false, type: 'String', attribute: 'insertion-id' },
      label: { reflect: false, type: 'String', attribute: 'label' },
      color: { reflect: false, type: 'String', attribute: 'color' },
    },
  }}
/>

<script lang="ts">
  import { insertionStore } from '$features/insertion/insertion-store.svelte';

  let {
    insertionId = '',
    label = '',
    color = '',
  }: {
    insertionId?: string;
    label?: string;
    color?: string;
  } = $props();

  /**
   * The HTML content to inject, resolved from the insertion store.
   * `null` means "show the default slot instead".
   */
  let insertedHtml = $derived.by((): string | null => {
    if (!insertionId) return null;
    if (!insertionStore.isAdaptationActive) return null;
    const map = insertionStore.map;
    if (!map) return null;
    const entry = map[insertionId];
    return entry !== undefined ? entry.content : null;
  });

  /** Attribution label: per-tag `label` prop > per-insertion `label` from HTML > adaptation label > adaptation id */
  let attributionLabel = $derived.by(() => {
    if (label?.trim()) return label.trim();
    const entry = insertionStore.map?.[insertionId];
    if (entry?.label?.trim()) return entry.label.trim();
    return insertionStore.adaptationLabel || null;
  });

  /** Attribution color: per-tag `color` prop > per-insertion `color` from HTML > null */
  let attributionColor = $derived.by(() => {
    if (color?.trim()) return color.trim();
    const entry = insertionStore.map?.[insertionId];
    if (entry?.color?.trim()) return entry.color.trim();
    return null;
  });

  let hasInsertion = $derived(insertedHtml !== null);

  /**
   * Inject the raw HTML into the element using Svelte's native {@html} tag.
   */
</script>

{#if hasInsertion}
  <!--
    Adopter-supplied insertion block.
    Rendered as a visually distinct callout to make it clear this content
    comes from the adaptation, not the original site.
  -->
  <aside 
    class="cv-insertion-block" 
    aria-label={attributionLabel || 'Adopter note'}
    style={attributionColor ? `--cv-insertion-color: ${attributionColor};` : undefined}
  >
    {#if attributionLabel}
      <div class="cv-insertion-header">
        <span class="cv-insertion-label">{attributionLabel}</span>
      </div>
    {/if}
    <!-- Raw HTML from insertions.html is injected here natively by Svelte -->
    <div class="cv-insertion-content">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html insertedHtml}
    </div>
  </aside>
{:else}
  <!--
    Default slot: shown when no adaptation is active, or when no matching
    insertion-id is found in the active adaptation's insertions.html.
  -->
  <slot></slot>
{/if}

<style>
  :host {
    display: block;
  }

  /* ------------------------------------------------------------------ */
  /* Callout wrapper                                                      */
  /* ------------------------------------------------------------------ */
  .cv-insertion-block {
    display: block;
    position: relative;
    margin: 1rem 0;
    padding: 0.75rem 1rem 0.75rem 1.25rem;
    border-left: 4px solid var(--cv-insertion-color, var(--cv-primary, #814c20));
    border-radius: 0 6px 6px 0;
    background: color-mix(in srgb, var(--cv-insertion-color, var(--cv-primary, #814c20)) 8%, transparent);
    font-style: normal;
    box-sizing: border-box;
  }

  /* ------------------------------------------------------------------ */
  /* Header row (icon + label)                                           */
  /* ------------------------------------------------------------------ */
  .cv-insertion-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .cv-insertion-label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--cv-insertion-color, var(--cv-primary, #814c20));
    line-height: 1;
  }

  /* ------------------------------------------------------------------ */
  /* Injected content area                                               */
  /* ------------------------------------------------------------------ */
  .cv-insertion-content {
    font-size: 0.95rem;
    line-height: 1.6;
    /* Collapse excess vertical whitespace from injected markup */
    overflow: hidden;
  }

  .cv-insertion-content :global(p:first-child) {
    margin-top: 0;
  }

  .cv-insertion-content :global(p:last-child) {
    margin-bottom: 0;
  }
</style>
