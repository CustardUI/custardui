<script lang="ts">
  import { focusStore } from '$features/focus/stores/focus-store.svelte';
  import { slide } from 'svelte/transition';

  function handleExit() {
    focusStore.exit();
  }
</script>

{#if focusStore.isActive}
  <div class="cv-focus-banner-wrapper" transition:slide={{ duration: 250 }}>
    <div id="cv-exit-focus-banner" data-cv-scroll-offset>
      <span>You are viewing a focused selection.</span>
      <button onclick={handleExit}>Show Full Page</button>
    </div>
  </div>
{/if}

<style>
  .cv-focus-banner-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9000;
    background-color: #f3cb52;
    box-shadow: 0 2px 8px rgba(44, 26, 14, 0.15);
    font-family: system-ui, sans-serif;
  }

  #cv-exit-focus-banner {
    color: #2c1a0e;
    justify-content: center;
  }

  button {
    background: #804b18;
    color: #fdf6e3;
    border: none;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  button:hover {
    background: #c4853a;
  }
</style>
