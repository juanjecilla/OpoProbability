import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const EXAM = 'N=10&k=3&P=4&d=1';

/** Spanish UI, no animation: keeps locators and colours deterministic. */
async function prepare(page: Page, theme: 'light' | 'dark' = 'light') {
  await page.addInitScript((themeValue) => {
    localStorage.setItem('opoprobability:locale', 'es');
    localStorage.setItem('opoprobability:theme', themeValue);
    localStorage.setItem(
      'opoprobability:animations',
      JSON.stringify({ level: 'off', confetti: false, shake: false }),
    );
  }, theme);
}

async function openTopics(page: Page) {
  await page.locator('.topics__summary').click();
  await expect(page.locator('.topics__body')).toBeVisible();
}

async function useMyTopics(page: Page) {
  await openTopics(page);
  await page.locator('.seg__label', { hasText: 'Mis temas' }).click();
}

const tallyRounds = (page: Page) =>
  page.locator('.tally__item', { hasText: 'Rondas' }).locator('dd');

test('marking topics drives P and is kept when N shrinks and grows', async ({ page }) => {
  await prepare(page);
  await page.goto(`/?${EXAM}`);
  await useMyTopics(page);

  // Seeded with 1..P.
  await expect(page.locator('#field-P')).toHaveValue('4');
  await expect(page.locator('#field-P')).toHaveJSProperty('readOnly', true);

  await page.getByRole('button', { name: 'Tema 10', exact: true }).click();
  await expect(page.locator('#field-P')).toHaveValue('5');

  await page.locator('#field-N').fill('8');
  await expect(page.locator('#field-P')).toHaveValue('4');

  await page.locator('#field-N').fill('10');
  await expect(page.locator('#field-P')).toHaveValue('5');
});

test('bulk tools and the range box edit the map', async ({ page }) => {
  await prepare(page);
  await page.goto(`/?${EXAM}`);
  await useMyTopics(page);

  await page.getByRole('button', { name: 'Ninguno' }).click();
  await expect(page.locator('#field-P')).toHaveValue('0');

  await page.getByLabel('Marcar por rango').fill('2-4, 9');
  await page.getByRole('button', { name: 'Marcar', exact: true }).click();
  await expect(page.locator('#field-P')).toHaveValue('4');

  await page.getByLabel('Marcar por rango').fill('99');
  await page.getByRole('button', { name: 'Marcar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('1 al 10');

  await page.getByRole('button', { name: 'Invertir' }).click();
  await expect(page.locator('#field-P')).toHaveValue('6');
});

test('arrow keys move between topic chips', async ({ page }) => {
  await prepare(page);
  await page.goto(`/?${EXAM}`);
  await useMyTopics(page);

  await page.getByRole('button', { name: 'Tema 1', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Tema 2', exact: true })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByRole('button', { name: 'Tema 10', exact: true })).toBeFocused();
});

test('a huge syllabus gets no chip grid', async ({ page }) => {
  await prepare(page);
  await page.goto('/?N=1000&k=3&P=4&d=1');
  await useMyTopics(page);

  await expect(page.locator('.topic-chip')).toHaveCount(0);
  await expect(page.getByLabel('Marcar por rango')).toBeVisible();
});

test('the result CTA plays exactly 100 rounds and drops the request from the URL', async ({
  page,
}) => {
  await prepare(page);
  await page.goto(`/?${EXAM}`);

  await page.getByRole('link', { name: 'Simular 100 sorteos →' }).click();
  await expect(tallyRounds(page)).toHaveText('100');
  await expect(page).not.toHaveURL(/run=/u);

  await page.reload();
  // A reload starts empty: the request is gone, so nothing is replayed.
  await expect(tallyRounds(page)).toHaveText('0');
});

test('entry points differ: quiet link in inputs, primary CTA under the result', async ({
  page,
}) => {
  await prepare(page);
  await page.goto(`/?${EXAM}`);

  await expect(page.locator('.sim-link a')).toHaveCount(1);
  await expect(page.locator('.cta a.button--primary')).toHaveCount(1);
  await expect(page.locator('.cta__title')).toContainText('de éxito');
});

test('switching source or editing the map starts a new Session', async ({ page }) => {
  await prepare(page);
  await page.goto(`/simulacro/?${EXAM}`);

  await page.getByRole('button', { name: 'Sortear 10 rondas' }).click();
  await expect(tallyRounds(page)).toHaveText('10');

  await useMyTopics(page);
  await expect(tallyRounds(page)).toHaveText('0');

  await page.getByRole('button', { name: 'Sortear 10 rondas' }).click();
  await expect(tallyRounds(page)).toHaveText('10');

  await page.getByRole('button', { name: 'Tema 10', exact: true }).click();
  await expect(tallyRounds(page)).toHaveText('0');
});

test('a Session drawn from an older map cannot be resumed', async ({ page }) => {
  await prepare(page);
  await page.goto(`/simulacro/?${EXAM}`);
  await useMyTopics(page);

  await page.getByRole('button', { name: 'Sortear 10 rondas' }).click();
  await page.getByRole('button', { name: 'Tema 10', exact: true }).click();

  await expect(page.getByRole('button', { name: 'Retomar' })).toBeDisabled();
  await expect(page.locator('.session__blocked')).toBeVisible();

  await page.getByRole('button', { name: 'Tema 10', exact: true }).click(); // back to the snapshot
  await expect(page.getByRole('button', { name: 'Retomar' })).toBeEnabled();
});

/**
 * Regression: the global `a:hover` colour beat `.button--primary`, so the label
 * took the colour of the button's own background while hovered or pressed.
 */
const ON_PRIMARY = { light: 'rgb(255, 255, 255)', dark: 'rgb(18, 35, 58)' } as const;

for (const theme of ['light', 'dark'] as const) {
  test(`primary CTA keeps a readable label on hover and press (${theme})`, async ({ page }) => {
    await prepare(page, theme);
    await page.goto(`/?${EXAM}`);
    const cta = page.getByRole('link', { name: 'Simular 100 sorteos →' });

    await expect(cta).toHaveCSS('color', ON_PRIMARY[theme]);
    await cta.hover();
    await expect(cta).toHaveCSS('color', ON_PRIMARY[theme]);
    await page.mouse.down();
    await expect(cta).toHaveCSS('color', ON_PRIMARY[theme]);
    await page.mouse.up();
  });
}

for (const theme of ['light', 'dark'] as const) {
  for (const path of ['/', '/simulacro/'] as const) {
    test(`topic panel, open in My topics, has no WCAG AAA violations (${path} ${theme})`, async ({
      page,
    }) => {
      await prepare(page, theme);
      await page.goto(`${path}?${EXAM}`);
      await useMyTopics(page);
      await page.getByRole('button', { name: 'Tema 7', exact: true }).click();
      await page.getByLabel('Marcar por rango').fill('x');
      await page.getByRole('button', { name: 'Marcar', exact: true }).click();
      await expect(page.getByRole('alert').first()).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'wcag22aa'])
        .analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }
}
