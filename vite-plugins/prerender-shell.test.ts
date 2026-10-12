import type { Plugin } from 'vite';
import { describe, expect, it } from 'vitest';

import { prerenderShell } from './prerender-shell';

const CSS = 'assets/styles-abc123.css';

const html = (entry: string) =>
  `<!doctype html><html><head><link rel="stylesheet" crossorigin href="/${CSS}"></head>` +
  `<body><div id="root"></div><script type="module" src="/assets/${entry}.js"></script></body></html>`;

/** Shaped like the real build: two pages sharing one stylesheet that lazy chunks preload. */
function fakeBundle(): Record<string, unknown> {
  return {
    'index.html': { type: 'asset', fileName: 'index.html', source: html('main') },
    'simulacro/index.html': {
      type: 'asset',
      fileName: 'simulacro/index.html',
      source: html('simulacro'),
    },
    [CSS]: { type: 'asset', fileName: CSS, source: 'body{margin:0}' },
    'assets/main.js': {
      type: 'chunk',
      fileName: 'assets/main.js',
      // Vite's preload helper lists the stylesheet a lazy import depends on.
      code: `const deps=["${CSS}"];import('./ProbabilityCurve.js');`,
    },
  };
}

function runPlugin(bundle: Record<string, unknown>) {
  const hook = (prerenderShell() as Plugin & { generateBundle: (...args: unknown[]) => void })
    .generateBundle;
  hook.call({}, {}, bundle);
  return bundle as Record<string, { source?: string; code?: string }>;
}

describe('prerenderShell', () => {
  it('inlines the shared stylesheet into every page', () => {
    const bundle = runPlugin(fakeBundle());

    expect(bundle['index.html']?.source).toContain('<style>body{margin:0}</style>');
    expect(bundle['simulacro/index.html']?.source).toContain('<style>body{margin:0}</style>');
  });

  it('keeps every stylesheet that a chunk still preloads', () => {
    const bundle = runPlugin(fakeBundle());

    const referenced = Object.values(bundle).flatMap((item) =>
      item.code ? (item.code.match(/assets\/[\w-]+\.css/gu) ?? []) : [],
    );
    expect(referenced).toEqual([CSS]);
    for (const file of referenced) expect(bundle).toHaveProperty([file]);
  });
});
