import { db } from "@papaya-fleet/db";
import { expect, test } from "@playwright/test";

test.describe("Vehicle Management", () => {
  test.beforeEach(async ({ page }) => {
    // Clear test data
    await db.vehicleAssignment.deleteMany({});
    await db.maintenanceLog.deleteMany({});
    await db.vehicle.deleteMany({});
    await db.driver.deleteMany({});

    // Create test vehicles
    await db.vehicle.createMany({
      data: [
        {
          vin: "TEST1234567890AB",
          license_plate: "TEST001",
          make: "Honda",
          model: "Civic",
          year: 2022,
          category: "SEDAN",
          fuel_type: "GASOLINE",
          status: "ACTIVE",
          current_mileage: 15000,
          current_location: "New York",
          department: "Sales",
        },
        {
          vin: "TEST2234567890AB",
          license_plate: "TEST002",
          make: "Toyota",
          model: "RAV4",
          year: 2021,
          category: "SUV",
          fuel_type: "HYBRID",
          status: "MAINTENANCE",
          current_mileage: 25000,
          current_location: "Los Angeles",
          department: "Operations",
        },
        {
          vin: "TEST3234567890AB",
          license_plate: "TEST003",
          make: "Ford",
          model: "F-150",
          year: 2023,
          category: "TRUCK",
          fuel_type: "GASOLINE",
          status: "ACTIVE",
          current_mileage: 5000,
          current_location: "Chicago",
          department: "Logistics",
        },
      ],
    });

    // Mock authentication - you would need to implement actual auth in your app
    // For now, we'll navigate assuming user is logged in
  });

  test("should display vehicles list page", async ({ page }) => {
    await page.goto("/vehicles");

    // Check page title
    await expect(page.getByRole("heading", { name: "Fleet Vehicles" })).toBeVisible();

    // Check if vehicles table is visible
    await expect(page.getByRole("table")).toBeVisible();

    // Check if test vehicles are displayed
    await expect(page.getByText("Honda Civic")).toBeVisible();
    await expect(page.getByText("Toyota RAV4")).toBeVisible();
    await expect(page.getByText("Ford F-150")).toBeVisible();

    // Check license plates
    await expect(page.getByText("TEST001")).toBeVisible();
    await expect(page.getByText("TEST002")).toBeVisible();
    await expect(page.getByText("TEST003")).toBeVisible();

    // Check status badges
    await expect(page.getByText("active").first()).toBeVisible();
    await expect(page.getByText("maintenance")).toBeVisible();
  });

  test("should filter vehicles by status", async ({ page }) => {
    await page.goto("/vehicles");

    // Select "Active" status filter
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Active" }).click();

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Should show only active vehicles
    await expect(page.getByText("Honda Civic")).toBeVisible();
    await expect(page.getByText("Ford F-150")).toBeVisible();

    // Should not show maintenance vehicle
    await expect(page.getByText("Toyota RAV4")).not.toBeVisible();
  });

  test("should search vehicles", async ({ page }) => {
    await page.goto("/vehicles");

    // Search for Honda
    await page.getByPlaceholder("Search by VIN, license plate").fill("Honda");
    await page.waitForTimeout(500);

    // Should show only Honda vehicle
    await expect(page.getByText("Honda Civic")).toBeVisible();

    // Should not show other vehicles
    await expect(page.getByText("Toyota RAV4")).not.toBeVisible();
    await expect(page.getByText("Ford F-150")).not.toBeVisible();
  });

  test("should navigate to vehicle detail page", async ({ page }) => {
    await page.goto("/vehicles");

    // Click on first vehicle row
    await page.getByText("Honda Civic").click();

    // Wait for navigation
    await page.waitForURL(/\/vehicles\/.+/);

    // Check detail page elements
    await expect(page.getByRole("heading", { name: /Honda Civic 2022/ })).toBeVisible();
    await expect(page.getByText("VIN: TEST1234567890AB")).toBeVisible();
    await expect(page.getByText("License: TEST001")).toBeVisible();

    // Check vehicle information section
    await expect(page.getByText("Vehicle Information")).toBeVisible();
    await expect(page.getByText("sedan")).toBeVisible();
    await expect(page.getByText("gasoline")).toBeVisible();
    await expect(page.getByText("15,000 miles")).toBeVisible();

    // Check location section
    await expect(page.getByText("Location & Department")).toBeVisible();
    await expect(page.getByText("New York")).toBeVisible();
    await expect(page.getByText("Sales")).toBeVisible();
  });

  test("should show empty state when no vehicles", async ({ page }) => {
    // Clear all vehicles
    await db.vehicle.deleteMany({});

    await page.goto("/vehicles");

    // Should show empty state
    await expect(page.getByText("No vehicles found")).toBeVisible();
    await expect(page.getByText("Try adjusting your filters")).toBeVisible();
  });

  test("should display vehicle statistics", async ({ page }) => {
    await page.goto("/vehicles");

    // Check statistics cards
    await expect(page.getByText("Total Vehicles")).toBeVisible();
    await expect(page.getByText("3")).toBeVisible(); // We created 3 test vehicles

    await expect(page.getByText("Utilization Rate")).toBeVisible();
    await expect(page.getByText("In Maintenance")).toBeVisible();
    await expect(page.getByText("Avg Mileage")).toBeVisible();
  });

  test("should filter vehicles by category", async ({ page }) => {
    await page.goto("/vehicles");

    // Select SUV category
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: "SUV" }).click();

    await page.waitForTimeout(500);

    // Should show only SUV
    await expect(page.getByText("Toyota RAV4")).toBeVisible();

    // Should not show other categories
    await expect(page.getByText("Honda Civic")).not.toBeVisible();
    await expect(page.getByText("Ford F-150")).not.toBeVisible();
  });

  test("should filter vehicles by fuel type", async ({ page }) => {
    await page.goto("/vehicles");

    // Select Hybrid fuel type
    await page.getByRole("combobox").nth(2).click();
    await page.getByRole("option", { name: "Hybrid" }).click();

    await page.waitForTimeout(500);

    // Should show only hybrid vehicle
    await expect(page.getByText("Toyota RAV4")).toBeVisible();

    // Should not show gasoline vehicles
    await expect(page.getByText("Honda Civic")).not.toBeVisible();
    await expect(page.getByText("Ford F-150")).not.toBeVisible();
  });
});
