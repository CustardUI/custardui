<script>
  let { isMarked = false, ...rest } = $props();
  // Derived opacity based on isMarked
  const extraOpacity = $derived(isMarked ? '1' : '0.6');
</script>

<svg
  width="16"
  height="16"
  viewBox="0 0 16 16"
  fill="currentColor"
  opacity={extraOpacity}
  xmlns="http://www.w3.org/2000/svg"
  {...rest}
>
  {#if isMarked}
    <!-- Solid mark when marked -->
    <path d="M4 2v13l4-2.5L12 15V2H4z" />
  {:else}
    <!-- Outlined mark when not marked -->
    <path d="M4 2v13l4-2.5L12 15V2H4zm1 1h6v10.5l-3-1.88L5 13.5V3z" />
  {/if}
</svg>
