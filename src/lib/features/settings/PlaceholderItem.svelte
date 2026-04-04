<script lang="ts">
  import type { PlaceholderDefinition } from '$features/placeholder/types';
  import IconPencil from '$lib/app/icons/IconPencil.svelte';

  interface Props {
    definition: PlaceholderDefinition;
    value?: string;
    onchange?: (detail: { name: string; value: string }) => void;
  }

  let { definition, value = $bindable(''), onchange = () => {} }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    onchange({ name: definition.name, value: target.value });
  }

  const sanitizedId = $derived(`cv-placeholder-${definition.name.replace(/[^a-zA-Z0-9-_]/g, '-')}`);
</script>

<div class="placeholder-item">
  <div class="label-group">
    <label class="placeholder-label" for={sanitizedId}
      >{definition.settingsLabel || definition.name}</label
    >
    {#if definition.description}
      <p class="placeholder-description">{definition.description}</p>
    {/if}
  </div>
  <div class="input-container">
    <input
      id={sanitizedId}
      class="placeholder-input"
      type="text"
      placeholder={definition.settingsHint || ''}
      {value}
      oninput={handleInput}
    />
    <span class="edit-icon" aria-hidden="true"><IconPencil /></span>
  </div>
</div>

<style>
  .placeholder-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--cv-bg);
    border: 1px solid var(--cv-border);
    border-radius: var(--cv-card-radius, 0.5rem);
    transition: background 0.15s ease;
  }

  .placeholder-item:hover {
    background: var(--cv-bg-hover);
  }

  .label-group {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .placeholder-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--cv-text);
    margin: 0;
  }

  .placeholder-description {
    font-size: 0.75rem;
    color: var(--cv-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .input-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .edit-icon {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    pointer-events: none;
    color: var(--cv-text-secondary);
    opacity: 0.7;
  }

  .edit-icon :global(svg) {
    width: 0.75rem;
    height: 0.75rem;
  }

  .placeholder-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    padding-right: 1.6rem;
    border: 1px solid var(--cv-input-border);
    border-radius: var(--cv-card-radius, 0.5rem);
    font-size: 0.9rem;
    transition: border-color 0.2s;
    background: var(--cv-input-bg);
    color: var(--cv-text);
  }

  .placeholder-input:focus {
    outline: none;
    border-color: var(--cv-primary);
    box-shadow: 0 0 0 2px var(--cv-focus-ring);
  }
</style>
