<svelte:options
  customElement={{
    tag: 'cv-toggle',
    props: {
      toggleId: { reflect: true, type: 'String', attribute: 'toggle-id' },
      showPeekBorder: { reflect: true, type: 'Boolean', attribute: 'show-peek-border' },
      showLabel: { reflect: true, type: 'Boolean', attribute: 'show-label' },
      placeholderId: { reflect: true, type: 'String', attribute: 'placeholder-id' },
    },
  }}
/>

<script lang="ts">
  import IconChevronDown from '$lib/app/icons/IconChevronDown.svelte';
  import IconChevronUp from '$lib/app/icons/IconChevronUp.svelte';
  import { activeStateStore } from '$lib/stores/active-state-store.svelte';
  import { elementStore } from '$lib/stores/element-store.svelte';
  import { PlaceholderBinder } from '$features/placeholder/placeholder-binder';

  // Props using Svelte 5 runes
  let {
    toggleId = '',
    showPeekBorder = false,
    showLabel = false,
    placeholderId = '',
  }: {
    toggleId?: string;
    showPeekBorder?: boolean;
    showLabel?: boolean;
    placeholderId?: string;
  } = $props();
  // Derive toggle IDs from toggle-id prop (can have multiple space-separated IDs)
  let toggleIds = $derived((toggleId || '').split(/\s+/).filter(Boolean));
  let toggleConfig = $derived(activeStateStore.config.toggles?.find((t) => t.toggleId === toggleIds[0]));

  $effect(() => {
    toggleIds.forEach((id) => elementStore.registerToggle(id));
  });

  // Placeholder mode: show/hide based on whether a placeholder has a value
  let placeholderName = $derived(placeholderId.replace(/\*$/, ''));
  let placeholderAny = $derived(placeholderId.endsWith('*'));
  let isPlaceholderMode = $derived(!!placeholderId);

  let placeholderVisible = $derived.by(() => {
    if (!isPlaceholderMode) return false;
    const values = activeStateStore.state.placeholders ?? {};
    if (placeholderAny) {
      return PlaceholderBinder.resolveValue(placeholderName, undefined, values) !== undefined;
    }
    return PlaceholderBinder.resolveUserValue(placeholderName, values) !== undefined;
  });

  $effect(() => {
    if (placeholderId && toggleId) {
      console.warn(
        `[cv-toggle] Both 'toggle-id' and 'placeholder-id' are set. ` +
          `'placeholder-id' will take precedence and 'toggle-id' will be ignored.`,
      );
    }
    if (placeholderId) elementStore.registerPlaceholder(placeholderName);
  });

  // Derive label text from config
  let labelText = $derived.by(() => {
    if (!toggleConfig) return '';
    return toggleConfig.label || toggleIds[0];
  });

  let localExpanded = $state(false);
  let isUnconstrained = $state(false); /* New state to track if we can release max-height */
  let contentEl: HTMLDivElement;
  let innerEl: HTMLDivElement;
  let scrollHeight = $state(0);

  // Derive visibility from store state
  let showState = $derived.by(() => {
    // Default to SHOWN if config hasn't loaded yet (prevent pop-in)
    if (!activeStateStore.config.toggles) return true;

    const shownToggles = activeStateStore.state.shownToggles ?? [];
    return toggleIds.some((id) => shownToggles.includes(id));
  });

  // Derive peek state from store state
  let peekState = $derived.by(() => {
    const peekToggles = activeStateStore.state.peekToggles ?? [];
    return !showState && toggleIds.some((id) => peekToggles.includes(id));
  });

  const PEEK_HEIGHT = 70;
  let isSmallContent = $state(false);

  // Setup ResizeObserver to track content height changes (e.g. images loading, window resize)
  $effect(() => {
    if (!contentEl) return;

    const observer = new ResizeObserver(() => {
      // We measure the inner element's height
      // contentEl is the window, innerEl is the content
      if (innerEl) {
        scrollHeight = innerEl.offsetHeight;
      }

      // Always track small content state to avoid race conditions/stale state
      if (scrollHeight > 0) {
        if (scrollHeight <= PEEK_HEIGHT) {
          isSmallContent = true;
        } else if (!isSmallContent) {
          // Only set to false if it wasn't already true (latch behavior)
          // This ensures if it STARTS small, growing won't add the button.
          isSmallContent = false;
        }
      }
    });

    if (innerEl) {
      observer.observe(innerEl);
      scrollHeight = innerEl.offsetHeight;
    }

    return () => {
      observer.disconnect();
    };
  });

  let showFullContent = $derived(
    isPlaceholderMode
      ? placeholderVisible
      : showState || (peekState && localExpanded) || (peekState && isSmallContent),
  );

  // Reset unconstrained state when toggling
  $effect(() => {
    if (showFullContent) {
      // Expanding: start constrained (to animate), will unlock on transitionend
      isUnconstrained = false;
    } else {
      // Collapsing: must recapture height immediately (snap) or stay constrained
      isUnconstrained = false;
    }
  });
  // Only show peek styling (mask) if it's peeking, not expanded locally, AND content is actually taller than peek height
  let showPeekContent = $derived(!showState && peekState && !localExpanded && !isSmallContent);
  let isHidden = $derived(isPlaceholderMode ? !placeholderVisible : !showState && !peekState);

  // Calculate dynamic max-height for animation
  let currentMaxHeight = $derived.by(() => {
    if (isHidden) return '0px';
    if (isUnconstrained && showFullContent) return 'none'; /* Release constraint when stable */
    if (showPeekContent) return `${PEEK_HEIGHT}px`;
    if (showFullContent) return scrollHeight > 0 ? `${scrollHeight}px` : '9999px';
    return '0px';
  });

  function handleTransitionEnd(e: TransitionEvent) {
    // Only care about max-height transitions on the content element
    if (e.propertyName !== 'max-height' || e.target !== contentEl) return;

    // If we finished expanding, release the height constraint
    if (showFullContent) {
      isUnconstrained = true;
    }
  }

  function toggleExpand(e: MouseEvent) {
    e.stopPropagation();
    localExpanded = !localExpanded;
  }


