<svelte:options
  customElement={{
    tag: 'cv-tabgroup',
    props: {
      groupId: { reflect: true, type: 'String', attribute: 'group-id' },
      stabilizeScroll: { reflect: true, type: 'Boolean', attribute: 'stabilize-scroll' },
    },
  }}
/>

<script lang="ts">
  import { onMount, tick } from 'svelte';
  import IconMark from '$lib/app/icons/IconMark.svelte';
  import { activeStateStore } from '$lib/stores/active-state-store.svelte';
  import { elementStore } from '$lib/stores/element-store.svelte';
  import { uiStore } from '$lib/stores/ui-store.svelte';
  import { captureScrollAnchor, restoreScrollAnchor } from '$lib/utils/scroll-utils';

  //  ID of the tabgroup Group
  let { groupId, stabilizeScroll = true } = $props<{ groupId?: string; stabilizeScroll?: boolean }>();
  $effect(() => {
    if (groupId) elementStore.registerTabGroup(groupId);
  });

  let tabs: Array<{
    id: string;
    rawId: string;
    header: string;
    element: HTMLElement;
  }> = $state([]);

  let containerEl: HTMLDivElement | undefined = $state();
  let contentWrapper: HTMLElement | undefined = $state();
  let slotEl: HTMLSlotElement | null = $state(null);
  let initialized = $state(false);

  // Local active tab state (independent per group instance)
  let localActiveTabId = $state('');

  // Derive markedTab from store (shared across groups with same ID)
  let markedTab = $derived.by(() => {
    const tabs$ = activeStateStore.state.tabs ?? {};
    return groupId && tabs$[groupId] ? tabs$[groupId] : null;
  });

  // Track the last seen store state to detect real changes
  let lastSeenStoreState = $state<string | null>(null);

  // Authoritative Sync: Only sync when store actually changes.
  // NOTE: Scroll stabilization is NOT done here — it's the responsibility of
  // the initiating action (handleTabDoubleClick, handleMarkClick, or Modal).
  // If this $effect also stabilized, its rAF would compete with the initiator's
  // rAF and undo the correction.
  $effect(() => {
    if (markedTab !== lastSeenStoreState) {
      lastSeenStoreState = markedTab;

      if (markedTab) {
        if (localActiveTabId !== markedTab) {
          localActiveTabId = markedTab;
          updateVisibility();
        }
      }
    }
  });

  // Sync isTabGroupNavHeadingVisible from store
  let navHeadingVisible = $derived(uiStore.isTabGroupNavHeadingVisible);

  // Icons

  onMount(() => {
    if (contentWrapper) {
      slotEl = contentWrapper.querySelector('slot');
      if (slotEl) {
        slotEl.addEventListener('slotchange', handleSlotChange);
        handleSlotChange();
      }
    }
  });

  function splitTabIds(tabId: string): string[] {
    return tabId
      .split(/[\s|]+/)
      .filter((id) => id.trim() !== '')
      .map((id) => id.trim());
  }

  // Todo: For handleSlotChange(), consider if there is a svelte way
  // to do this without the need for the slotchange event.

  /**
   * Handler for the slotchange event.
   * Scans the assigned elements in the slot to find `<cv-tab>` components.
   * Builds the internal `tabs` state used to render the navigation.
   * Also initializes the active tab if not already set.
   */
  function handleSlotChange() {
    if (!slotEl) return;

    const elements = slotEl
      .assignedElements()
      .filter((el) => el.tagName.toLowerCase() === 'cv-tab');

    tabs = elements.map((el, index) => {
      const element = el as HTMLElement;
      let rawId = element.getAttribute('tab-id');

      // If tab has no tab-id, generate one based on position
      if (!rawId) {
        rawId = `${groupId || 'tabgroup'}-tab-${index}`;
        element.setAttribute('data-cv-internal-id', rawId);
      }

      const splitIds = splitTabIds(rawId);
      const primaryId = splitIds[0] || rawId;

      // Extract Header
      let header = '';

      // Check for <cv-tab-header>
      const headerEl = element.querySelector('cv-tab-header');
      if (headerEl) {
        header = headerEl.innerHTML.trim();
      } else {
        // Attribute syntax
        header = (element as HTMLElement & { header?: string }).header || element.getAttribute('header') || '';
        
        if (!header) {
          // Fallback to tab-id or default
          header = element.getAttribute('tab-id') ? primaryId : `Tab ${index + 1}`;
        }
      }

      return {
        id: primaryId,
        rawId,
        header,
        element,
      };
    });

    if (!initialized && tabs.length > 0) {
      // Initialize active tab by dispatching event if none is set
      if (!localActiveTabId) {
        const firstTabId = tabs[0]!.id;
        localActiveTabId = firstTabId;
      } else {
        updateVisibility();
      }
      initialized = true;
    } else if (initialized) {
      // Re-run visibility in case new tabs matched current activeTab
      updateVisibility();
    }
  }

  /**
   * Updates the visibility of the child `<cv-tab>` elements based on the current `activeTab`.
   * Sets the `active` attribute and `cv-visible`/`cv-hidden` classes on the child elements.
   */
  function updateVisibility() {
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      const splitIds = splitTabIds(tab.rawId);
      const isActive = splitIds.includes(localActiveTabId);
      // Set property directly to trigger Svelte component reactivity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tab.element as any).active = isActive;
    });
  }

  /**
   * Handles click events on the navigation tabs.
   * Updates the local active tab (visibility is updated automatically via $effect).
   */

  function handleTabClick(tabId: string, event: MouseEvent) {
    event.preventDefault();

    if (localActiveTabId !== tabId) {
      const anchor = stabilizeScroll && containerEl
        ? captureScrollAnchor(containerEl)
        : null;

      localActiveTabId = tabId;
      updateVisibility();

      if (anchor) restoreScrollAnchor(anchor);
    }
  }

  /**
   * Handles double-click events on the navigation tabs.
   * Updates the store to "mark" the tab globally across all tab groups with the same ID.
   * Stabilizes scroll position because syncing may change height of OTHER groups above.
   */
  async function handleTabDoubleClick(tabId: string, event: MouseEvent) {
    event.preventDefault();

    if (!groupId) return;

    const anchor = stabilizeScroll && containerEl
      ? captureScrollAnchor(containerEl)
      : null;

    activeStateStore.setMarkedTab(groupId, tabId);

    if (anchor) {
      await tick();
      restoreScrollAnchor(anchor);
    }
  }

  /**
   * Handles click events specifically on the mark icon.
   * Stabilizes scroll position because syncing may change height of OTHER groups above.
   */
  async function handleMarkClick(tabId: string, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!groupId) return;

    const anchor = stabilizeScroll && containerEl
      ? captureScrollAnchor(containerEl)
      : null;

    activeStateStore.setMarkedTab(groupId, tabId);

    if (anchor) {
      await tick();
      restoreScrollAnchor(anchor);
    }
  }
