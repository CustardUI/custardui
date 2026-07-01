<svelte:options
  customElement={{
    tag: 'cv-insertion',
    props: {
      insertionId: { reflect: false, type: 'String', attribute: 'insertion-id' },
      color: { reflect: false, type: 'String', attribute: 'color' },
      align: { reflect: false, type: 'String', attribute: 'align' },
      hideBadge: { reflect: false, type: 'Boolean', attribute: 'hide-badge' },
      outline: { reflect: false, type: 'String', attribute: 'outline' },
      defaultStyle: { reflect: false, type: 'String', attribute: 'default-style' },
      defaultBadge: { reflect: false, type: 'String', attribute: 'default-badge' },
    },
  }}
/>

<script lang="ts">
  import { insertionStore } from '$features/insertion/insertion-store.svelte';

  let {
    insertionId = '',
    color = '',
    align = '',
    hideBadge = false,
    outline,
    defaultStyle = 'callout',
    defaultBadge = '',
  }: {
    insertionId?: string;
    color?: string;
    align?: string;
    hideBadge?: boolean;
    outline?: string;
    defaultStyle?: string;
    defaultBadge?: string;
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

  /** Attribution label: adaptation label > adaptation id */
  let attributionLabel = $derived.by(() => {
    return insertionStore.adaptationLabel || null;
  });

  /** Attribution color: per-tag `color` prop > per-insertion `color` from HTML > null */
  let attributionColor = $derived.by(() => {
    if (color?.trim()) return color.trim();
    const entry = insertionStore.map?.[insertionId];
    if (entry?.color?.trim()) return entry.color.trim();
    return null;
  });

  /** Alignment: per-tag `align` prop > per-insertion `align` from HTML > null */
  let computedAlign = $derived.by(() => {
    if (align?.trim()) return align.trim();
    const entry = insertionStore.map?.[insertionId];
    if (entry?.align?.trim()) return entry.align.trim();
    return null;
  });

  /** Outline: per-tag `outline` prop > per-insertion `outline` from HTML > 'dashed' */
  let computedOutline = $derived.by(() => {
    if (outline?.trim()) return outline.trim();
    const entry = insertionStore.map?.[insertionId];
    if (entry?.outline?.trim()) return entry.outline.trim();
    return 'dashed';
  });

  let hasInsertion = $derived(insertedHtml !== null);

  let hasDefaultContent = $state(false);
  
  let showAsCallout = $derived(hasInsertion || (defaultStyle !== 'none' && hasDefaultContent));

  function updateHasDefaultContent(slot: HTMLSlotElement) {
    if (!slot) return;
    const nodes = slot.assignedNodes();
    hasDefaultContent = nodes.some(n => 
      (n.nodeType === 1) || 
      (n.nodeType === 3 && n.textContent?.trim() !== '')
    );
  }

  const initSlotWrapper = (node: HTMLElement) => {
    const slot = node.querySelector('slot');
    if (!slot) return;
    
    slot.addEventListener('slotchange', () => {
      updateHasDefaultContent(slot);
    });

    queueMicrotask(() => {
      updateHasDefaultContent(slot);
    });
  };

  /**
   * If an adaptation is active but this specific insertion-id is not provided, 
   * the element should completely disappear (unless it's a pure UI element with no id).
   */
  let shouldRender = $derived(
    !insertionStore.isAdaptationActive || 
    hasInsertion || 
    !insertionId
  );

  /**
   * Inject the raw HTML into the element using Svelte's native {@html} tag.
   */
</script>

{#if shouldRender}
  <div 
    class:cv-insertion-block={showAsCallout} 
    class:cv-insertion-unstyled={!showAsCallout}
    aria-label={showAsCallout ? (hasInsertion ? (attributionLabel || 'Adopter note') : (defaultBadge || 'Note')) : undefined}
    style={showAsCallout && attributionColor ? `--cv-insertion-color: ${attributionColor};` : undefined}
    style:text-align={computedAlign || undefined}
    style:border-style={showAsCallout ? computedOutline : undefined}
    style:border-width={showAsCallout && computedOutline === 'none' ? '0' : undefined}
  >
    <div class:cv-insertion-content={showAsCallout}>
      {#if hasInsertion}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html insertedHtml}
      {:else}
        <div style="display: contents" use:initSlotWrapper>
          <slot></slot>
        </div>
      {/if}
    </div>
    {#if showAsCallout && hasInsertion && attributionLabel && !hideBadge}
      <div class="cv-insertion-badge">
        inserted for version: <strong>{attributionLabel}</strong>
      </div>
    {:else if showAsCallout && !hasInsertion && defaultBadge && !hideBadge}
      <div class="cv-insertion-badge">
        <strong>{defaultBadge}</strong>
      </div>
    {/if}
  </div>
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
    margin: 1.5rem 0;
    padding: 1.25rem 1.5rem;
    border: 1px dashed var(--cv-insertion-color, #a1a1aa);
    border-radius: 8px;
    background: color-mix(in srgb, var(--cv-insertion-color, transparent) 5%, #f4f4f5);
    font-style: normal;
    box-sizing: border-box;
  }

  /* ------------------------------------------------------------------ */
  /* Injected content area                                               */
  /* ------------------------------------------------------------------ */
  .cv-insertion-content {
    font-size: 0.95rem;
    line-height: 1.6;
    /* Allow text-align styles from user HTML to take effect properly */
    width: 100%;
  }

  .cv-insertion-content :global(p:first-child) {
    margin-top: 0;
  }

  .cv-insertion-content :global(p:last-child) {
    margin-bottom: 0;
  }

  /* ------------------------------------------------------------------ */
  /* Badge                                                              */
  /* ------------------------------------------------------------------ */
  .cv-insertion-badge {
    position: absolute;
    bottom: 0;
    right: 1.5rem;
    transform: translateY(50%);
    background: #ffffff;
    border: 1px solid var(--cv-insertion-color, #a1a1aa);
    padding: 0.15rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    color: var(--cv-insertion-color, #a1a1aa);
    line-height: 1.4;
    white-space: nowrap;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .cv-insertion-badge strong {
    color: var(--cv-insertion-color, #71717a);
    font-weight: 600;
  }
</style>
