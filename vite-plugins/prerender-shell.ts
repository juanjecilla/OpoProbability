import type { Plugin } from 'vite';

import { productName, translations } from '../src/i18n/translations.js';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Static markup mirroring `SiteHeader.tsx` in its default state (es locale,
 * light theme). Injected into `#root` at build time so the LCP element
 * paints from the initial HTML response, before React ever runs. `main.tsx`
 * mounts with `createRoot` (not `hydrateRoot`), which replaces `#root`'s
 * children wholesale on first commit rather than diffing against them — so
 * this is a swapped placeholder, not a real hydration target, and can't
 * drift into a hydration-mismatch warning.
 */
function renderMastheadShell(): string {
  const t = translations.es;
  const themeLabel = escapeHtml(t.themeToggle.replace('{mode}', t.themeDark));
  const languageButtons = ['es', 'en']
    .map(
      (candidate) =>
        `<button type="button" class="segmented__button" aria-pressed="${candidate === 'es'}">${candidate.toUpperCase()}</button>`,
    )
    .join('');

  return `<div class="page"><article class="sheet"><header class="masthead">
  <div class="masthead__top">
    <div class="masthead__brand">
      <span class="masthead__logo" aria-hidden="true">
        <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true" fill="none">
          <rect x="3.5" y="3.5" width="33" height="33" rx="8" stroke="currentColor" stroke-width="2" />
          <path d="M9 27c3 0 4.5-4 7.5-9.5S21.5 8 24 8s3.5 3 4 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.9" />
          <circle cx="24" cy="8" r="2.6" fill="currentColor" />
          <path d="M9 31.5h22" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4" />
        </svg>
      </span>
      <div class="masthead__titles">
        <h1 class="masthead__wordmark">
          <span class="visually-hidden">${escapeHtml(t.appTitle)}</span>
          <span aria-hidden="true"><strong>${escapeHtml(productName.prefix)}</strong><span class="masthead__wordmark-tail">${escapeHtml(productName.suffix)}</span></span>
        </h1>
        <p class="masthead__tagline">${escapeHtml(t.tagline)}</p>
      </div>
    </div>
    <div class="masthead__actions">
      <div class="segmented" role="group" aria-label="${escapeHtml(t.languageLabel)}">${languageButtons}</div>
      <button type="button" class="icon-button" aria-label="${themeLabel}" title="${themeLabel}">
        <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.2A8 8 0 1 1 9.8 4 6.4 6.4 0 0 0 20 14.2z" fill="currentColor" />
        </svg>
      </button>
    </div>
  </div>
  <p class="masthead__subtitle">${escapeHtml(t.subtitle)}</p>
</header></article></div>`;
}

/**
 * Build-only plugin: inlines the built stylesheet into `<head>` (removes the
 * render-blocking CSS request) and injects a static masthead shell into
 * `#root` (removes the client-render delay for the page's LCP element).
 * Together these let the very first HTML response paint the fully-styled
 * hero without waiting on JS to download, parse and execute.
 */
export function prerenderShell(): Plugin {
  return {
    name: 'prerender-shell',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const assets = Object.values(bundle);
      const htmlFile = assets.find(
        (item) => item.type === 'asset' && item.fileName === 'index.html',
      );
      const cssFile = assets.find(
        (item) => item.type === 'asset' && item.fileName.endsWith('.css'),
      );

      if (!htmlFile || htmlFile.type !== 'asset' || typeof htmlFile.source !== 'string') {
        throw new Error('prerender-shell: could not find index.html in the build output');
      }

      let html = htmlFile.source;

      if (cssFile && cssFile.type === 'asset' && typeof cssFile.source === 'string') {
        const escapedFileName = cssFile.fileName.replaceAll(/[.*+?^${}()|[\]\\]/gu, '\\$&');
        const linkPattern = new RegExp(`<link[^>]*href="[^"]*${escapedFileName}"[^>]*>`, 'u');
        if (!linkPattern.test(html)) {
          throw new Error('prerender-shell: could not find the stylesheet <link> to inline');
        }
        html = html.replace(linkPattern, `<style>${cssFile.source}</style>`);
        delete bundle[cssFile.fileName];
      }

      const rootPattern = /<div id="root"><\/div>/u;
      if (!rootPattern.test(html)) {
        throw new Error('prerender-shell: could not find the empty #root div to fill');
      }
      html = html.replace(rootPattern, `<div id="root">${renderMastheadShell()}</div>`);

      htmlFile.source = html;
    },
  };
}
