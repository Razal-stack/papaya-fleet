import { z } from "zod";

// Enums matching Prisma schema
export const VehicleStatus = z.enum([
  "ACTIVE",
  "MAINTENANCE",
  "REPAIR",
  "INACTIVE",
  "RETIRED",
  "RESERVED",
]);

export const VehicleCategory = z.enum([
  "SEDAN",
  "SUV",
  "TRUCK",
  "VAN",
  "MINIVAN",
  "PICKUP",
  "MOTORCYCLE",
  "BUS",
  "TRAILER",
  "SPECIALIZED",
]);

export const FuelType = z.enum([
  "GASOLINE",
  "DIESEL",
  "ELECTRIC",
  "HYBRID",
  "CNG",
  "LPG",
  "HYDROGEN",
]);

// Base vehicle schema for creation
export const createVehicleSchema = z.object({
  vin: z.string().min(17).max(17, "VIN must be exactly 17 characters"),
  license_plate: z.string().min(1).max(20),
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  color: z.string().max(30).optional(),

  // Classification
  category: VehicleCategory,
  fuel_type: FuelType,
  transmission_type: z.string().max(20).optional(),

  // Status and tracking
  status: VehicleStatus.default("ACTIVE"),
  current_mileage: z.number().min(0).default(0),
  last_service_date: z.string().datetime().optional(),
  next_service_date: z.string().datetime().optional(),

  // Location tracking
  current_location: z.string().max(200).optional(),
  home_location: z.string().max(200).optional(),

  // Registration and compliance
  registration_number: z.string().max(50).optional(),
  registration_expiry: z.string().datetime().optional(),
  insurance_policy_no: z.string().max(50).optional(),
  insurance_expiry: z.string().datetime().optional(),

  // Capacity and specifications
  seating_capacity: z.number().int().min(1).max(100).optional(),
  cargo_capacity: z.number().min(0).optional(), // cubic meters
  fuel_capacity: z.number().min(0).optional(), // liters

  // Purchase/Lease information
  purchase_date: z.string().datetime().optional(),
  purchase_price: z.number().min(0).optional(),
  lease_end_date: z.string().datetime().optional(),

  // Fleet management
  department: z.string().max(100).optional(),
  cost_center: z.string().max(50).optional(),

  // Relationships
  primary_driver_id: z.string().optional(),

  // Metadata
  notes: z.string().max(1000).optional(),
});

// Update vehicle schema (all fields optional except ID)
export const updateVehicleSchema = createVehicleSchema.partial().extend({
  id: z.string(),
});

// Vehicle filter schema for search/filtering
export const vehicleFilterSchema = z.object({
  // Search
  search: z.string().optional(), // Search in VIN, license plate, make, model

  // Filters
  status: z.array(VehicleStatus).optional(),
  category: z.array(VehicleCategory).optional(),
  fuel_type: z.array(FuelType).optional(),
  department: z.string().optional(),
  current_location: z.string().optional(),

  // Range filters
  year_min: z.number().int().optional(),
  year_max: z.number().int().optional(),
  mileage_min: z.number().min(0).optional(),
  mileage_max: z.number().min(0).optional(),

  // Date filters
  insurance_expiry_before: z.string().datetime().optional(),
  registration_expiry_before: z.string().datetime().optional(),
  next_service_before: z.string().datetime().optional(),

  // Relations
  has_driver: z.boolean().optional(),
  driver_id: z.string().optional(),

  // Pagination
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),

  // Sorting
  sort_by: z
    .enum([
      "created_at",
      "updated_at",
      "license_plate",
      "make",
      "model",
      "year",
      "current_mileage",
      "status",
    ])
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

// Maintenance log schemas
export const createMaintenanceLogSchema = z.object({
  vehicle_id: z.string(),
  maintenance_type: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  performed_date: z.string().datetime(),
  performed_by: z.string().min(1).max(100),
  mileage_at_service: z.number().min(0),
  cost: z.number().min(0).optional(),
  next_service_due: z.string().datetime().optional(),
  next_service_mileage: z.number().min(0).optional(),
  parts_replaced: z.array(z.string()).default([]),
});

export const updateMaintenanceLogSchema = createMaintenanceLogSchema.partial().extend({
  id: z.string(),
});

// Type exports
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleFilter = z.infer<typeof vehicleFilterSchema>;
export type CreateMaintenanceLogInput = z.infer<typeof createMaintenanceLogSchema>;
export type UpdateMaintenanceLogInput = z.infer<typeof updateMaintenanceLogSchema>;
export type VehicleStatusType = z.infer<typeof VehicleStatus>;
export type VehicleCategoryType = z.infer<typeof VehicleCategory>;
export type FuelTypeType = z.infer<typeof FuelType>;
