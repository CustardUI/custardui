/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount, unmount } from 'svelte';
import { focusStore } from '$features/focus/stores/focus-store.svelte';
import { showToast } from '$features/notifications/stores/toast-store.svelte';
import * as DomElementLocator from '$features/anchor';
import FocusDivider from '$features/focus/FocusDivider.svelte';
import { determineHiddenElements, isElementExcluded, calculateDividerGroups } from '../focus-logic';
import { SvelteSet } from 'svelte/reactivity';

import { HighlightService, BODY_HIGHLIGHT_CLASS } from '$features/highlight/services/highlight-service.svelte';
import { PARAM_CV_SHOW, PARAM_CV_HIDE, PARAM_CV_HIGHLIGHT } from '$features/url/url-constants';

const BODY_SHOW_CLASS = 'cv-show-mode';
const HIDDEN_CLASS = 'cv-hidden';
const SHOW_ELEMENT_CLASS = 'cv-show-element';

import { DEFAULT_EXCLUDED_IDS, DEFAULT_EXCLUDED_TAGS } from '$features/share/constants';
import type { ShareExclusions } from '$features/share/types';

export interface FocusServiceOptions {
  shareExclusions?: ShareExclusions;
}

export class FocusService {
  private hiddenElements = new SvelteSet<HTMLElement>();
  private dividers = new SvelteSet<any>(); // Store Svelte App instances
  private excludedTags: Set<string>;
  private excludedIds: Set<string>;
  // Call unsubscribe in destroy to stop svelte effects
  private unsubscribe: () => void;
  private highlightService: HighlightService;

  constructor(
    private rootEl: HTMLElement,
    options: FocusServiceOptions,
  ) {
    const userTags = options.shareExclusions?.tags || [];
    const userIds = options.shareExclusions?.ids || [];

    this.excludedTags = new SvelteSet(
      [...DEFAULT_EXCLUDED_TAGS, ...userTags].map((t) => t.toUpperCase()),
    );
    this.excludedIds = new SvelteSet([...DEFAULT_EXCLUDED_IDS, ...userIds]);

    this.highlightService = new HighlightService(this.rootEl);

    // Subscribe to store for exit signal
    this.unsubscribe = $effect.root(() => {
      // Store safety check (Store changes affect UI)
      $effect(() => {
        if (
          !focusStore.isActive &&
          (document.body.classList.contains(BODY_SHOW_CLASS) ||
            document.body.classList.contains(BODY_HIGHLIGHT_CLASS))
        ) {
          this.exitShowMode(true);
        }
      });
    });

    // Listen for popstate to re-evaluate URL actions
    window.addEventListener('popstate', this.handlePopState);
    
    // Initial evaluation
    this.applyModesFromUrl();
  }

  /**
   * Re-evaluate the URL when the browser's history changes
   */
  private handlePopState = () => {
    this.applyModesFromUrl();
  };

  /**
   * Reads the current URL and applies the appropriate focus/highlight mode
   */
  private applyModesFromUrl() {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const url = new URL(window.location.href);
    const showDescriptors = url.searchParams.get(PARAM_CV_SHOW);
    const hideDescriptors = url.searchParams.get(PARAM_CV_HIDE);
    const highlightDescriptors = url.searchParams.get(PARAM_CV_HIGHLIGHT);

    const hasAnyMode = showDescriptors || hideDescriptors || highlightDescriptors;

    if (!hasAnyMode) {
      if (
        document.body.classList.contains(BODY_SHOW_CLASS) ||
        document.body.classList.contains(BODY_HIGHLIGHT_CLASS)
      ) {
        this.exitShowMode(false);
      }
      return;
    }

    // Clear any existing active state once before re-applying
    if (
      document.body.classList.contains(BODY_SHOW_CLASS) ||
      document.body.classList.contains(BODY_HIGHLIGHT_CLASS)
    ) {
      this.exitShowMode(false);
    }

    // Pre-resolve highlight targets so show/hide modes can account for them
    const highlightTargets = highlightDescriptors
      ? this.highlightService.resolveTargets(highlightDescriptors)
      : [];

    // Apply show or hide (mutually exclusive with each other).
    // Pass highlight targets so they are kept visible in show mode / not hidden in hide mode.
    if (showDescriptors) {
      this.applyShowMode(showDescriptors, highlightTargets);
    } else if (hideDescriptors) {
      this.applyHideMode(hideDescriptors, highlightTargets);
    }

    // Call highlightService.applyEncodedHighlights() directly with the encoded descriptors
    // to skip applyHighlightMode()'s guard, which would otherwise see BODY_SHOW_CLASS
    // and clear the show mode above.
    if (highlightDescriptors) {
      this.highlightService.applyEncodedHighlights(highlightDescriptors);
    }
  }

