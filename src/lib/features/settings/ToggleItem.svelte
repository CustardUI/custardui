<script lang="ts">
  import type { ToggleConfig } from '$lib/types/index';
  import IconEye from '$lib/app/icons/IconEye.svelte';
  import IconEyeSlash from '$lib/app/icons/IconEyeSlash.svelte';

  interface Props {
    toggle: ToggleConfig;
    value?: 'show' | 'hide' | 'peek';
    onchange?: (detail: { toggleId: string; value: 'show' | 'hide' | 'peek' }) => void;
  }

  let { toggle, value = $bindable('show'), onchange = () => {} }: Props = $props();

  const icons: Record<'hide' | 'show', typeof IconEye> = { hide: IconEyeSlash, show: IconEye };
</script>

<div class="card">
  <div class="content">
    <div>
      <p class="title">{toggle.label || toggle.toggleId}</p>
      {#if toggle.description}
        <p class="description">{toggle.description}</p>
      {/if}
    </div>
    <div class="segmented" role="group" aria-label="Visibility">
      {#each (['hide', 'peek', 'show'] as const) as option (option)}
        <button
          type="button"
          class="segment-btn {value === option ? 'active' : ''}"
          onclick={() => { value = option; onchange({ toggleId: toggle.toggleId, value: option }); }}
          aria-pressed={value === option}
          title={option.charAt(0).toUpperCase() + option.slice(1)}
        >
          {#if (option === 'hide' || option === 'show')}
            {@const IconComponent = icons[option]}
            <span class="segment-icon">
              <IconComponent />
            </span>
          {/if}
          <span class="segment-label">{option.charAt(0).toUpperCase() + option.slice(1)}</span>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .card {
    background: var(--cv-bg);
    border: 1px solid var(--cv-border);
    border-radius: var(--cv-card-radius, 0.5rem);
    transition: background 0.15s ease;
  }

  .card:hover {
    background: var(--cv-bg-hover);
  }

  .content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
  }

  .title {
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--cv-text);
    margin: 0;
  }

  .description {
    font-size: 0.75rem;
    color: var(--cv-text-secondary);
    margin: 0.125rem 0 0 0;
  }

  .segmented {
    display: flex;
    border: 1px solid var(--cv-border);
    border-radius: 0.375rem;
    overflow: hidden;
    flex-shrink: 0;
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
</style>