</script>

<!-- Container for the tab group -->
<div class="cv-tabgroup-container" bind:this={containerEl}>
  <!-- Nav -->
  {#if tabs.length > 0 && navHeadingVisible}
    <ul class="cv-tabgroup-nav" role="tablist">
      {#each tabs as tab (tab.id)}
        {@const splitIds = splitTabIds(tab.rawId)}
        {@const isActive = splitIds.includes(localActiveTabId)}
        {@const isMarked = markedTab && splitIds.includes(markedTab)}
        <li class="cv-tabgroup-item">
          <div class="cv-tab-wrapper" class:active={isActive}>
            <a
              class="cv-tabgroup-link"
              href={'#' + tab.id}
              class:active={isActive}
              role="tab"
              aria-selected={isActive}
              onclick={(e) => handleTabClick(tab.id, e)}
              ondblclick={(e) => handleTabDoubleClick(tab.id, e)}
              title="Double-click a tab to 'mark' it in all similar tab groups."
              data-tab-id={tab.id}
              data-raw-tab-id={tab.rawId}
              data-group-id={groupId}
            >
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              <span class="cv-tab-header-text">{@html tab.header}</span>
            </a>
            <button
              type="button"
              class="cv-tab-marked-icon"
              class:is-marked={isMarked}
              title={isMarked ? "Unmark this tab" : "Mark this tab"}
              aria-label={isMarked ? "Unmark this tab" : "Mark this tab"}
              aria-pressed={!!isMarked}
              onclick={(e) => handleMarkClick(tab.id, e)}
              ondblclick={(e) => { e.stopPropagation(); }}
            >
              <IconMark {isMarked} />
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- Inject global stylesheets to support icons (FontAwesome, etc.) inside Shadow DOM -->
  {#each Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as link ((link as HTMLLinkElement).href)}
    <link rel="stylesheet" href={(link as HTMLLinkElement).href} />
  {/each}

  <!-- Content i.e. tab elements -->
  <div class="cv-tabgroup-content" bind:this={contentWrapper}>
    <slot></slot>
  </div>

  <div class="cv-tabgroup-bottom-border"></div>
</div>

<style>
  :host {
    display: block;
  }

  .cv-tabgroup-container {
    margin-bottom: 24px;
  }

  /* Tab navigation styles */
  ul.cv-tabgroup-nav {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-top: 0.5rem;
    margin-bottom: 0;
    list-style: none;
    border-bottom: 1px solid var(--cv-border, rgba(128, 128, 128, 0.3));
    align-items: stretch;
    gap: 0.5rem;
  }

  .cv-tabgroup-item {
    margin-bottom: -1px;
    list-style: none;
    display: flex;
    align-items: stretch;
  }

  .cv-tabgroup-link {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.75rem;
    color: inherit;
    opacity: 0.7;
    text-decoration: none;
    background-color: transparent !important;
    border: none;
    transition:
      opacity 0.15s ease-in-out,
      border-color 0.15s ease-in-out;
    cursor: pointer;
    min-height: 2.5rem;
    box-sizing: border-box;
    font-weight: 500;
  }

  .cv-tabgroup-link :global(p) {
    margin: 0;
    display: inline;
  }

  .cv-tabgroup-link:hover,
  .cv-tabgroup-link:focus {
    opacity: 1;
    border-bottom-color: var(--cv-border, rgba(128, 128, 128, 0.3));
    isolation: isolate;
  }

  .cv-tabgroup-link.active {
    opacity: 1;
    background-color: transparent !important;
  }

  .cv-tabgroup-link:focus {
    outline: 0;
  }

  .cv-tab-wrapper {
    display: flex;
    align-items: center;
    border-bottom: 2px solid transparent;
    transition: border-color 0.15s ease-in-out;
  }

  .cv-tab-wrapper:hover,
  .cv-tab-wrapper:focus-within {
    border-bottom-color: var(--cv-border, rgba(128, 128, 128, 0.3));
  }

  .cv-tab-wrapper.active {
    border-bottom-color: currentColor;
  }

  .cv-tab-header-text {
    line-height: 1;
  }

  .cv-tab-marked-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.15s ease-out;
    background: none;
    border: none;
    padding: 0 8px 0 0;
    margin: 0;
    cursor: pointer;
    color: inherit;
    height: 100%;
  }

  .cv-tab-wrapper:hover .cv-tab-marked-icon,
  .cv-tab-wrapper:focus-within .cv-tab-marked-icon,
  .cv-tab-marked-icon.is-marked {
    opacity: 1;
  }

  .cv-tab-marked-icon :global(svg) {
    vertical-align: middle;
    width: 14px;
    height: 14px;
  }

  .cv-tabgroup-bottom-border {
    border-bottom: 1px solid var(--cv-border, rgba(128, 128, 128, 0.3));
  }

  @media print {
    ul.cv-tabgroup-nav {
      display: none !important;
    }
  }
</style>
