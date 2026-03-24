import { describe, expect, it } from "vitest";
import { createDriverSchema } from "../driver.schema";

describe("Driver Schema Validation", () => {
  it("should validate a valid driver input", () => {
    const validDriver = {
      employee_id: "EMP-12345",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@company.com",
      phone: "555-123-4567",
      date_of_birth: "1990-01-01",
      street_address: "123 Main St",
      city: "New York",
      state_province: "NY",
      postal_code: "10001",
      country: "USA",
      license_number: "D123456789",
      license_class: "B",
      license_state: "NY",
      license_expiry: "2025-12-31",
      status: "ACTIVE",
      hire_date: new Date().toISOString(),
    };

    const result = createDriverSchema.safeParse(validDriver);
    expect(result.success).toBe(true);
  });

  it("should fail validation for missing required fields", () => {
    const invalidDriver = {
      first_name: "John",
      // Missing other required fields
    };

    const result = createDriverSchema.safeParse(invalidDriver);
    expect(result.success).toBe(false);
  });

  it("should validate email format", () => {
    const driverWithInvalidEmail = {
      employee_id: "EMP-12345",
      first_name: "John",
      last_name: "Doe",
      email: "invalid-email", // Invalid email
      phone: "555-123-4567",
      date_of_birth: "1990-01-01",
      street_address: "123 Main St",
      city: "New York",
      state_province: "NY",
      postal_code: "10001",
      country: "USA",
      license_number: "D123456789",
      license_class: "B",
      license_state: "NY",
      license_expiry: "2025-12-31",
      status: "ACTIVE",
      hire_date: new Date().toISOString(),
    };

    const result = createDriverSchema.safeParse(driverWithInvalidEmail);
    expect(result.success).toBe(false);
  });
});
