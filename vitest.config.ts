import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync } from 'fs';
import path from 'path';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    tsconfigPaths({ projects: ['./tsconfig.test.json'] }),
    svelte({ hot: !process.env.VITEST }),
  ],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      $features: path.resolve('./src/lib/features'),
      $ui: path.resolve('./src/lib/components/ui'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true, // If using globals like describe, it, expect
    setupFiles: ['./tests/setup.ts'],
  },
});
