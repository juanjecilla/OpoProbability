import { expect, test, type Page } from '@playwright/test';

/**
 * Records every stylesheet request. A missing file must not slip through:
 * `vite preview` answers it with an HTML fallback (200) where the real host
 * answers 404, so the status alone proves nothing: check the content type.
 */
function trackStylesheets(page: Page) {
  const bad: string[] = [];
  page.on('response', (response) => {
    if (!new URL(response.url()).pathname.endsWith('.css')) return;
    const type = response.headers()['content-type'] ?? '';
    if (!response.ok() || !type.startsWith('text/css')) bad.push(`${response.url()} (${type})`);
  });
  return bad;
}

/** Headless Chrome defaults to English; the locators below are Spanish. */
async function useSpanish(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('opoprobability:locale', 'es');
  });
}

/**
 * Regression: the built site went blank because lazy chunks preloaded a
 * stylesheet the build had deleted. Lazy sections only appear if that works.
 */
test('calculator renders its lazy sections with no page errors', async ({ page }) => {
  await useSpanish(page);
  const errors: string[] = [];
  const badStylesheets = trackStylesheets(page);
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/?N=60&k=4&P=40&d=2');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Below-the-fold content that only exists once the lazy chunks have loaded.
  await expect(page.getByRole('heading', { name: 'La probabilidad, tabulada' })).toBeVisible();
  expect(errors).toEqual([]);
  expect(badStylesheets).toEqual([]);
});

test('simulator renders with no page errors', async ({ page }) => {
  await useSpanish(page);
  const errors: string[] = [];
  const badStylesheets = trackStylesheets(page);
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/simulacro/?N=60&k=4&P=40&d=2');

  await expect(page.getByRole('button', { name: 'Sortear', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  expect(badStylesheets).toEqual([]);
});
