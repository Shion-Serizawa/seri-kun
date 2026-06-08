import { expect, test } from '@playwright/test';

test('home page renders', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'seri.' })).toBeVisible();
});

test('total visits is rendered as a number', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);

  await expect
    .poll(async () => {
      const text = await page.locator('[data-total-visits-value]').first().textContent();
      return text?.trim() ?? '';
    })
    .toMatch(/^\d[\d,]*$/);
});

test('works page renders', async ({ page }) => {
  const response = await page.goto('/works');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'Works' })).toBeVisible();
});

test('blog index page renders', async ({ page }) => {
  const response = await page.goto('/blog');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
});

test('blog detail page renders', async ({ page }) => {
  const response = await page.goto('/blog');
  expect(response?.status()).toBe(200);

  const firstPostLink = page.locator('a[href^="/blog/"]').first();
  await expect(firstPostLink).toBeVisible();

  await firstPostLink.click();

  await expect(page).toHaveURL(/\/blog\/[^/?#]+\/?$/);
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toBeVisible();
});
