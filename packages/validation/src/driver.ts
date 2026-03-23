import { z } from "zod";

// Enums matching Prisma schema
export const DriverStatus = z.enum([
  "ACTIVE",
  "INACTIVE",
  "ON_LEAVE",
  "SUSPENDED",
  "TERMINATED",
  "TRAINING",
]);

export const LicenseClass = z.enum([
  "A", // Motorcycle
  "B", // Car
  "C", // Truck
  "D", // Bus
  "CDL", // Commercial
  "SPECIAL",
]);

// Base driver schema for creation
export const createDriverSchema = z.object({
  employee_id: z.string().min(1).max(50),

  // Personal information
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  middle_name: z.string().max(50).optional(),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  alternate_phone: z.string().min(10).max(20).optional(),
  date_of_birth: z.string().datetime(),

  // Address
  street_address: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state_province: z.string().min(1).max(50),
  postal_code: z.string().min(1).max(20),
  country: z.string().max(50).default("USA"),

  // License information
  license_number: z.string().min(1).max(50),
  license_class: LicenseClass,
  license_state: z.string().min(2).max(50),
  license_expiry: z.string().datetime(),
  license_restrictions: z.string().max(200).optional(),

  // Employment
  status: DriverStatus.default("ACTIVE"),
  hire_date: z.string().datetime(),
  termination_date: z.string().datetime().optional(),
  department: z.string().max(100).optional(),
  supervisor_name: z.string().max(100).optional(),
  supervisor_email: z.string().email().optional(),

  // Emergency contact
  emergency_contact_name: z.string().max(100).optional(),
  emergency_contact_phone: z.string().min(10).max(20).optional(),
  emergency_contact_relation: z.string().max(50).optional(),

  // Certifications and training
  certifications: z.array(z.string()).default([]),
  last_training_date: z.string().datetime().optional(),
  next_training_date: z.string().datetime().optional(),

  // Performance metrics
  safety_score: z.number().min(0).max(100).default(100),
  total_miles_driven: z.number().min(0).default(0),
  accidents_count: z.number().int().min(0).default(0),
  violations_count: z.number().int().min(0).default(0),

  // Metadata
  notes: z.string().max(1000).optional(),
  profile_picture: z.string().url().optional(),
});

// Update driver schema (all fields optional except ID)
export const updateDriverSchema = createDriverSchema.partial().extend({
  id: z.string(),
});

// Driver filter schema for search/filtering
export const driverFilterSchema = z.object({
  // Search
  search: z.string().optional(), // Search in name, email, employee_id, license_number

  // Filters
  status: z.array(DriverStatus).optional(),
  license_class: z.array(LicenseClass).optional(),
  department: z.string().optional(),
  license_state: z.string().optional(),

  // Range filters
  hire_date_after: z.string().datetime().optional(),
  hire_date_before: z.string().datetime().optional(),
  age_min: z.number().int().min(18).optional(),
  age_max: z.number().int().max(100).optional(),
  safety_score_min: z.number().min(0).max(100).optional(),
  safety_score_max: z.number().min(0).max(100).optional(),

  // Date filters
  license_expiry_before: z.string().datetime().optional(),
  next_training_before: z.string().datetime().optional(),

  // Relations
  has_vehicle: z.boolean().optional(),
  vehicle_id: z.string().optional(),

  // Performance filters
  max_accidents: z.number().int().min(0).optional(),
  max_violations: z.number().int().min(0).optional(),

  // Certifications
  certifications: z.array(z.string()).optional(), // Has any of these certifications

  // Pagination
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),

  // Sorting
  sort_by: z
    .enum([
      "created_at",
      "updated_at",
      "first_name",
      "last_name",
      "employee_id",
      "hire_date",
      "license_expiry",
      "safety_score",
      "total_miles_driven",
      "status",
    ])
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

// Vehicle assignment schemas
export const createVehicleAssignmentSchema = z.object({
  vehicle_id: z.string(),
  driver_id: z.string(),
  assigned_date: z.string().datetime().optional(), // Defaults to now if not provided
  start_mileage: z.number().min(0).optional(),
  assignment_reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateVehicleAssignmentSchema = z.object({
  id: z.string(),
  unassigned_date: z.string().datetime().optional(),
  end_mileage: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

// Batch assignment for fleet operations
export const batchAssignVehiclesSchema = z.object({
  assignments: z.array(createVehicleAssignmentSchema).min(1).max(100),
});

// Type exports
export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
export type DriverFilter = z.infer<typeof driverFilterSchema>;
export type CreateVehicleAssignmentInput = z.infer<typeof createVehicleAssignmentSchema>;
export type UpdateVehicleAssignmentInput = z.infer<typeof updateVehicleAssignmentSchema>;
export type BatchAssignVehiclesInput = z.infer<typeof batchAssignVehiclesSchema>;
export type DriverStatusType = z.infer<typeof DriverStatus>;
export type LicenseClassType = z.infer<typeof LicenseClass>;