</script>

<div
  class="cv-toggle-wrapper"
  class:expanded={showFullContent && !showPeekContent}
  class:peeking={showPeekContent}
  class:peek-mode={peekState}
  class:hidden={isHidden}
  class:has-border={showPeekBorder && peekState}
>
  {#if showLabel && labelText && !isHidden}
    <div class="cv-toggle-label">{labelText}</div>
  {/if}

  <div
    class="cv-toggle-content"
    bind:this={contentEl}
    style:max-height={currentMaxHeight}
    ontransitionend={handleTransitionEnd}
  >
    <div class="cv-toggle-inner" bind:this={innerEl}>
      <slot></slot>
    </div>
  </div>

  {#if peekState && !isSmallContent}
    <button
      type="button"
      class="cv-expand-btn"
      aria-label={localExpanded ? 'Show less' : 'Show more'}
      onclick={toggleExpand}
    >
      {#if localExpanded}
        <IconChevronUp />
        <span class="cv-expand-label">Show less</span>
      {:else}
        <IconChevronDown />
        <span class="cv-expand-label">Show more</span>
      {/if}
    </button>
  {/if}
</div>

<style>
  :host {
    display: block;
    position: relative;
    z-index: 1;
    overflow: visible;
  }

  /* Host visibility control */
  :host([hidden]) {
    display: none;
  }

  .cv-toggle-wrapper {
    position: relative;
    width: 100%;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 4px;
  }

  .cv-toggle-wrapper.hidden {
    margin-bottom: 0;
  }

  .cv-toggle-wrapper.peek-mode {
    margin-bottom: 28px;
  }

  .cv-toggle-content {
    overflow: hidden;
    transition:
      max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s ease,
      overflow 0s 0s;
  }

  .cv-toggle-inner {
    display: flow-root; /* Ensures margins of children are contained */
  }

  /* Hidden State */
  .hidden .cv-toggle-content {
    opacity: 0;
    pointer-events: none;
  }

  /* Bordered State */
  .has-border {
    box-sizing: border-box;
    border: 2px dashed rgba(0, 0, 0, 0.15);
    border-bottom: none;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.05),
      inset 0 -15px 10px -10px rgba(0, 0, 0, 0.1);
    border-radius: 8px 8px 0 0;
    padding: 12px 0 0 0;
    margin-top: 4px;
  }

  /* Visible / Expanded State */
  .expanded .cv-toggle-content {
    opacity: 1;
    transform: translateY(0);
    overflow: visible;
    transition:
      max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s ease,
      overflow 0s 0.35s;
  }

  /* When expanded, complete the border */
  .has-border.expanded {
    border-bottom: 2px dashed rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    padding-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  /* Peek State — smoother gradient */
  .peeking .cv-toggle-content {
    opacity: 1;
    mask-image: linear-gradient(to bottom, black 30%, rgba(0,0,0,0.5) 70%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 30%, rgba(0,0,0,0.5) 70%, transparent 100%);
  }

  /* Label Style */
  .cv-toggle-label {
    position: absolute;
    top: -12px;
    left: 0;
    background: #e0e0e0;
    color: #333;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    z-index: 10;
    pointer-events: auto;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  /* Adjust label position if bordered */
  .has-border .cv-toggle-label {
    top: -10px;
    left: 0;
  }

  /* Expand Button — upgraded to pill style */
  .cv-expand-btn {
    position: absolute;
    bottom: -28px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 999px;
    padding: 3px 12px;
    cursor: pointer;
    z-index: 100;
    color: #666;
    font-size: 0.7rem;
    font-weight: 500;
    font-family: inherit;
    line-height: 1;
    transition: all 0.2s ease;
  }

  .cv-expand-btn:hover {
    background: rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.15);
    color: #333;
    transform: translateX(-50%) scale(1.02);
  }

  .cv-expand-btn :global(svg) {
    display: block;
    width: 14px;
    height: 14px;
    opacity: 0.6;
    flex-shrink: 0;
  }

  .cv-expand-btn:hover :global(svg) {
    opacity: 1;
  }

  .cv-expand-label {
    white-space: nowrap;
  }
</style>
