import { db } from "@papaya-fleet/db";
import { expect, test } from "@playwright/test";

test.describe("Driver Management", () => {
  test.beforeEach(async ({ page }) => {
    // Clear test data
    await db.vehicleAssignment.deleteMany({});
    await db.vehicle.deleteMany({});
    await db.driver.deleteMany({});

    // Create test drivers
    await db.driver.createMany({
      data: [
        {
          employee_id: "EMP001",
          first_name: "John",
          last_name: "Smith",
          email: "john.smith@example.com",
          phone: "555-0101",
          date_of_birth: new Date("1985-05-15"),
          street_address: "123 Main St",
          city: "New York",
          state_province: "NY",
          postal_code: "10001",
          country: "USA",
          license_number: "D123456789",
          license_class: "B",
          license_state: "NY",
          license_expiry: new Date("2025-05-15"),
          status: "ACTIVE",
          hire_date: new Date("2020-01-15"),
          safety_score: 95,
          total_miles_driven: 50000,
          accidents_count: 0,
          violations_count: 1,
        },
        {
          employee_id: "EMP002",
          first_name: "Jane",
          last_name: "Doe",
          email: "jane.doe@example.com",
          phone: "555-0102",
          date_of_birth: new Date("1990-08-20"),
          street_address: "456 Oak Ave",
          city: "Los Angeles",
          state_province: "CA",
          postal_code: "90001",
          country: "USA",
          license_number: "D987654321",
          license_class: "CDL",
          license_state: "CA",
          license_expiry: new Date("2024-08-20"),
          status: "ACTIVE",
          hire_date: new Date("2019-06-01"),
          safety_score: 88,
          total_miles_driven: 120000,
          accidents_count: 1,
          violations_count: 2,
        },
        {
          employee_id: "EMP003",
          first_name: "Robert",
          last_name: "Johnson",
          email: "robert.j@example.com",
          phone: "555-0103",
          date_of_birth: new Date("1982-03-10"),
          street_address: "789 Pine St",
          city: "Chicago",
          state_province: "IL",
          postal_code: "60601",
          country: "USA",
          license_number: "D555666777",
          license_class: "C",
          license_state: "IL",
          license_expiry: new Date("2026-03-10"),
          status: "ON_LEAVE",
          hire_date: new Date("2018-11-20"),
          safety_score: 100,
          total_miles_driven: 75000,
          accidents_count: 0,
          violations_count: 0,
        },
      ],
    });

    // Create a test vehicle and assign it to the first driver
    const vehicle = await db.vehicle.create({
      data: {
        vin: "DRIVER1234567890",
        license_plate: "DRV001",
        make: "Honda",
        model: "Civic",
        year: 2022,
        category: "SEDAN",
        fuel_type: "GASOLINE",
        status: "ACTIVE",
      },
    });

    const driver = await db.driver.findFirst({
      where: { employee_id: "EMP001" },
    });

    if (driver) {
      await db.vehicle.update({
        where: { id: vehicle.id },
        data: { primary_driver_id: driver.id },
      });
    }
  });

  test("should display drivers list page", async ({ page }) => {
    await page.goto("/drivers");

    // Check page title
    await expect(page.getByRole("heading", { name: "Drivers" })).toBeVisible();

    // Check if drivers table is visible
    await expect(page.getByRole("table")).toBeVisible();

    // Check if test drivers are displayed
    await expect(page.getByText("John Smith")).toBeVisible();
    await expect(page.getByText("Jane Doe")).toBeVisible();
    await expect(page.getByText("Robert Johnson")).toBeVisible();

    // Check employee IDs
    await expect(page.getByText("EMP001")).toBeVisible();
    await expect(page.getByText("EMP002")).toBeVisible();
    await expect(page.getByText("EMP003")).toBeVisible();

    // Check status badges
    await expect(page.getByText("active").first()).toBeVisible();
    await expect(page.getByText("on leave")).toBeVisible();
  });

  test("should filter drivers by status", async ({ page }) => {
    await page.goto("/drivers");

    // Select "Active" status filter
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Active" }).click();

    await page.waitForTimeout(500);

    // Should show only active drivers
    await expect(page.getByText("John Smith")).toBeVisible();
    await expect(page.getByText("Jane Doe")).toBeVisible();

    // Should not show on leave driver
    await expect(page.getByText("Robert Johnson")).not.toBeVisible();
  });

  test("should search drivers", async ({ page }) => {
    await page.goto("/drivers");

    // Search for John
    await page.getByPlaceholder("Search by name, email").fill("John");
    await page.waitForTimeout(500);

    // Should show matching drivers
    await expect(page.getByText("John Smith")).toBeVisible();
    await expect(page.getByText("Robert Johnson")).toBeVisible();

    // Should not show Jane
    await expect(page.getByText("Jane Doe")).not.toBeVisible();
  });

  test("should navigate to driver detail page", async ({ page }) => {
    await page.goto("/drivers");

    // Click on first driver row
    await page.getByText("John Smith").click();

    // Wait for navigation
    await page.waitForURL(/\/drivers\/.+/);

    // Check detail page elements
    await expect(page.getByRole("heading", { name: /John Smith/ })).toBeVisible();
    await expect(page.getByText("Employee ID: EMP001")).toBeVisible();

    // Check personal information section
    await expect(page.getByText("Personal Information")).toBeVisible();
    await expect(page.getByText("john.smith@example.com")).toBeVisible();
    await expect(page.getByText("555-0101")).toBeVisible();

    // Check license information
    await expect(page.getByText("License & Employment")).toBeVisible();
    await expect(page.getByText("D123456789")).toBeVisible();
    await expect(page.getByText("Class B")).toBeVisible();
  });

  test("should display driver statistics", async ({ page }) => {
    await page.goto("/drivers");

    // Check statistics cards
    await expect(page.getByText("Total Drivers")).toBeVisible();
    await expect(page.getByText("3")).toBeVisible(); // We created 3 test drivers

    await expect(page.getByText("Avg Safety Score")).toBeVisible();
    await expect(page.getByText("Licenses Expiring")).toBeVisible();
    await expect(page.getByText("Training Due")).toBeVisible();
  });

  test("should filter drivers by license class", async ({ page }) => {
    await page.goto("/drivers");

    // Select CDL license class
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: "CDL - Commercial" }).click();

    await page.waitForTimeout(500);

    // Should show only CDL driver
    await expect(page.getByText("Jane Doe")).toBeVisible();

    // Should not show other drivers
    await expect(page.getByText("John Smith")).not.toBeVisible();
    await expect(page.getByText("Robert Johnson")).not.toBeVisible();
  });

  test("should filter drivers by vehicle assignment", async ({ page }) => {
    await page.goto("/drivers");

    // Select "With Vehicle" filter
    await page.getByRole("combobox").nth(2).click();
    await page.getByRole("option", { name: "With Vehicle" }).click();

    await page.waitForTimeout(500);

    // Should show only driver with vehicle (John Smith)
    await expect(page.getByText("John Smith")).toBeVisible();
    await expect(page.getByText("DRV001")).toBeVisible(); // Vehicle license plate

    // Should not show drivers without vehicles
    await expect(page.getByText("Jane Doe")).not.toBeVisible();
    await expect(page.getByText("Robert Johnson")).not.toBeVisible();
  });

  test("should show safety scores", async ({ page }) => {
    await page.goto("/drivers");

    // Check safety scores are displayed
    await expect(page.getByText("95%")).toBeVisible(); // John's score
    await expect(page.getByText("88%")).toBeVisible(); // Jane's score
    await expect(page.getByText("100%")).toBeVisible(); // Robert's score
  });

  test("should highlight license expiry warnings", async ({ page }) => {
    // Update Jane's license to expire soon
    await db.driver.update({
      where: { employee_id: "EMP002" },
      data: {
        license_expiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      },
    });

    await page.goto("/drivers");

    // Should show warning icon for expiring license
    const janeRow = page.locator("tr", { hasText: "Jane Doe" });
    await expect(janeRow.locator("svg.text-orange-500")).toBeVisible();
  });

  test("should show empty state when no drivers", async ({ page }) => {
    // Clear all drivers
    await db.driver.deleteMany({});

    await page.goto("/drivers");

    // Should show empty state
    await expect(page.getByText("No drivers found")).toBeVisible();
    await expect(page.getByText("Try adjusting your filters")).toBeVisible();
  });

  test("driver detail page should show vehicle assignment", async ({ page }) => {
    await page.goto("/drivers");

    // Navigate to John's detail page (he has a vehicle assigned)
    await page.getByText("John Smith").click();
    await page.waitForURL(/\/drivers\/.+/);

    // Check current vehicle section
    await expect(page.getByText("Current Vehicle")).toBeVisible();
    await expect(page.getByText("Honda Civic")).toBeVisible();
    await expect(page.getByText("DRV001")).toBeVisible();
  });

  test("driver detail page should show performance metrics", async ({ page }) => {
    await page.goto("/drivers");

    // Navigate to Jane's detail page
    await page.getByText("Jane Doe").click();
    await page.waitForURL(/\/drivers\/.+/);

    // Check performance metrics section
    await expect(page.getByText("Performance Metrics")).toBeVisible();
    await expect(page.getByText("Safety Score")).toBeVisible();
    await expect(page.getByText("88%")).toBeVisible();

    await expect(page.getByText("Total Miles Driven")).toBeVisible();
    await expect(page.getByText("120,000")).toBeVisible();

    await expect(page.getByText("Accidents")).toBeVisible();
    await expect(page.getByText("1")).toBeVisible();

    await expect(page.getByText("Violations")).toBeVisible();
    await expect(page.getByText("2")).toBeVisible();
  });
});
