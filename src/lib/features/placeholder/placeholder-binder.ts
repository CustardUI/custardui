/**
 * DOM Scanner for Variable Interpolation
 *
 * Scans the DOM for [[ variable_name ]] patterns and replaces them with
 * reactive spans that update when the variable store changes.
 */

// Regex to find [[ variable : fallback ]] or [[ variable ? truthy : falsy ]]
// Group 1: escape character (backslashes)
// Group 2: variable name (alphanumeric, underscores, hyphens)
// Group 3 (optional): * modifier — when present, conditional resolves any value (user OR registry default)
// Group 4 (optional): conditional truthy template (only when ? is present)
// Group 5 (optional): conditional falsy string (only when ? is present)
// Group 6 (optional): fallback value (only when : without ?)
export const VAR_REGEX = /(\\)?\[\[\s*([a-zA-Z0-9_-]+)(\*)?\s*(?:\?\s*(.*?)\s*:\s*(.*?)|:\s*(.*?))?\s*\]\]/g;
// Non-global version for stateless testing
const VAR_TESTER = /(\\)?\[\[\s*([a-zA-Z0-9_-]+)(\*)?\s*(?:\?\s*(.*?)\s*:\s*(.*?)|:\s*(.*?))?\s*\]\]/;

import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';
import { elementStore } from '$lib/stores/element-store.svelte';

export class PlaceholderBinder {
  /**
   * Scans the root element for text nodes containing variable placeholders.
   * Also scans for elements with .cv-bind or [data-cv-bind] to setup attribute bindings.
   */
  static scanAndHydrate(root: HTMLElement) {
    this.scanTextNodes(root);
    this.scanAttributeBindings(root);
  }

  /**
   * Updates attribute bindings for all elements participating in placeholder binding.
   * Specifically updates attributes on elements with [data-cv-attr-templates].
   * Text content is updated separately via <cv-placeholder> component reactivity.
   */
  static updateAll(values: Record<string, string>) {
    this.updateAttributeBindings(values);
  }

  // =========================================================================
  // Scanning Logic
  // =========================================================================

