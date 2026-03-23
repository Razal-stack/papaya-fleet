import type { CreateDriverInput } from "@papaya-fleet/validation";

/**
 * Get default values for the driver form
 * Only includes fields that are actually used in the simplified form
 */
export function getDriverFormDefaults(): Partial<CreateDriverInput> {
  return {
    // Required fields
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",

    // Address (required)
    street_address: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "USA",

    // License (required)
    license_number: "",
    license_class: "B", // Default to regular car license
    license_state: "",
    license_expiry: "",

    // Employment
    status: "ACTIVE",
    hire_date: new Date().toISOString(),

    // Optional fields commonly used
    department: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",

    // Performance defaults
    safety_score: 100,
    total_miles_driven: 0,
    accidents_count: 0,
    violations_count: 0,
  };
}
