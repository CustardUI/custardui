import { getScriptAttributes, fetchConfig } from '$lib/utils/init-utils';
import { initUIManager } from '$lib/app/ui-manager';
import { AppRuntime, type RuntimeOptions } from '$lib/runtime.svelte';
import { AdaptationManager } from '$features/adaptation/adaptation-manager';
import '$lib/registry';

// --- No Public API Exports ---
// The script auto-initializes via initializeFromScript().

/**
 * Initialize CustardUI from script tag attributes and config file
 * This runs automatically when the script is loaded.
 */
export function initializeFromScript(): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Idempotency check 
  if (window.__custardUIInitialized) {
    console.info('[CustardUI] Auto-init skipped: already initialized.');
    return;
  }

  document.addEventListener('DOMContentLoaded', async function () {
    if (window.__custardUIInitInProgress || window.__custardUIInitialized) return;
    window.__custardUIInitInProgress = true;
    try {
      // Get attributes from script tag
      const { baseURL, configPath } = getScriptAttributes();

      // Fetch Config first to retrieve storageKey prefix
      const configFile = await fetchConfig(configPath, baseURL);

      // Determine effective baseURL (data attribute takes precedence)
      const effectiveBaseURL = baseURL;

      // Initialize Adaptation early (before AppRuntime):
      // - Theme CSS injected ASAP (FOUC prevention)
      // - ?adapt= param cleaned before URLStateManager.parseURL() runs
      // - URL indicator set before AppRuntime so URL state is seeded correctly
      const adaptationConfig = await AdaptationManager.init(effectiveBaseURL, configFile.storageKey);
      if (adaptationConfig?.id) {
        AdaptationManager.rewriteUrlIndicator(adaptationConfig.id);
      }

      const coreOptions: RuntimeOptions = {
        configFile,
        rootEl: document.body,
        storageKey: configFile.storageKey,
        adaptationConfig,
      };

      const runtime = new AppRuntime(coreOptions);
      runtime.start();

      initUIManager(runtime, configFile);

      // Mark initialized
      window.__custardUIInitialized = true;
      window.__custardUIInitInProgress = false;
    } catch (error) {
      window.__custardUIInitInProgress = false;
      console.error('[CustardUI] Auto-initialization error:', error);
    }
  });
}

// Auto-run initialization logic when this file is evaluated
if (typeof window !== 'undefined') {
  initializeFromScript();
}
