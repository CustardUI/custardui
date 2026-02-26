/* eslint-disable @typescript-eslint/no-explicit-any */
// Polyfill Svelte Runes for testing Svelte 5
// Polyfill is a piece of code that is added to a program to make it work with a 
// different version of a library or framework.

// This is needed because Vitest is running in a Node.js environment, 
// which does not have Svelte Runes.

// Use `(globalThis as any)` to safely assign polyfills without TS2339 errors
// Add `any` type to parameters to prevent implicit-any errors in strict mode
(globalThis as any).$state = (initial: any) => initial;

(globalThis as any).$derived = (fn: any) => (typeof fn === 'function' ? fn() : fn);
(globalThis as any).$derived.by = (fn: any) => fn();
