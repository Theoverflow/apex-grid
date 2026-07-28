import { test, expect } from '@playwright/test';

test('home exposes core SEO elements and crawlable navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Apex Grid/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /courses automobiles/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /example\.com\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Au-delà de la limite');
  await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
});

test('dynamic event route has unique metadata and event schema', async ({ page }) => {
  await page.goto('/events/24-heures-de-valdor');
  await expect(page).toHaveTitle(/24 Heures de Valdor/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /events\/24-heures-de-valdor/);
  await expect(page.locator('script[type="application/ld+json"]')).toContainText('SportsEvent');
});

test('search is not indexable', async ({ page }) => {
  await page.goto('/search?q=aero');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
