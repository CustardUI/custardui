import { getScriptAttributes, fetchConfig } from '$lib/utils/init-utils';
import { initUIManager } from '$lib/app/ui-manager';
import { AppRuntime, type RuntimeOptions } from '$lib/runtime.svelte';
import { AssetsManager } from '$features/render/assets';
import type { CustomViewAsset } from '$lib/types/index';
import { prependBaseUrl } from '$lib/utils/url-utils';
import { AdaptationManager } from '$features/adaptation/adaptation-manager';
import '$lib/registry';

// --- No Public API Exports ---
// The script auto-initializes via initializeFromScript().

/**
 * Initialize CustomViews from script tag attributes and config file
 * This runs automatically when the script is loaded.
 */
export function initializeFromScript(): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Idempotency check 
  if (window.__custardInitialized) {
    console.info('[CustardUI] Auto-init skipped: already initialized.');
    return;
  }

  document.addEventListener('DOMContentLoaded', async function () {
    if (window.__custardInitInProgress || window.__custardInitialized) return;
    window.__custardInitInProgress = true;
    try {
      // Get attributes from script tag
      const { baseURL, configPath } = getScriptAttributes();

      // Fetch Config first to retrieve storageKey prefix
      const configFile = await fetchConfig(configPath, baseURL);

      // Determine effective baseURL (data attribute takes precedence)
      const effectiveBaseURL = baseURL || configFile.baseUrl || '';

      // Initialize Adaptation early (before AppRuntime):
      // - Theme CSS injected ASAP (FOUC prevention)
      // - ?adapt= param cleaned before URLStateManager.parseURL() runs
      // - URL indicator set before AppRuntime so URL state is seeded correctly
      const adaptationConfig = await AdaptationManager.init(effectiveBaseURL, configFile.storageKey);
      if (adaptationConfig?.id) {
        AdaptationManager.rewriteUrlIndicator(adaptationConfig.id);
      }

      // Initialize Assets
      let assetsManager: AssetsManager;
      if (configFile.assetsJsonPath) {
        const assetsPath = prependBaseUrl(configFile.assetsJsonPath, effectiveBaseURL);
        try {
          const assetsJson: Record<string, CustomViewAsset> = await (
            await fetch(assetsPath)
          ).json();
          assetsManager = new AssetsManager(assetsJson, effectiveBaseURL);
        } catch (error) {
          console.error(`[Custard] Failed to load assets JSON from ${assetsPath}:`, error);
          assetsManager = new AssetsManager({}, effectiveBaseURL);
        }
      } else {
        assetsManager = new AssetsManager({}, effectiveBaseURL);
      }

      const coreOptions: RuntimeOptions = {
        assetsManager,
        configFile,
        rootEl: document.body,
        storageKey: configFile.storageKey,
        adaptationConfig,
      };

      const runtime = new AppRuntime(coreOptions);
      runtime.start();

      initUIManager(runtime, configFile);

      // Mark initialized
      window.__custardInitialized = true;
      window.__custardInitInProgress = false;
    } catch (error) {
      window.__custardInitInProgress = false;
      console.error('[CustardUI] Auto-initialization error:', error);
    }
  });
}

// Auto-run initialization logic when this file is evaluated
if (typeof window !== 'undefined') {
  initializeFromScript();
}
