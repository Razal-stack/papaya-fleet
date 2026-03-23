import { createDriverSchema, driverFilterSchema, z } from "@papaya-fleet/validation";
import { publicProcedure, router } from "../index";
import { DriverService } from "../services/driver.service";

export const driverRouter = router({
  /**
   * Get all drivers with pagination and filtering
   */
  getAll: publicProcedure.input(driverFilterSchema.optional()).query(async ({ input }) => {
    const filters = input || {
      page: 1,
      limit: 20,
      sort_by: "created_at",
      sort_order: "desc",
    };
    return DriverService.findMany(filters);
  }),

  /**
   * Get a single driver by ID
   */
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return DriverService.findById(input.id);
  }),

  /**
   * Create a new driver
   */
  create: publicProcedure.input(createDriverSchema).mutation(async ({ input }) => {
    return DriverService.create(input);
  }),
});
