<svelte:options
  customElement={{
    tag: 'cv-toggle-control',
    props: {
      toggleId: { reflect: true, type: 'String', attribute: 'toggle-id' },
      noLabel: { type: 'Boolean', attribute: 'no-label' },
    },
  }}
/>

<script lang="ts">
  import { activeStateStore } from '$lib/stores/active-state-store.svelte';
  import { elementStore } from '$lib/stores/element-store.svelte';
  import ToggleSegmentedControl from './ToggleSegmentedControl.svelte';

  let {
    toggleId = '',
    noLabel = false,
  }: {
    toggleId?: string;
    noLabel?: boolean;
  } = $props();

  let configLoaded = $derived(!!activeStateStore.config.toggles);
  let toggleConfig = $derived(activeStateStore.config.toggles?.find((t) => t.toggleId === toggleId));
  let labelText = $derived(toggleConfig?.label || toggleId);
  let isSiteManaged = $derived(toggleConfig?.siteManaged ?? false);

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
</script>

{#if configLoaded && !!toggleConfig && !isSiteManaged}
  {#if !noLabel}
    <div class="card">
      <div class="content">
        <div>
          <p class="label">{labelText}</p>
          {#if toggleConfig?.description}
            <p class="description">{toggleConfig.description}</p>
          {/if}
        </div>
        <ToggleSegmentedControl
          value={currentState}
          onchange={(v) => activeStateStore.updateToggleState(toggleId, v)}
          ariaLabel={`Visibility for ${labelText}`}
        />
      </div>
    </div>
  {:else}
    <ToggleSegmentedControl
      value={currentState}
      onchange={(v) => activeStateStore.updateToggleState(toggleId, v)}
      ariaLabel={`Visibility for ${labelText}`}
      standalone
    />
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
</style>
