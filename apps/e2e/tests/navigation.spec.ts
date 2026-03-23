import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate through main pages", async ({ page }) => {
    await page.goto("/");

    // Check homepage
    await expect(page).toHaveTitle(/Papaya Test/);

    // Navigate to about
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL(/.*about/);

    // Navigate to contact
    await page.click('a[href="/contact"]');
    await expect(page).toHaveURL(/.*contact/);
  });

  test("should handle 404 pages", async ({ page }) => {
    await page.goto("/non-existent-page");
    await expect(page.locator("h1")).toContainText("404");
    await expect(page.locator('text="Page Not Found"')).toBeVisible();
  });

  test("should be mobile responsive", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Mobile menu should be visible
    const mobileMenu = page.locator('button[aria-label="Mobile menu"]');
    await expect(mobileMenu).toBeVisible();

    // Click mobile menu
    await mobileMenu.click();

    // Navigation items should be visible
    await expect(page.locator('nav[aria-label="Mobile navigation"]')).toBeVisible();
  });

  test("should handle dark mode toggle", async ({ page }) => {
    await page.goto("/");

    // Get initial theme
    const htmlElement = page.locator("html");
    const initialTheme = await htmlElement.getAttribute("data-theme");

    // Toggle theme
    await page.click('button[aria-label="Toggle theme"]');

    // Theme should change
    const newTheme = await htmlElement.getAttribute("data-theme");
    expect(newTheme).not.toBe(initialTheme);
  });

  test("should maintain URL state with Nuqs", async ({ page }) => {
    await page.goto("/search");

    // Type in search
    await page.fill('input[name="search"]', "test query");
    await page.press('input[name="search"]', "Enter");

    // URL should update
    await expect(page).toHaveURL(/.*\?q=test\+query/);

    // Reload page
    await page.reload();

    // Search input should still have value
    await expect(page.locator('input[name="search"]')).toHaveValue("test query");
  });
});
