// Polyfill Svelte Runes for testing Svelte 5
// Polyfill is a piece of code that is added to a program to make it work with a 
// different version of a library or framework.

// This is needed because Vitest is running in a Node.js environment, 
// which does not have Svelte Runes.

// @ts-expect-error - Polyfill for testing
globalThis.$state = (initial) => initial;

// @ts-expect-error - Polyfill for testing
globalThis.$derived = (fn) => (typeof fn === 'function' ? fn() : fn);
globalThis.$derived.by = (fn) => fn();
