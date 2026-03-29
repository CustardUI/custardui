<svelte:options
  customElement={{
    tag: 'cv-toggle-control',
    props: {
      toggleId: { reflect: true, type: 'String', attribute: 'toggle-id' },
      showLabel: { type: 'String', attribute: 'show-label' },
    },
  }}
/>

<script lang="ts">
  import { activeStateStore } from '$lib/stores/active-state-store.svelte';
  import { elementStore } from '$lib/stores/element-store.svelte';
  import IconEye from '$lib/app/icons/IconEye.svelte';
  import IconEyeSlash from '$lib/app/icons/IconEyeSlash.svelte';

  let {
    toggleId = '',
    showLabel = 'true',
  }: {
    toggleId?: string;
    showLabel?: string;
  } = $props();

  let configLoaded = $derived(!!activeStateStore.config.toggles);
  let toggleConfig = $derived(activeStateStore.config.toggles?.find((t) => t.toggleId === toggleId));
  let labelText = $derived(toggleConfig?.label || toggleId);
  let isSiteManaged = $derived(toggleConfig?.siteManaged ?? false);

  let shouldShowLabel = $derived(showLabel !== 'false');

  $effect(() => {
    if (toggleId) elementStore.registerToggle(toggleId);
  });

  $effect(() => {
    if (configLoaded && toggleId && !toggleConfig) {
      console.warn(`[cv-toggle-control] Unknown toggle-id: "${toggleId}". No matching toggle found in config.`);
    }
  });

  // Mirror <cv-toggle>: default to 'show' before config loads to avoid mismatch with toggle content visibility
  let currentState = $derived.by((): 'show' | 'peek' | 'hide' => {
    if (!configLoaded) return 'show';
    const shownToggles = activeStateStore.state.shownToggles ?? [];
    const peekToggles = activeStateStore.state.peekToggles ?? [];
    if (shownToggles.includes(toggleId)) return 'show';
    if (peekToggles.includes(toggleId)) return 'peek';
    return 'hide';
  });

  const icons: Record<'hide' | 'show', typeof IconEye> = { hide: IconEyeSlash, show: IconEye };
</script>

{#snippet segmentedControl(standalone = false)}
  <div class="segmented" class:standalone role="group" aria-label="Visibility for {labelText}">
    {#each (['hide', 'peek', 'show'] as const) as option (option)}
      <button
        type="button"
        class="segment-btn {currentState === option ? 'active' : ''}"
        onclick={() => activeStateStore.updateToggleState(toggleId, option)}
        aria-pressed={currentState === option}
        title={option.charAt(0).toUpperCase() + option.slice(1)}
      >
        {#if option === 'hide' || option === 'show'}
          {@const Icon = icons[option]}
          <span class="segment-icon"><Icon /></span>
        {/if}
        <span class="segment-label">{option.charAt(0).toUpperCase() + option.slice(1)}</span>
      </button>
    {/each}
  </div>
{/snippet}

{#if configLoaded && !!toggleConfig && !isSiteManaged}
  {#if shouldShowLabel}
    <div class="card">
      <div class="content">
        <div>
          <p class="label">{labelText}</p>
          {#if toggleConfig?.description}
            <p class="description">{toggleConfig.description}</p>
          {/if}
        </div>
        {@render segmentedControl()}
      </div>
    </div>
  {:else}
    {@render segmentedControl(true)}
  {/if}
{/if}

<style>
  :host {
    display: contents;
  }

  .card {
    background: var(--cv-bg);
    border: 1px solid var(--cv-border);
    border-radius: var(--cv-card-radius, 0.5rem);
    transition: background 0.15s ease;
  }

  .content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .label {
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--cv-text);
    margin: 0;
    line-height: 1.4;
  }

  .description {
    font-size: 0.75rem;
    color: var(--cv-text-secondary);
    margin: 0.125rem 0 0 0;
    line-height: 1.4;
  }

  .segmented {
    display: inline-flex;
    border: 1px solid var(--cv-border);
    border-radius: 0.375rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .segmented.standalone {
    margin-left: 0.25rem;
    margin-right: 0.25rem;
  }

  .segment-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: transparent;
    border: none;
    border-left: 1px solid var(--cv-border);
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--cv-text-secondary);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    font-family: inherit;
    line-height: 1;
  }

  .segment-btn:first-child {
    border-left: none;
  }

  .segment-btn:hover:not(.active) {
    background: var(--cv-bg-hover);
    color: var(--cv-text);
  }

  .segment-btn.active {
    background: var(--cv-primary);
    color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  }

  .segment-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .segment-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .segment-label {
    font-size: 0.75rem;
  }
</style>
