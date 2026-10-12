import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Every WCAG success-criterion level axe-core can check automatically.
 * AAA compliance implies A and AA, so all three are scanned together.
 */
const WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag2aaa',
  'wcag21a',
  'wcag21aa',
  'wcag21aaa',
  'wcag22aa',
  'wcag22aaa',
];

async function setPreferences(page: Page, locale: 'es' | 'en', theme: 'light' | 'dark') {
  await page.addInitScript(
    ([localeValue, themeValue]) => {
      localStorage.setItem('opoprobability:locale', localeValue);
      localStorage.setItem('opoprobability:theme', themeValue);
    },
    [locale, theme],
  );
}

function scan(page: Page) {
  return new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
}

for (const locale of ['es', 'en'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`default view has no WCAG AAA violations (${locale}/${theme})`, async ({ page }) => {
      await setPreferences(page, locale, theme);
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      const results = await scan(page);
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }
}

test('manually-typed out-of-range field has no WCAG AAA violations', async ({ page }) => {
  await setPreferences(page, 'es', 'light');
  await page.goto('/');

  // Steppers can no longer reach an invalid state; typing directly still can.
  await page.locator('#field-P').fill('999');
  await expect(page.getByRole('alert')).toBeVisible();

  const results = await scan(page);
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test('custom target input, valid and invalid, has no WCAG AAA violations', async ({ page }) => {
  await setPreferences(page, 'es', 'light');
  await page.goto('/');

  await page.getByRole('button', { name: 'Personalizado' }).click();
  const customInput = page.getByLabel('Objetivo personalizado, en tanto por ciento');

  await customInput.fill('72');
  let results = await scan(page);
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

  await customInput.fill('0');
  await expect(page.getByRole('alert')).toBeVisible();
  results = await scan(page);
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test('expanded derivation drawer has no WCAG AAA violations', async ({ page }) => {
  await setPreferences(page, 'es', 'light');
  await page.goto('/');

  await page.locator('.working__summary').click();
  await expect(page.locator('.working__body')).toBeVisible();

  const results = await scan(page);
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

for (const locale of ['es', 'en'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`simulator after a draw has no WCAG AAA violations (${locale}/${theme})`, async ({
      page,
    }) => {
      await setPreferences(page, locale, theme);
      // "off" keeps the scan deterministic: no mid-animation colours.
      await page.addInitScript(() => {
        localStorage.setItem(
          'opoprobability:animations',
          JSON.stringify({ level: 'off', confetti: false, shake: false }),
        );
      });
      await page.goto('/simulacro/?N=60&k=4&P=40&d=2');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      await page.getByRole('button', { name: /^(Sortear|Draw)$/u }).click();
      await page.getByRole('button', { name: /^(Sortear 10 rondas|Draw 10 rounds)$/u }).click();

      const results = await scan(page);
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }
}

test('simulator confirm dialog has no WCAG AAA violations', async ({ page }) => {
  await setPreferences(page, 'es', 'light');
  await page.addInitScript(() => {
    localStorage.setItem(
      'opoprobability:animations',
      JSON.stringify({ level: 'off', confetti: false, shake: false }),
    );
  });
  await page.goto('/simulacro/?N=60&k=4&P=40&d=2');
  await page.getByRole('button', { name: 'Sortear', exact: true }).click();
  await page.getByRole('button', { name: 'Borrar todo el historial' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const results = await scan(page);
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});
