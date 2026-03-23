import type { CreateVehicleInput } from "@papaya-fleet/validation";

// Default values for the vehicle form - all fields must be initialized
// to prevent React controlled/uncontrolled component warnings
export const getVehicleFormDefaults = (): Partial<CreateVehicleInput> => ({
  // Required fields
  vin: "",
  license_plate: "",
  make: "",
  model: "",
  year: new Date().getFullYear(),
  category: "",
  fuel_type: "",
  status: "ACTIVE",

  // Optional text fields - must be empty strings, not undefined
  color: "",
  transmission_type: "",
  current_location: "",
  home_location: "",
  department: "",
  registration_number: "",
  insurance_policy_no: "",
  cost_center: "",
  notes: "",
  primary_driver_id: "",

  // Optional date fields - must be empty strings for controlled inputs
  registration_expiry: "",
  insurance_expiry: "",
  last_service_date: "",
  next_service_date: "",
  purchase_date: "",
  lease_end_date: "",

  // Optional number fields - can be 0 or undefined
  current_mileage: 0,
  seating_capacity: undefined,
  cargo_capacity: undefined,
  fuel_capacity: undefined,
  purchase_price: undefined,
});