  /**
   * Applies focus mode to the specified descriptors.
   * @param encodedDescriptors - The encoded descriptors to apply.
   */
  public applyShowMode(encodedDescriptors: string, keepTargets: HTMLElement[] = []): void {
    // Check if we are already in the right state to avoid re-rendering loops if feasible
    if (
      document.body.classList.contains(BODY_SHOW_CLASS) ||
      document.body.classList.contains(BODY_HIGHLIGHT_CLASS)
    ) {
      // If we are already active, we might want to check if descriptors changed?
      // For now, simple clear and re-apply.
      this.exitShowMode(false); // don't clear URL here
    }

    const descriptors = DomElementLocator.deserialize(encodedDescriptors);
    if (!descriptors || descriptors.length === 0) return;

    // Resolve anchors to DOM elements
    const targets: HTMLElement[] = [];
    descriptors.forEach((desc) => {
      const matchingEls = DomElementLocator.resolve(this.rootEl, desc);
      if (matchingEls && matchingEls.length > 0) {
        targets.push(...matchingEls);
      }
    });

    if (targets.length === 0) {
      showToast('Some shared sections could not be found.');
      this.exitShowMode(); // Clears URL and resets state, preventing effect loop
      return;
    }

    if (targets.length < descriptors.length) {
      showToast('Some shared sections could not be found.');
    }

    // Activate Store
    focusStore.setIsActive(true);
    document.body.classList.add(BODY_SHOW_CLASS);

    // Merge keepTargets (e.g. highlight targets) so they are not hidden by show mode
    this.renderShowView([...targets, ...keepTargets]);
  }

  public applyHideMode(encodedDescriptors: string, excludeTargets: HTMLElement[] = []): void {
    if (
      document.body.classList.contains(BODY_SHOW_CLASS) ||
      document.body.classList.contains(BODY_HIGHLIGHT_CLASS)
    ) {
      this.exitShowMode(false);
    }

    const descriptors = DomElementLocator.deserialize(encodedDescriptors);
    if (!descriptors || descriptors.length === 0) return;

    const targets: HTMLElement[] = [];
    descriptors.forEach((desc) => {
      const matchingEls = DomElementLocator.resolve(this.rootEl, desc);
      if (matchingEls && matchingEls.length > 0) {
        targets.push(...matchingEls);
      }
    });

    if (targets.length === 0) {
      showToast('Some shared sections could not be found.');
      this.exitShowMode(); // Clears URL and resets state
      return;
    }

    if (targets.length < descriptors.length) {
      showToast('Some shared sections could not be found.');
    }

    // Activate Store
    focusStore.setIsActive(true);
    document.body.classList.add(BODY_SHOW_CLASS);

    // Exclude highlight targets from being hidden so they stay visible
    const excludeSet = new Set(excludeTargets);
    const filteredTargets = excludeTargets.length > 0
      ? targets.filter((t) => !excludeSet.has(t))
      : targets;

    this.renderHiddenView(filteredTargets);
  }

  public applyHighlightMode(encodedDescriptors: string): void {
    if (
      document.body.classList.contains(BODY_SHOW_CLASS) ||
      document.body.classList.contains(BODY_HIGHLIGHT_CLASS)
    ) {
      this.exitShowMode(false);
    }
    this.highlightService.applyEncodedHighlights(encodedDescriptors);
  }

  private renderHiddenView(targets: HTMLElement[]): void {
    // 1. Mark targets as hidden
    targets.forEach((t) => {
      t.classList.add(HIDDEN_CLASS);
      this.hiddenElements.add(t);
    });

    // 2. Insert Dividers
    const processedContainers = new SvelteSet<HTMLElement>();
    targets.forEach((el) => {
      const parent = el.parentElement;
      if (parent && !processedContainers.has(parent)) {
        this.insertDividersForContainer(parent);
        processedContainers.add(parent);
      }
    });
  }

