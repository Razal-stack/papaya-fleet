import { expect, test } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator("h1")).toContainText("Sign In");
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.goto("/login");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.locator('text="Email is required"')).toBeVisible();
    await expect(page.locator('text="Password is required"')).toBeVisible();
  });

  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill in login form
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPassword123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("should logout successfully", async ({ page }) => {
    // First login
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(/.*dashboard/);

    // Logout
    await page.click('button[aria-label="User menu"]');
    await page.click('text="Logout"');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test("should handle forgot password flow", async ({ page }) => {
    await page.goto("/login");

    // Click forgot password link
    await page.click('text="Forgot password?"');

    // Should navigate to forgot password page
    await expect(page).toHaveURL(/.*forgot-password/);

    // Enter email
    await page.fill('input[name="email"]', "test@example.com");
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text="Reset link sent"')).toBeVisible();
  });
});
