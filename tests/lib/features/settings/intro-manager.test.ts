/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { IntroManager } from '../../../../src/lib/features/settings/intro-manager.svelte';
import type { PersistenceManager } from '../../../../src/lib/utils/persistence';

describe('IntroManager', () => {
  let introManager: IntroManager;
  let persistence: PersistenceManager;
  let calloutOptions: any;

  beforeEach(() => {
    persistence = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    } as unknown as PersistenceManager;

    calloutOptions = {
      show: true,
    };

    introManager = new IntroManager(persistence, calloutOptions);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should not show callout if not initialized with page elements', () => {
    introManager.init(false, true); // hasPageElements = false
    vi.advanceTimersByTime(2000);
    expect(introManager.showCallout).toBe(false);
  });

  it('should not show callout if settings disabled', () => {
    introManager.init(true, false); // settingsEnabled = false
    vi.advanceTimersByTime(2000);
    expect(introManager.showCallout).toBe(false);
  });

  it('should show callout after delay if requirements met', () => {
    introManager.init(true, true);

    expect(introManager.showCallout).toBe(false);
    vi.advanceTimersByTime(1100);
    expect(introManager.showCallout).toBe(true);
    expect(introManager.showPulse).toBe(true);
  });

  it('should not show if already persisted as shown', () => {
    (persistence.getItem as ReturnType<typeof vi.fn>).mockReturnValue('true');
    introManager = new IntroManager(persistence, calloutOptions);
    introManager.init(true, true);

    vi.advanceTimersByTime(1100);
    expect(introManager.showCallout).toBe(false);
  });

  it('should persist and hide on dismiss', () => {
    introManager.init(true, true);
    vi.advanceTimersByTime(1100);
    expect(introManager.showCallout).toBe(true);

    introManager.dismiss();

    expect(introManager.showCallout).toBe(false);
    expect(persistence.setItem).toHaveBeenCalledWith('cv-intro-shown', 'true');
  });
});
