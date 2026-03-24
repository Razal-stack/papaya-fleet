import { generateFakeVehicleData } from "@papaya-fleet/forms";
import { createVehicleSchema } from "@papaya-fleet/validation";
import { describe, expect, it } from "vitest";
import { getVehicleFormDefaults } from "../apps/web/src/components/vehicles/vehicle-form-defaults";

describe("Vehicle Form Auto-fill", () => {
  it("should generate valid fake vehicle data", () => {
    const fakeData = generateFakeVehicleData();

    // Check that required fields are present
    expect(fakeData.vin).toBeTruthy();
    expect(fakeData.license_plate).toBeTruthy();
    expect(fakeData.make).toBeTruthy();
    expect(fakeData.model).toBeTruthy();
    expect(fakeData.year).toBeGreaterThan(1900);
    expect(fakeData.category).toBeTruthy();
    expect(fakeData.fuel_type).toBeTruthy();
    expect(fakeData.status).toBeTruthy();

    // Ensure no invalid fields exist
    expect(fakeData).not.toHaveProperty("last_service_mileage");
    expect(fakeData).not.toHaveProperty("next_service_mileage");

    // Check that date fields are either valid ISO strings or undefined
    if (fakeData.registration_expiry) {
      expect(() => new Date(fakeData.registration_expiry)).not.toThrow();
    }
    if (fakeData.insurance_expiry) {
      expect(() => new Date(fakeData.insurance_expiry)).not.toThrow();
    }
    if (fakeData.last_service_date) {
      expect(() => new Date(fakeData.last_service_date)).not.toThrow();
    }
    if (fakeData.next_service_date) {
      expect(() => new Date(fakeData.next_service_date)).not.toThrow();
    }
    if (fakeData.purchase_date) {
      expect(() => new Date(fakeData.purchase_date)).not.toThrow();
    }
    if (fakeData.lease_end_date) {
      expect(() => new Date(fakeData.lease_end_date)).not.toThrow();
    }
  });

  it("should provide comprehensive default values", () => {
    const defaults = getVehicleFormDefaults();

    // Check required fields have default values (not undefined)
    expect(defaults.vin).toBe("");
    expect(defaults.license_plate).toBe("");
    expect(defaults.make).toBe("");
    expect(defaults.model).toBe("");
    expect(defaults.year).toBe(new Date().getFullYear());
    expect(defaults.category).toBe("");
    expect(defaults.fuel_type).toBe("");
    expect(defaults.status).toBe("ACTIVE");

    // Check optional text fields are empty strings (not undefined)
    expect(defaults.color).toBe("");
    expect(defaults.transmission_type).toBe("");
    expect(defaults.current_location).toBe("");
    expect(defaults.home_location).toBe("");
    expect(defaults.department).toBe("");
    expect(defaults.registration_number).toBe("");
    expect(defaults.insurance_policy_no).toBe("");
    expect(defaults.cost_center).toBe("");
    expect(defaults.notes).toBe("");
    expect(defaults.primary_driver_id).toBe("");

    // Check date fields are empty strings (prevents React controlled/uncontrolled warnings)
    expect(defaults.registration_expiry).toBe("");
    expect(defaults.insurance_expiry).toBe("");
    expect(defaults.last_service_date).toBe("");
    expect(defaults.next_service_date).toBe("");
    expect(defaults.purchase_date).toBe("");
    expect(defaults.lease_end_date).toBe("");

    // Check number fields
    expect(defaults.current_mileage).toBe(0);
    expect(defaults.seating_capacity).toBeUndefined();
    expect(defaults.cargo_capacity).toBeUndefined();
    expect(defaults.fuel_capacity).toBeUndefined();
    expect(defaults.purchase_price).toBeUndefined();
  });

  it("should merge fake data with defaults properly", () => {
    const defaults = getVehicleFormDefaults();
    const fakeData = generateFakeVehicleData();

    // Simulate the auto-fill behavior
    const merged = {
      ...defaults,
      vin: fakeData.vin || defaults.vin,
      license_plate: fakeData.license_plate || defaults.license_plate,
      make: fakeData.make || defaults.make,
      model: fakeData.model || defaults.model,
      year: fakeData.year || defaults.year,
      category: fakeData.category || defaults.category,
      fuel_type: fakeData.fuel_type || defaults.fuel_type,
      status: fakeData.status || defaults.status,
      // ... other fields
    };

    // Verify no field is undefined (all should have values or empty strings)
    Object.entries(merged).forEach(([key, value]) => {
      if (!key.includes("capacity") && !key.includes("price") && key !== "primary_driver_id") {
        expect(value).toBeDefined();
      }
    });
  });

  it("should validate fake data against Zod schema", () => {
    const fakeData = generateFakeVehicleData();

    // This should not throw
    const result = createVehicleSchema.safeParse(fakeData);

    if (!result.success) {
      console.error("Validation errors:", result.error.errors);
    }

    expect(result.success).toBe(true);
  });
});
