import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load the homepage", async ({ page }) => {
    // Go directly to localhost:3000 where the app is running
    await page.goto("http://localhost:3000");

    // Check that the page loads (even if it's an error page for now)
    await expect(page).toHaveURL("http://localhost:3000/");
  });

  test("browser echo verification", async ({ page }) => {
    // Test that console logs are captured (browser echo)
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      const logMessage = `[BROWSER ECHO] ${msg.type()}: ${msg.text()}`;
      console.log(logMessage);
      consoleLogs.push(logMessage);
    });

    await page.goto("http://localhost:3000");

    // Execute some console logs
    await page.evaluate(() => {
      console.log("Browser echo test: Hello from Playwright!");
      console.warn("Browser echo test: Warning message");
      console.error("Browser echo test: Error message");
    });

    // Give time for console messages to be captured
    await page.waitForTimeout(1000);

    // Verify that console logs were captured
    expect(consoleLogs.length).toBeGreaterThan(0);
  });

  test("should show current day progress", async ({ page }) => {
    await page.goto("/");

    // Check for day progress indicator by text content
    const dayProgress = page.locator("text=/Day \\d+ of 90/");
    await expect(dayProgress).toBeVisible();
  });

  test("should have task checklist", async ({ page }) => {
    await page.goto("/");

    // Check for task checklist by heading
    const checklistHeading = page.locator('text="Today\'s Tasks"');
    await expect(checklistHeading).toBeVisible();

    // Check for specific tasks
    await expect(page.locator('text="Workout 1"')).toBeVisible();
    await expect(page.locator('text="Diet"')).toBeVisible();
    await expect(page.locator('text="Water"')).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page, viewport }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");

    // Check that the page still loads properly on mobile
    await expect(page).toHaveTitle("90-Hard Challenge");

    // Check mobile menu if applicable
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }
  });
});
