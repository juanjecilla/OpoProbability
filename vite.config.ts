import react from '@vitejs/plugin-react';
// Imported from `vitest/config` rather than `vite` so the `test` block is typed.
import { defineConfig } from 'vitest/config';

import { prerenderShell } from './vite-plugins/prerender-shell.js';

export default defineConfig({
  plugins: [react(), prerenderShell()],
  // The app is served from https://opoprobabilidad.com
  base: '/',
  test: {
    // Playwright owns e2e/: its own test() would otherwise collide with Vitest's.
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      // Only the engine is measured: the UI has no tests by scope decision.
      include: ['src/lib/**'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
});
