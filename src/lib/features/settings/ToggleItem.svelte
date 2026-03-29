<script lang="ts">
  import type { ToggleConfig } from '$lib/types/index';
  import ToggleSegmentedControl from '$features/toggles/components/ToggleSegmentedControl.svelte';

  interface Props {
    toggle: ToggleConfig;
    value?: 'show' | 'hide' | 'peek';
    onchange?: (detail: { toggleId: string; value: 'show' | 'hide' | 'peek' }) => void;
  }

  let { toggle, value = $bindable('show'), onchange = () => {} }: Props = $props();
</script>

<div class="card">
  <div class="content">
    <div>
      <p class="title">{toggle.label || toggle.toggleId}</p>
      {#if toggle.description}
        <p class="description">{toggle.description}</p>
      {/if}
    </div>
    <ToggleSegmentedControl
      {value}
      onchange={(v) => { value = v; onchange({ toggleId: toggle.toggleId, value: v }); }}
    />
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
</style>