  private renderShowView(targets: HTMLElement[]): void {
    // 1. Mark targets
    targets.forEach((t) => t.classList.add(SHOW_ELEMENT_CLASS));

    // 2. Determine what to hide
    const elementsToHide = determineHiddenElements(targets, document.body, (el) =>
      isElementExcluded(el, {
        hiddenElements: this.hiddenElements,
        excludedTags: this.excludedTags,
        excludedIds: this.excludedIds,
      }),
    );

    // 3. Apply changes (Hide & Track)
    elementsToHide.forEach((el) => {
      el.classList.add(HIDDEN_CLASS);
      this.hiddenElements.add(el);
    });

    // 4. Identify Elements to Keep Visible (Targets + Ancestors)
    // We still need this for divider insertion optimization?
    // Actually insertDividersForContainer uses processedContainers logic.
    const keepVisible = new SvelteSet<HTMLElement>();
    targets.forEach((t) => {
      let curr: HTMLElement | null = t;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        keepVisible.add(curr);
        curr = curr.parentElement;
      }
    });

    // 5. Insert Dividers
    const processedContainers = new SvelteSet<HTMLElement>();
    keepVisible.forEach((el) => {
      const parent = el.parentElement;
      if (parent && !processedContainers.has(parent)) {
        this.insertDividersForContainer(parent);
        processedContainers.add(parent);
      }
    });
  }

  private insertDividersForContainer(container: HTMLElement): void {
    const children = Array.from(container.children) as HTMLElement[];
    const isHidden = (el: HTMLElement) => el.classList.contains(HIDDEN_CLASS);

    const groups = calculateDividerGroups(children, isHidden);

    groups.forEach((group) => {
      // Insert the divider before first hidden element of the group.
      this.createDivider(container, group.startNode, group.count);
    });
  }

  private createDivider(container: HTMLElement, insertBeforeEl: HTMLElement, count: number): void {
    const wrapper = document.createElement('div');
    wrapper.className = 'cv-divider-wrapper';
    container.insertBefore(wrapper, insertBeforeEl);

    const app = mount(FocusDivider, {
      target: wrapper,
      props: {
        hiddenCount: count,
        onExpand: () => {
          this.expandContext(insertBeforeEl, count, app, wrapper);
        },
      },
    });

    this.dividers.add(app);
  }

  private expandContext(firstHidden: HTMLElement, count: number, app: any, wrapper: HTMLElement) {
    let curr: Element | null = firstHidden;
    let expanded = 0;

    while (curr && expanded < count) {
      if (curr instanceof HTMLElement && curr.classList.contains(HIDDEN_CLASS)) {
        curr.classList.remove(HIDDEN_CLASS);
        this.hiddenElements.delete(curr);
      }
      curr = curr.nextElementSibling;
      expanded++;
    }

    // Cleanup
    unmount(app);
    this.dividers.delete(app);
    wrapper.remove();

    // If no more hidden elements, exit completely
    if (this.hiddenElements.size === 0) {
      focusStore.exit();
    }
  }

  public exitShowMode(updateUrl = true): void {
    document.body.classList.remove(BODY_SHOW_CLASS, BODY_HIGHLIGHT_CLASS);

    this.hiddenElements.forEach((el) => el.classList.remove(HIDDEN_CLASS));
    this.hiddenElements.clear();

    // Remove dividers
    this.dividers.forEach((app) => unmount(app));
    this.dividers.clear();

    // Remove wrappers?
    document.querySelectorAll('.cv-divider-wrapper').forEach((el) => el.remove());

    // Remove styling from targets
    const targets = document.querySelectorAll(`.${SHOW_ELEMENT_CLASS}`);
    targets.forEach((t) => t.classList.remove(SHOW_ELEMENT_CLASS));

    this.highlightService.exit();

    if (focusStore.isActive) {
      focusStore.setIsActive(false);
    }

    if (updateUrl) {
      // eslint-disable-next-line svelte/prefer-svelte-reactivity
      const url = new URL(window.location.href);
      let changed = false;
      if (url.searchParams.has(PARAM_CV_SHOW)) {
        url.searchParams.delete(PARAM_CV_SHOW);
        changed = true;
      }
      if (url.searchParams.has(PARAM_CV_HIDE)) {
        url.searchParams.delete(PARAM_CV_HIDE);
        changed = true;
      }
      if (url.searchParams.has(PARAM_CV_HIGHLIGHT)) {
        url.searchParams.delete(PARAM_CV_HIGHLIGHT);
        changed = true;
      }
      if (changed) {
         window.history.replaceState({}, '', url.toString());
      }
    }
  }

  public destroy() {
    this.exitShowMode();
    this.unsubscribe();
    window.removeEventListener('popstate', this.handlePopState);
  }
}
