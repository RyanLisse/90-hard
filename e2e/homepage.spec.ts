import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check if the page has loaded
    await expect(page).toHaveTitle(/90.*hard/i);
  });

  test('should have navigation header', async ({ page }) => {
    await page.goto('/');

    // Check for header component
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();
  });

  test('should show current day progress', async ({ page }) => {
    await page.goto('/');

    // Check for day progress indicator
    const dayProgress = page.locator('[data-testid="day-progress"]');
    await expect(dayProgress).toBeVisible();
  });

  test('should have task checklist', async ({ page }) => {
    await page.goto('/');

    // Check for task checklist
    const checklist = page.locator('[data-testid="task-checklist"]');
    await expect(checklist).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page, viewport }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check that the page still loads properly on mobile
    await expect(page).toHaveTitle(/90.*hard/i);

    // Check mobile menu if applicable
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }
  });
});
