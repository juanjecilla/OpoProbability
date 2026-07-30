#!/usr/bin/env node
/**
 * Runs Lighthouse's accessibility category against the production build.
 *
 * Complements `e2e/a11y.spec.ts`: axe-core covers WCAG A/AA/AAA success
 * criteria directly, while Lighthouse's accessibility audits are a second,
 * differently-implemented automated pass over the same rendered DOM.
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const PORT = 4174;
const URL = `http://localhost:${PORT}/`;
const OUT_DIR = path.join(import.meta.dirname, '..', 'reports', 'lighthouse');

function startPreviewServer() {
  return spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'ignore',
  });
}

async function waitForServer(url, timeoutMs = 20_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Not up yet.
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

async function run() {
  const server = startPreviewServer();
  try {
    await waitForServer(URL);

    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] });
    try {
      const result = await lighthouse(URL, {
        port: chrome.port,
        onlyCategories: ['accessibility'],
        output: 'json',
      });

      await mkdir(OUT_DIR, { recursive: true });
      await writeFile(path.join(OUT_DIR, 'report.json'), result.report);

      const { score } = result.lhr.categories.accessibility;
      const percent = Math.round(score * 100);
      console.log(`Lighthouse accessibility score: ${percent}/100`);

      const failedAudits = Object.values(result.lhr.audits).filter(
        (audit) => audit.score !== null && audit.score < 1 && audit.scoreDisplayMode === 'binary',
      );

      if (failedAudits.length > 0) {
        console.log('\nFailed audits:');
        for (const audit of failedAudits) {
          console.log(`- ${audit.title}`);
        }
      }

      console.log(`\nFull report: ${path.join(OUT_DIR, 'report.json')}`);

      if (score < 1) {
        process.exitCode = 1;
      }
    } finally {
      await chrome.kill();
    }
  } finally {
    server.kill();
  }
}

await run();
