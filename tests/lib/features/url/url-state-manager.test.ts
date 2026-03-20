/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

vi.mock('../../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte', () => ({
  placeholderRegistryStore: { get: vi.fn() },
}));

import { URLStateManager, FOCUS_PARAMS, MANAGED_PARAMS } from '../../../../src/lib/features/url/url-state-manager';
import { 
  PARAM_SHOW_TOGGLE, 
  PARAM_PEEK_TOGGLE, 
  PARAM_HIDE_TOGGLE, 
  PARAM_TABS, 
  PARAM_PH, 
  PARAM_CV_SHOW, 
  PARAM_CV_HIDE, 
  PARAM_CV_HIGHLIGHT 
} from '../../../../src/lib/features/url/url-constants';
import type { Config, State } from '../../../../src/lib/types/index';
import { placeholderRegistryStore } from '../../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte';

// --- Test Helpers ---

function setLocation(search: string) {
  (window as any).location.search = search;
  (window as any).location.href = 'http://localhost/' + (search.startsWith('?') ? '' : '?') + search;
}

function freshLocation() {
  delete (window as any).location;
  (window as any).location = {
    href: 'http://localhost/',
    search: '',
    pathname: '/',
    hash: '',
    origin: 'http://localhost',
  };
}

describe('URLStateManager', () => {
  afterEach(() => { vi.clearAllMocks(); });

  // ==========================================================================
  // parseURL
  // ==========================================================================
  describe('parseURL', () => {
    beforeEach(freshLocation);

    it('returns null when no managed params are present', () => {
      expect(URLStateManager.parseURL()).toBeNull();
    });

    it('returns null when only focus params are present', () => {
      setLocation(`?${PARAM_CV_SHOW}=elem1&${PARAM_CV_HIDE}=elem2`);
      expect(URLStateManager.parseURL()).toBeNull();
    });

    it(`parses ?${PARAM_SHOW_TOGGLE}=A,B into shownToggles`, () => {
      setLocation(`?${PARAM_SHOW_TOGGLE}=advanced,expert`);
      const result = URLStateManager.parseURL();
      expect(result).not.toBeNull();
      expect(result!.shownToggles).toEqual(['advanced', 'expert']);
    });

    it(`parses ?${PARAM_PEEK_TOGGLE}=C into peekToggles`, () => {
      setLocation(`?${PARAM_PEEK_TOGGLE}=intermediate`);
      const result = URLStateManager.parseURL();
      expect(result!.peekToggles).toEqual(['intermediate']);
    });

    it(`parses ?${PARAM_HIDE_TOGGLE}=D into hiddenToggles`, () => {
      setLocation(`?${PARAM_HIDE_TOGGLE}=secret`);
      const result = URLStateManager.parseURL();
      expect(result!.hiddenToggles).toEqual(['secret']);
    });

    it(`parses ?${PARAM_TABS}=g1:t1,g2:t2 into tabs record`, () => {
      setLocation(`?${PARAM_TABS}=os:linux,lang:python`);
      const result = URLStateManager.parseURL();
      expect(result!.tabs).toEqual({ os: 'linux', lang: 'python' });
    });

    it('splits tabs on first colon only', () => {
      setLocation(`?${PARAM_TABS}=grp:tab:with:colons`);
      const result = URLStateManager.parseURL();
      expect(result!.tabs).toEqual({ grp: 'tab:with:colons' });
    });

    it(`parses ?${PARAM_PH}=key:value and decodes encoded values`, () => {
      setLocation(`?${PARAM_PH}=language:Python%20Docs`);
      const result = URLStateManager.parseURL();
      expect(result!.placeholders).toEqual({ language: 'Python Docs' });
    });

    it('splits ph on first colon only', () => {
      setLocation(`?${PARAM_PH}=key:val%3Awith%3Acolons`);
      const result = URLStateManager.parseURL();
      expect(result!.placeholders).toEqual({ key: 'val:with:colons' });
    });

    it('parses all params together', () => {
      setLocation(`?${PARAM_SHOW_TOGGLE}=t1&${PARAM_PEEK_TOGGLE}=p1&${PARAM_HIDE_TOGGLE}=h1&${PARAM_TABS}=g1:tab1&${PARAM_PH}=myKey:Hello%20World`);
      const result = URLStateManager.parseURL();
      expect(result).not.toBeNull();
      expect(result!.shownToggles).toEqual(['t1']);
      expect(result!.peekToggles).toEqual(['p1']);
      expect(result!.hiddenToggles).toEqual(['h1']);
      expect(result!.tabs).toEqual({ g1: 'tab1' });
      expect(result!.placeholders).toEqual({ myKey: 'Hello World' });
    });

    it('ignores malformed tab entries without a colon', () => {
      setLocation(`?${PARAM_TABS}=malformed,g1:tab1`);
      const result = URLStateManager.parseURL();
      expect(result!.tabs).toEqual({ g1: 'tab1' });
    });

    it('ignores malformed ph entries without a colon', () => {
      setLocation(`?${PARAM_PH}=noColon,key:value`);
      const result = URLStateManager.parseURL();
      expect(result!.placeholders).toEqual({ key: 'value' });
    });
  });

  // ==========================================================================
  // round-trip: generateShareableURL + parseURL
  // ==========================================================================
  describe('round-trip (generateShareableURL → parseURL)', () => {
    beforeEach(freshLocation);

    it('encodes and then parses back to equivalent state', () => {
      const current: State = {
        shownToggles: ['A', 'B'],
        peekToggles: ['P1'],
        tabs: { os: 'linux' },
        placeholders: { myKey: 'Hello World' },
      };
      const config: Config = {
        toggles: [{ toggleId: 'A' }, { toggleId: 'B' }, { toggleId: 'P1' }, { toggleId: 'HIDDEN' }],
        tabGroups: [{ groupId: 'os', tabs: [{ tabId: 'linux' }] }],
        placeholders: [{ name: 'myKey' }],
      };
      const allIds = {
        toggles: ['A', 'B', 'P1', 'HIDDEN'],
        tabGroups: ['os'],
        placeholders: ['myKey'],
      };

      const shareUrl = URLStateManager.generateShareableURL(current, config, allIds);
      (window as any).location.search = new URL(shareUrl).search;
      const parsed = URLStateManager.parseURL();

      expect(parsed).not.toBeNull();
      expect(parsed!.shownToggles).toContain('A');
      expect(parsed!.shownToggles).toContain('B');
      expect(parsed!.peekToggles).toEqual(['P1']);
      expect(parsed!.hiddenToggles).toContain('HIDDEN');
      expect(parsed!.tabs).toEqual({ os: 'linux' });
      expect(parsed!.placeholders).toEqual({ myKey: 'Hello World' });
    });

    it('handles complex placeholder values with commas and colons', () => {
      const current: State = {
        placeholders: {
          key1: 'value,with,commas',
          key2: 'value:with:colons',
        },
      };

      const config: Config = {
        placeholders: [{ name: 'key1' }, { name: 'key2' }]
      };

      const shareUrl = URLStateManager.generateShareableURL(current, config, {
        toggles: [],
        tabGroups: [],
        placeholders: ['key1', 'key2'],
      });
      expect(shareUrl).toContain('key1:value%2Cwith%2Ccommas');
      expect(shareUrl).toContain('key2:value%3Awith%3Acolons');

      (window as any).location.search = new URL(shareUrl).search;
      const parsed = URLStateManager.parseURL();
      expect(parsed!.placeholders).toEqual(current.placeholders);
    });
  });

  // ==========================================================================
  // generateShareableURL  (absolute encoding)
  // ==========================================================================
  describe('generateShareableURL', () => {
    beforeEach(freshLocation);

    it('encodes all active toggles and explicitly hides the rest', () => {
      const config: Config = {
        toggles: [
          { toggleId: 'A' },
          { toggleId: 'NEW' },
          { toggleId: 'HIDDEN_DEFAULT' }
        ],
        tabGroups: [
          { groupId: 'g1', tabs: [{ tabId: 'tabA' }] }
        ]
      };
      const url = URLStateManager.generateShareableURL(
        { shownToggles: ['A', 'NEW'], peekToggles: [], tabs: { g1: 'tabA' } },
        config,
        { toggles: ['A', 'NEW', 'HIDDEN_DEFAULT'], tabGroups: ['g1'], placeholders: [] },
      );
      expect(url).toContain(`${PARAM_SHOW_TOGGLE}=A,NEW`);
      expect(url).toContain(`${PARAM_TABS}=g1:tabA`);
      expect(url).toContain(`${PARAM_HIDE_TOGGLE}=HIDDEN_DEFAULT`);
    });

    it('returns clean URL for null state', () => {
      setLocation(`?${PARAM_SHOW_TOGGLE}=t1`);
      const url = URLStateManager.generateShareableURL(null, {});
      expect(url).not.toContain(`${PARAM_SHOW_TOGGLE}=`);
    });

    it('preserves cv-show / cv-hide params', () => {
      setLocation(`?${PARAM_CV_SHOW}=el1`);
      
      const config: Config = { toggles: [{ toggleId: 't1', isLocal: false }] };
      const currentState: State = { shownToggles: ['t1'] };
      const elementsOnCurrentPage = { toggles: ['t1'], tabGroups: [], placeholders: [] };

      const url = URLStateManager.generateShareableURL(currentState, config, elementsOnCurrentPage);
      expect(url).toContain(`${PARAM_CV_SHOW}=el1`);
      expect(url).toContain(`${PARAM_SHOW_TOGGLE}=t1`);
    });

    it('preserves cv-highlight params', () => {
      setLocation(`?${PARAM_CV_HIGHLIGHT}=desc1`);
      const url = URLStateManager.generateShareableURL({}, {}, { toggles: [], tabGroups: [], placeholders: [] });
      expect(url).toContain(`${PARAM_CV_HIGHLIGHT}=desc1`);
    });
    it(`encodes ${PARAM_HIDE_TOGGLE} for all toggles not shown or peeked`, () => {
      const config: Config = { toggles: [{ toggleId: 'A' }, { toggleId: 'B' }] };
      const url = URLStateManager.generateShareableURL(
        { shownToggles: [], peekToggles: [] },
        config,
        { toggles: ['A', 'B'], tabGroups: [], placeholders: [] },
      );
      expect(url).toContain(`${PARAM_HIDE_TOGGLE}=A,B`);
      expect(url).not.toContain(`${PARAM_SHOW_TOGGLE}=`);
    });

    it('includes global (non-local) configurations even if not on page', () => {
      const config: Config = {
        toggles: [{ toggleId: 'globalToggle', isLocal: false }],
        tabGroups: [{ groupId: 'globalGroup', isLocal: false, tabs: [{ tabId: 't1' }] }],
        placeholders: [{ name: 'globalPH', isLocal: false }]
      };
      const state: State = {
        shownToggles: ['globalToggle'],
        tabs: { globalGroup: 't1' },
        placeholders: { globalPH: 'val1' }
      };
      // elementsOnCurrentPage is empty
      const url = URLStateManager.generateShareableURL(state, config, { toggles: [], tabGroups: [], placeholders: [] });
      
      expect(url).toContain(`${PARAM_SHOW_TOGGLE}=globalToggle`);
      expect(url).toContain(`${PARAM_TABS}=globalGroup:t1`);
      expect(url).toContain(`${PARAM_PH}=globalPH:val1`);
    });

    it('filters out local configurations if not on page', () => {
      const config: Config = {
        toggles: [{ toggleId: 'localToggle', isLocal: true }],
        tabGroups: [{ groupId: 'localGroup', isLocal: true, tabs: [{ tabId: 't1' }] }],
        placeholders: [{ name: 'localPH', isLocal: true }]
      };
      const state: State = {
        shownToggles: ['localToggle'],
        tabs: { localGroup: 't1' },
        placeholders: { localPH: 'val1' }
      };
      // Mock registry to return a local definition for localPH
      vi.mocked(placeholderRegistryStore.get).mockImplementation((name) => {
        if (name === 'localPH') return { name: 'localPH', isLocal: true };
        return undefined;
      });

      // elementsOnCurrentPage is empty
      const url = URLStateManager.generateShareableURL(state, config, { toggles: [], tabGroups: [], placeholders: [] });
      
      expect(url).not.toContain('localToggle');
      expect(url).not.toContain('localGroup');
      expect(url).not.toContain('localPH');
    });

    describe('generateShareableURL — siteManaged', () => {
      beforeEach(freshLocation);
      afterEach(() => { vi.clearAllMocks(); });

      it('excludes siteManaged: true entries from the URL', () => {
        vi.mocked(placeholderRegistryStore.get).mockImplementation((key) => {
          if (key === 'instName') return { name: 'instName', siteManaged: true };
          if (key === 'user') return { name: 'user', isLocal: false };
          return undefined;
        });

        const url = URLStateManager.generateShareableURL(
          { placeholders: { instName: 'NUS', user: 'Alice' } },
          {},
          { toggles: [], tabGroups: [], placeholders: ['instName', 'user'] }
        );

        expect(url).not.toContain('instName');
        expect(url).toContain('user:Alice');
      });

      it('includes normal (non-adaptation) placeholders in the URL', () => {
        vi.mocked(placeholderRegistryStore.get).mockReturnValue({ name: 'user', isLocal: false });

        const url = URLStateManager.generateShareableURL(
          { placeholders: { user: 'Alice' } },
          {},
          { toggles: [], tabGroups: [], placeholders: ['user'] }
        );

        expect(url).toContain('user:Alice');
      });

      it('excludes both tabgroup-derived and adaptation-only placeholders', () => {
        vi.mocked(placeholderRegistryStore.get).mockImplementation((key) => {
          if (key === 'fruit') return { name: 'fruit', source: 'tabgroup' };
          if (key === 'instName') return { name: 'instName', siteManaged: true };
          if (key === 'user') return { name: 'user', isLocal: false };
          return undefined;
        });

        const url = URLStateManager.generateShareableURL(
          { placeholders: { fruit: 'apple', instName: 'NUS', user: 'Alice' } },
          {},
          { toggles: [], tabGroups: [], placeholders: ['fruit', 'instName', 'user'] }
        );

        expect(url).not.toContain('fruit');
        expect(url).not.toContain('instName');
        expect(url).toContain('user:Alice');
      });
    });

    describe('robustness and injection prevention', () => {
      beforeEach(freshLocation);
      afterEach(() => { vi.clearAllMocks(); });

      it('strips unknown toggles that are not in config and not on page', () => {
        const config: Config = { toggles: [{ toggleId: 'known' }] };
        const state: State = { shownToggles: ['known', 'unknown_injected'] };
        const url = URLStateManager.generateShareableURL(state, config, { toggles: ['known'], tabGroups: [], placeholders: [] });
        
        expect(url).toContain(`${PARAM_SHOW_TOGGLE}=known`);
        expect(url).not.toContain('unknown_injected');
      });

      it('strips unknown tab groups that are not in config and not on page', () => {
        const config: Config = { tabGroups: [{ groupId: 'known', tabs: [{ tabId: 't1' }] }] };
        const state: State = { tabs: { known: 't1', unknown_injected: 'val' } };
        const url = URLStateManager.generateShareableURL(state, config, { toggles: [], tabGroups: ['known'], placeholders: [] });
        
        expect(url).toContain(`${PARAM_TABS}=known:t1`);
        expect(url).not.toContain('unknown_injected');
      });

      it('strips unknown placeholders that are not in registry and not on page', () => {
        vi.mocked(placeholderRegistryStore.get).mockImplementation((key) => 
          key === 'known' ? { name: 'known', isLocal: false } : undefined
        );

        const state: State = { placeholders: { known: 'val1', unknown_injected: 'val2' } };
        const url = URLStateManager.generateShareableURL(state, {}, { toggles: [], tabGroups: [], placeholders: ['known'] });
        
        expect(url).toContain(`${PARAM_PH}=known:val1`);
        expect(url).not.toContain('unknown_injected');
      });

      it('strips local elements if they are not on the current page', () => {
        const config: Config = { 
          toggles: [{ toggleId: 'localT', isLocal: true }],
          tabGroups: [{ groupId: 'localG', isLocal: true, tabs: [{ tabId: 't1' }] }]
        };
        vi.mocked(placeholderRegistryStore.get).mockImplementation((key) => 
          key === 'localP' ? { name: 'localP', isLocal: true } : undefined
        );

        const state: State = { 
          shownToggles: ['localT'], 
          tabs: { localG: 't1' },
          placeholders: { localP: 'val' }
        };
        // empty page elements
        const url = URLStateManager.generateShareableURL(state, config, { toggles: [], tabGroups: [], placeholders: [] });
        
        expect(url).not.toContain('localT');
        expect(url).not.toContain('localG');
        expect(url).not.toContain('localP');
      });
    });
  });

  // ==========================================================================
  // clearURL
  // ==========================================================================
  describe('clearURL', () => {
    beforeEach(() => {
      freshLocation();
      vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('clears all managed params but leaves focus params', () => {
      // Setup URL with both managed and focus params
      const managed = `${PARAM_SHOW_TOGGLE}=t1&${PARAM_TABS}=g1:tab1`;
      const focus = `${PARAM_CV_SHOW}=el1&${PARAM_CV_HIDE}=el2&${PARAM_CV_HIGHLIGHT}=hl1`;
      setLocation(`?${managed}&${focus}`);

      URLStateManager.clearURL();

      // Verify history.replaceState was called with a URL that only has focus params
      expect(window.history.replaceState).toHaveBeenCalled();
      const call = vi.mocked(window.history.replaceState).mock.calls[0]!;
      const resultUrl = new URL(call[2] as string, 'http://localhost');
      
      MANAGED_PARAMS.forEach(p => expect(resultUrl.searchParams.has(p)).toBe(false));
      FOCUS_PARAMS.forEach(p => expect(resultUrl.searchParams.has(p)).toBe(true));
    });

    it('does nothing if no managed params are present', () => {
      setLocation(`?${PARAM_CV_SHOW}=el1`);
      URLStateManager.clearURL();
      expect(window.history.replaceState).not.toHaveBeenCalled();
    });
  });
});

