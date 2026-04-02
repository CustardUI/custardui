<svelte:options
  customElement={{
    tag: 'cv-placeholder',
    props: {
      name:     { reflect: false, type: 'String',  attribute: 'name' },
      fallback: { reflect: false, type: 'String',  attribute: 'fallback' },
      ifSet:    { reflect: false, type: 'String',  attribute: 'if-set' },
      ifUnset:  { reflect: false, type: 'String',  attribute: 'if-unset' },
      includeDefault: { reflect: false, type: 'Boolean', attribute: 'include-default' },
    },
  }}
/>

<script lang="ts">
  import { activeStateStore } from '$lib/stores/active-state-store.svelte';
  import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';
  import { PlaceholderBinder } from '$features/placeholder/placeholder-binder';

  let { name, fallback, ifSet, ifUnset, includeDefault } = $props<{
    name: string;
    fallback?: string;
    ifSet?: string;
    ifUnset?: string;
    includeDefault?: boolean;
  }>();

  let value = $derived.by(() => {
    if (!name) return '';

    if (ifSet !== undefined) {
      const placeholders = activeStateStore.state.placeholders ?? {};
      const val = includeDefault
        ? PlaceholderBinder.resolveValue(name, undefined, placeholders)
        : PlaceholderBinder.resolveUserValue(name, placeholders);
      return val !== undefined ? ifSet.replace(/\$/g, () => val) : (ifUnset ?? '');
    }

    // 1. User Value
    const userVal = activeStateStore.state.placeholders?.[name];
    if (userVal !== undefined && userVal !== '') return userVal;

    // 2. Fallback (explicit empty string is valid — shows nothing)
    if (fallback !== undefined) return fallback;

    // 3. Registry Default
    const def = placeholderRegistryStore.get(name);
    if (def?.defaultValue !== undefined && def.defaultValue !== '') return def.defaultValue;

    // 4. Raw Name
    return `[[${name}]]`;
  });
  function updateHost(node: HTMLElement) {
    // With {@attach}, this function runs in an effect context
    // and re-runs whenever dependencies (like `value`) change.

    // Write to the host's light DOM so that .textContent works on parent elements
    // This is safe because we don't have <slot>s, so this text is never rendered
    const host = node.getRootNode() as ShadowRoot;
    if (host && host.host) {
      const hostEl = host.host as HTMLElement;
      hostEl.innerText = value;
    }
  }
</script>

<span class="cv-var" {@attach updateHost}>{value}</span>

<style>
  :host {
    display: inline;
  }
</style>
