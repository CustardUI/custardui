<script lang="ts">
  import IconEye from '$lib/app/icons/IconEye.svelte';
  import IconEyeSlash from '$lib/app/icons/IconEyeSlash.svelte';

  let {
    value,
    onchange,
    ariaLabel = 'Visibility',
    standalone = false,
  }: {
    value: 'show' | 'peek' | 'hide';
    onchange: (v: 'show' | 'peek' | 'hide') => void;
    ariaLabel?: string;
    standalone?: boolean;
  } = $props();

  const icons: Record<'hide' | 'show', typeof IconEye> = { hide: IconEyeSlash, show: IconEye };
</script>

<div class="segmented" class:standalone role="group" aria-label={ariaLabel}>
  {#each (['hide', 'peek', 'show'] as const) as option (option)}
    <button
      type="button"
      class="segment-btn {value === option ? 'active' : ''}"
      onclick={() => onchange(option)}
      aria-pressed={value === option}
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

<style>
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
