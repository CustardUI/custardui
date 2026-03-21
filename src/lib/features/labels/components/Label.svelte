<svelte:options
  customElement={{
    tag: 'cv-label',
    props: {
      name: { reflect: true, type: 'String', attribute: 'name' },
      color: { reflect: true, type: 'String', attribute: 'color' },
    },
  }}
/>

<script lang="ts">
  import { labelRegistryStore } from '../label-registry-store.svelte';
  import { colorSchemeStore } from '$lib/stores/color-scheme-store.svelte';
  import { computeTextColor, resolveColor } from '../label-utils';

  let { name = '', color = '' }: { name?: string; color?: string } = $props();

  const DEFAULT_COLOR = '#6b7280';

  let labelDef = $derived(labelRegistryStore.get(name));
  let rawColor = $derived(labelDef?.color ?? (color || DEFAULT_COLOR));
  let bgColor = $derived(resolveColor(rawColor, colorSchemeStore.isDark));
  let textColor = $derived(computeTextColor(bgColor));
</script>

{#if labelDef}
  <span class="cv-label" style:background={bgColor} style:color={textColor}>
    {#if labelDef.value}
      {labelDef.value}
    {:else}
      <slot></slot>
    {/if}
  </span>
{:else}
  <slot></slot>
{/if}

<style>
  :host {
    display: inline;
  }

  .cv-label {
    display: inline-flex;
    align-items: center;
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 0.75em;
    font-weight: 600;
    white-space: nowrap;
    line-height: 1.5;
    letter-spacing: 0.02em;
    vertical-align: middle;
  }
</style>
