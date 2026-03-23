import { createVehicleSchema, vehicleFilterSchema, z } from "@papaya-fleet/validation";
import { publicProcedure, router } from "../index";
import { VehicleService } from "../services/vehicle.service";

export const vehicleRouter = router({
  /**
   * Get all vehicles with pagination and filtering
   */
  getAll: publicProcedure.input(vehicleFilterSchema.optional()).query(async ({ input }) => {
    const filters = input || {
      page: 1,
      limit: 20,
      sort_by: "created_at",
      sort_order: "desc",
    };
    return VehicleService.findMany(filters);
  }),

  /**
   * Get a single vehicle by ID
   */
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return VehicleService.findById(input.id);
  }),

  /**
   * Create a new vehicle
   */
  create: publicProcedure.input(createVehicleSchema).mutation(async ({ input }) => {
    return VehicleService.create(input);
  }),
});