  private static scanTextNodes(root: HTMLElement) {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        // Skip script/style tags
        if (node.parentElement && ['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip existing placeholders to prevent observer loops
        if (node.parentElement && node.parentElement.tagName === 'CV-PLACEHOLDER') {
          return NodeFilter.FILTER_REJECT;
        }
        return VAR_TESTER.test(node.nodeValue || '')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    });

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text);
    }

    // Process nodes
    textNodes.forEach((node) => {
      PlaceholderBinder.processTextNode(node);
    });
  }

  private static scanAttributeBindings(root: HTMLElement) {
    // Attribute Scanning (Opt-in)
    const candidates = root.querySelectorAll('.cv-bind, [data-cv-bind]');
    candidates.forEach((el) => {
      if (el instanceof HTMLElement) {
        PlaceholderBinder.processElementAttributes(el);
      }
    });
  }

  private static processTextNode(textNode: Text) {
    const text = textNode.nodeValue || '';
    let match;
    let lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let hasMatch = false;

    // Reset regex state
    VAR_REGEX.lastIndex = 0;

    while ((match = VAR_REGEX.exec(text)) !== null) {
      hasMatch = true;
      const [fullMatch, escape, name, modifier, condTruthy, condFalsy, fallback] = match;
      const index = match.index;

      if (!name) continue;

      // Append text before match
      if (index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
      }

      if (escape) {
        // If escaped, append the text without the backslash
        // fullMatch matches '\[[...]]', slice(1) gives '[[...]]'
        fragment.appendChild(document.createTextNode(fullMatch.slice(1)));
      } else {
        // Create Placeholder Custom Element
        const el = document.createElement('cv-placeholder');
        el.setAttribute('name', name);
        if (condTruthy !== undefined) {
          el.setAttribute('truthy', condTruthy);
          el.setAttribute('falsy', condFalsy ?? '');
          if (modifier === '*') el.setAttribute('any-value', '');
        } else if (fallback !== undefined) {
          el.setAttribute('fallback', fallback);
        }
        fragment.appendChild(el);

        // Register detection
        elementStore.registerPlaceholder(name);
      }

      lastIndex = VAR_REGEX.lastIndex;
    }

    if (hasMatch) {
      // Append remaining text
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }
      textNode.replaceWith(fragment);
    }
  }

  private static processElementAttributes(el: HTMLElement) {
    if (el.dataset.cvAttrTemplates) return; // Already processed

    const templates: Record<string, string> = {};
    let hasBindings = false;

    // Iterate all attributes
    for (const attr of Array.from(el.attributes)) {
      // Skip system attributes and class (to avoid conflicts with dynamic class manipulation)
      if (
        attr.name === 'data-cv-bind' ||
        attr.name === 'data-cv-attr-templates' ||
        attr.name === 'class'
      ) {
        continue;
      }

      if (VAR_TESTER.test(attr.value)) {
        templates[attr.name] = attr.value;
        hasBindings = true;
      }
    }

    if (hasBindings) {
      el.dataset.cvAttrTemplates = JSON.stringify(templates);

      const matcher = new RegExp(VAR_REGEX.source, 'g');
      Object.values(templates).forEach((tmpl) => {
        matcher.lastIndex = 0; // Reset regex state for each template
        let match;
        while ((match = matcher.exec(tmpl)) !== null) {
          if (!match[1] && match[2]) {
            elementStore.registerPlaceholder(match[2]);
          }
        }
      });
    }
  }

  // =========================================================================
  // Update Logic
  // =========================================================================

  private static updateAttributeBindings(values: Record<string, string>) {
    const attrElements = document.querySelectorAll('[data-cv-attr-templates]');
    attrElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        try {
          const templates = JSON.parse(el.dataset.cvAttrTemplates || '{}');
          Object.entries(templates).forEach(([attrName, template]) => {
            const newValue = PlaceholderBinder.interpolateString(
              template as string,
              values,
              attrName,
            );
            el.setAttribute(attrName, newValue);
          });
        } catch (e) {
          console.warn('Failed to parse cv-attr-templates', e);
        }
      }
    });
  }

  /**
   * Checks if a value is a full URL with protocol
   * (e.g., http://, https://, ftp://, data:, mailto:)
   */
  private static isFullUrl(value: string): boolean {
    // Match protocol://... OR protocol: (for mailto:, data:, tel:, etc.)
    // Protocol must start with letter per RFC 3986
    return /^[a-z][a-z0-9+.-]*:/i.test(value);
  }

  /**
   * Checks if a value is a relative URL path (e.g., /, ./, ../)
   */
  private static isRelativeUrl(value: string): boolean {
    return value.startsWith('/') || value.startsWith('./') || value.startsWith('../');
  }

  /**
   * Resolves value for a placeholder using only user-set values (no registry defaults).
   * Returns undefined if the user has not explicitly set a non-empty value.
   *
   * Used by conditional syntax `[[name ? truthy : falsy]]` (without `*`) and
   * `<cv-toggle placeholder-id="name">` (without `*`).
   *
   * @param name - The placeholder name to resolve
   * @param values - Record of user-set placeholder values
   * @returns The user-set value, or undefined if not set
   */
  static resolveUserValue(name: string, values: Record<string, string>): string | undefined {
    const userVal = values[name];
    return userVal !== undefined && userVal !== '' ? userVal : undefined;
  }

  /**
   * Resolves value for a placeholder by checking and using sources in order of:
   * 1. user-set value, 2. registry default value, 3. inline fallback value
   *
   * Empty strings are treated as "not set" and will fall through to the next priority level.
   *
   * @param name - The placeholder name to resolve
   * @param fallback - Optional inline fallback value from the usage syntax (e.g., `[[ name : fallback ]]`)
   * @param values - Record of user-set placeholder values
   * @returns The resolved value, or undefined if no value is available from any source
   */
  static resolveValue(
    name: string,
    fallback: string | undefined,
    values: Record<string, string>,
  ): string | undefined {
    const userVal = values[name];

    // Look up registry definition
    const def = placeholderRegistryStore.get(name);
    const registryDefault = def?.defaultValue;

    if (userVal !== undefined && userVal !== '') {
      return userVal;
    } else if (fallback !== undefined) {
      return fallback;
    } else if (registryDefault !== undefined && registryDefault !== '') {
      return registryDefault;
    }
    return undefined;
  }

  /**
   * Interpolates placeholder patterns in a template string with their resolved values.
   *
   * Replaces all `[[ name ]]` or `[[ name : fallback ]]` patterns with their resolved values.
   * Escaped patterns (e.g., `\[[ name ]]`) are preserved as literal text.
   *
   * For `href` and `src` attributes, applies context-aware URL encoding:
   * - Full URLs (http://, https://, mailto:, data:, etc.) are preserved as-is
   * - Relative URLs (/, ./, ../) are preserved as-is
   * - URL components (query parameters, path segments) are encoded with encodeURIComponent
   *
   * @param template - The template string containing placeholder patterns
   * @param values - Record of user-set placeholder values
   * @param attrName - Optional attribute name (enables URL encoding for 'href' and 'src')
   * @returns The interpolated string with all placeholders replaced
   */
  private static interpolateString(
    template: string,
    values: Record<string, string>,
    attrName?: string,
  ): string {
    return template.replace(VAR_REGEX, (_full, escape, name, modifier, condTruthy, condFalsy, fallback) => {
      if (escape) return `[[${name}]]`;

      if (condTruthy !== undefined) {
        let val = modifier === '*'
          ? PlaceholderBinder.resolveValue(name, undefined, values)
          : PlaceholderBinder.resolveUserValue(name, values);
        if (val === undefined) return condFalsy ?? '';
        // URL-encode the value component (same as regular placeholders)
        if (attrName && (attrName === 'href' || attrName === 'src')) {
          if (!PlaceholderBinder.isFullUrl(val) && !PlaceholderBinder.isRelativeUrl(val)) {
            val = encodeURIComponent(val);
          }
        }
        return condTruthy.replace(/\$/g, () => val!);
      }

      let val = PlaceholderBinder.resolveValue(name, fallback, values);
      if (val === undefined) return `[[${name}]]`;

      // Context-aware encoding for URL attributes
      if (attrName && (attrName === 'href' || attrName === 'src')) {
        // Don't encode full URLs or relative URLs - only encode URL components
        if (!PlaceholderBinder.isFullUrl(val) && !PlaceholderBinder.isRelativeUrl(val)) {
          val = encodeURIComponent(val);
        }
      }

      return val;
    });
  }
}
