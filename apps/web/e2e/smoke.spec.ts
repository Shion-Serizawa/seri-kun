import { expect, test } from '@playwright/test';

test('home page renders', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'seri-kun' })).toBeVisible();
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
  const response = await page.goto('/blog/2026-01-31-example');
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { level: 1, name: /Example: Astro Content Collections/ }),
  ).toBeVisible();
});
