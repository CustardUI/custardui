import { prependBaseUrl } from './url-utils';
import type { ConfigFile } from '$lib/types/index';

export interface ScriptAttributes {
  baseURL: string;
  configPath: string;
}

const SCRIPT_ATTRIBUTE_DEFAULTS: ScriptAttributes = {
  baseURL: '/',
  configPath: '/custardui.config.json',
};

const FALLBACK_CONFIG: ConfigFile = {
  config: {},
  settings: { enabled: false },
};

/**
 * Finds the script tag that loaded the library and extracts configuration attributes.
 * Looks for `data-base-url` and `data-config-path`.
 */
export function getScriptAttributes(): ScriptAttributes {
  const scriptTag = findScriptTag();
  if (!scriptTag) return SCRIPT_ATTRIBUTE_DEFAULTS;

  return {
    baseURL: scriptTag.getAttribute('data-base-url') || SCRIPT_ATTRIBUTE_DEFAULTS.baseURL,
    configPath: scriptTag.getAttribute('data-config-path') || SCRIPT_ATTRIBUTE_DEFAULTS.configPath,
  };
}

function findScriptTag(): HTMLScriptElement | null {
  const current = document.currentScript as HTMLScriptElement | null;
  if (current?.hasAttribute('data-base-url')) return current;

  const byAttr = document.querySelector('script[data-base-url]') as HTMLScriptElement | null;
  if (byAttr) return byAttr;

  // Fallback: find script by src pattern
  for (const script of document.scripts) {
    if (/(?:custard(?:ui)?|@custardui\/custard(?:ui)?)(?:\.min)?\.(?:esm\.)?js($|\?)/i.test(script.src)) {
      return script as HTMLScriptElement;
    }
  }

  return null;
}

/**
 * Fetches and parses the configuration file.
 * Returns the fallback config silently if the file is not found (404),
 * since operating without a config file is a valid use case.
 */
export async function fetchConfig(configPath: string, baseURL: string): Promise<ConfigFile> {
  try {
    const fullConfigPath = prependBaseUrl(configPath, baseURL);
    const response = await fetch(fullConfigPath);

    if (!response.ok) return FALLBACK_CONFIG;

    const text = await response.text();
    if (!text.trim()) return FALLBACK_CONFIG;

    return JSON.parse(text);
  } catch (error) {
    console.error('[CustardUI] Error loading config file:', error);
    return FALLBACK_CONFIG;
  }
}
