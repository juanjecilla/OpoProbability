import react from '@vitejs/plugin-react';
// Imported from `vitest/config` rather than `vite` so the `test` block is typed.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // La app se sirve desde https://juanjecilla.github.io/OpoProbability/
  base: '/OpoProbability/',
  test: {
    coverage: {
      provider: 'v8',
      // Solo se mide el motor: la UI no tiene tests por decisión de alcance.
      include: ['src/lib/**'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
});
