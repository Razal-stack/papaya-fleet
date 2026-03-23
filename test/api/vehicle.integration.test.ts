import { appRouter } from "@papaya-fleet/api/routers";
import { db } from "@papaya-fleet/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestContext } from "../helpers/test-context";

describe("Vehicle API Integration Tests", () => {
  let ctx: ReturnType<typeof createTestContext>;
  let testVehicleId: string;
  let testDriverId: string;

  beforeAll(async () => {
    ctx = createTestContext();

    // Clean up test data
    await db.vehicleAssignment.deleteMany({});
    await db.maintenanceLog.deleteMany({});
    await db.vehicle.deleteMany({});
    await db.driver.deleteMany({});
  });

  afterAll(async () => {
    // Clean up after tests
    await db.vehicleAssignment.deleteMany({});
    await db.maintenanceLog.deleteMany({});
    await db.vehicle.deleteMany({});
    await db.driver.deleteMany({});
  });

  beforeEach(async () => {
    // Clear data before each test
    await db.vehicleAssignment.deleteMany({});
    await db.maintenanceLog.deleteMany({});
    await db.vehicle.deleteMany({});
    await db.driver.deleteMany({});
  });

  describe("GET /vehicle.getAll", () => {
    it("should return empty list when no vehicles exist", async () => {
      const result = await appRouter.vehicle.getAll.query({
        page: 1,
        limit: 20,
        sort_by: "created_at",
        sort_order: "desc",
      });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it("should return paginated vehicles", async () => {
      // Create test vehicles
      const vehicles = [];
      for (let i = 1; i <= 25; i++) {
        const vehicle = await db.vehicle.create({
          data: {
            vin: `VIN${i.toString().padStart(15, "0")}`,
            license_plate: `TEST${i}`,
            make: i % 2 === 0 ? "Honda" : "Toyota",
            model: i % 2 === 0 ? "Civic" : "Camry",
            year: 2020 + (i % 3),
            category: i % 3 === 0 ? "SUV" : "SEDAN",
            fuel_type: i % 2 === 0 ? "GASOLINE" : "HYBRID",
            status: i % 5 === 0 ? "MAINTENANCE" : "ACTIVE",
          },
        });
        vehicles.push(vehicle);
      }

      // Test first page
      const page1 = await appRouter.vehicle.getAll.query({
        page: 1,
        limit: 10,
        sort_by: "created_at",
        sort_order: "asc",
      });

      expect(page1.data).toHaveLength(10);
      expect(page1.pagination.total).toBe(25);
      expect(page1.pagination.pages).toBe(3);
      expect(page1.pagination.has_next).toBe(true);
      expect(page1.pagination.has_previous).toBe(false);

      // Test second page
      const page2 = await appRouter.vehicle.getAll.query({
        page: 2,
        limit: 10,
        sort_by: "created_at",
        sort_order: "asc",
      });

      expect(page2.data).toHaveLength(10);
      expect(page2.pagination.has_next).toBe(true);
      expect(page2.pagination.has_previous).toBe(true);

      // Test last page
      const page3 = await appRouter.vehicle.getAll.query({
        page: 3,
        limit: 10,
        sort_by: "created_at",
        sort_order: "asc",
      });

      expect(page3.data).toHaveLength(5);
      expect(page3.pagination.has_next).toBe(false);
      expect(page3.pagination.has_previous).toBe(true);
    });

    it("should filter vehicles by status", async () => {
      // Create vehicles with different statuses
      await db.vehicle.create({
        data: {
          vin: "ACTIVE123456789AB",
          license_plate: "ACTIVE1",
          make: "Honda",
          model: "Civic",
          year: 2020,
          category: "SEDAN",
          fuel_type: "GASOLINE",
          status: "ACTIVE",
        },
      });

      await db.vehicle.create({
        data: {
          vin: "MAINT123456789ABC",
          license_plate: "MAINT1",
          make: "Toyota",
          model: "Camry",
          year: 2021,
          category: "SEDAN",
          fuel_type: "HYBRID",
          status: "MAINTENANCE",
        },
      });

      const result = await appRouter.vehicle.getAll.query({
        status: ["ACTIVE"],
        page: 1,
        limit: 20,
        sort_by: "created_at",
        sort_order: "desc",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe("ACTIVE");
    });

    it("should search vehicles by make and model", async () => {
      await db.vehicle.create({
        data: {
          vin: "HONDA12345678901",
          license_plate: "HONDA1",
          make: "Honda",
          model: "Accord",
          year: 2022,
          category: "SEDAN",
          fuel_type: "HYBRID",
          status: "ACTIVE",
        },
      });

      await db.vehicle.create({
        data: {
          vin: "TOYOTA1234567890",
          license_plate: "TOYOTA1",
          make: "Toyota",
          model: "RAV4",
          year: 2022,
          category: "SUV",
          fuel_type: "GASOLINE",
          status: "ACTIVE",
        },
      });

      const result = await appRouter.vehicle.getAll.query({
        search: "Honda",
        page: 1,
        limit: 20,
        sort_by: "created_at",
        sort_order: "desc",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].make).toBe("Honda");
    });
  });

  describe("GET /vehicle.getById", () => {
    it("should return vehicle details with relations", async () => {
      const vehicle = await db.vehicle.create({
        data: {
          vin: "DETAIL123456789A",
          license_plate: "DETAIL1",
          make: "Tesla",
          model: "Model 3",
          year: 2023,
          category: "SEDAN",
          fuel_type: "ELECTRIC",
          status: "ACTIVE",
        },
      });

      const result = await appRouter.vehicle.getById.query({ id: vehicle.id });

      expect(result.id).toBe(vehicle.id);
      expect(result.vin).toBe("DETAIL123456789A");
      expect(result.make).toBe("Tesla");
      expect(result.assignments).toEqual([]);
      expect(result.maintenance_logs).toEqual([]);
    });

    it("should throw error for non-existent vehicle", async () => {
      await expect(appRouter.vehicle.getById.query({ id: "non-existent-id" })).rejects.toThrow(
        "Vehicle not found",
      );
    });
  });

  describe("POST /vehicle.create", () => {
    it("should create a new vehicle", async () => {
      const newVehicle = {
        vin: "CREATE123456789A",
        license_plate: "CREATE1",
        make: "Ford",
        model: "F-150",
        year: 2023,
        category: "TRUCK" as const,
        fuel_type: "GASOLINE" as const,
        status: "ACTIVE" as const,
        current_mileage: 0,
        tags: ["new", "fleet"],
      };

      const result = await ctx.caller.vehicle.create(newVehicle);

      expect(result.vin).toBe(newVehicle.vin);
      expect(result.license_plate).toBe(newVehicle.license_plate);
      expect(result.make).toBe(newVehicle.make);
      expect(result.tags).toEqual(["new", "fleet"]);

      // Verify it was saved to database
      const savedVehicle = await db.vehicle.findUnique({
        where: { id: result.id },
      });
      expect(savedVehicle).toBeTruthy();
    });

    it("should reject duplicate VIN", async () => {
      await db.vehicle.create({
        data: {
          vin: "DUPE1234567890AB",
          license_plate: "UNIQUE1",
          make: "Honda",
          model: "Civic",
          year: 2022,
          category: "SEDAN",
          fuel_type: "GASOLINE",
          status: "ACTIVE",
        },
      });

      await expect(
        ctx.caller.vehicle.create({
          vin: "DUPE1234567890AB", // Duplicate VIN
          license_plate: "UNIQUE2",
          make: "Toyota",
          model: "Camry",
          year: 2022,
          category: "SEDAN",
          fuel_type: "HYBRID",
          status: "ACTIVE",
          current_mileage: 0,
          tags: [],
        }),
      ).rejects.toThrow("Vehicle with this VIN already exists");
    });
  });

  describe("Vehicle-Driver Assignment", () => {
    beforeEach(async () => {
      // Create a test vehicle and driver
      const vehicle = await db.vehicle.create({
        data: {
          vin: "ASSIGN123456789A",
          license_plate: "ASSIGN1",
          make: "Honda",
          model: "Civic",
          year: 2022,
          category: "SEDAN",
          fuel_type: "GASOLINE",
          status: "ACTIVE",
        },
      });
      testVehicleId = vehicle.id;

      const driver = await db.driver.create({
        data: {
          employee_id: "EMP001",
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          date_of_birth: new Date("1990-01-01"),
          street_address: "123 Main St",
          city: "New York",
          state_province: "NY",
          postal_code: "10001",
          license_number: "D123456",
          license_class: "B",
          license_state: "NY",
          license_expiry: new Date("2025-01-01"),
          status: "ACTIVE",
          hire_date: new Date("2020-01-01"),
        },
      });
      testDriverId = driver.id;
    });

    it("should assign a driver to a vehicle", async () => {
      const result = await ctx.caller.vehicle.assignDriver({
        vehicleId: testVehicleId,
        driverId: testDriverId,
      });

      expect(result.primary_driver_id).toBe(testDriverId);

      // Verify assignment record was created
      const assignment = await db.vehicleAssignment.findFirst({
        where: {
          vehicle_id: testVehicleId,
          driver_id: testDriverId,
          unassigned_date: null,
        },
      });
      expect(assignment).toBeTruthy();
    });

    it("should unassign a driver from a vehicle", async () => {
      // First assign
      await ctx.caller.vehicle.assignDriver({
        vehicleId: testVehicleId,
        driverId: testDriverId,
      });

      // Then unassign
      const result = await ctx.caller.vehicle.unassignDriver({
        vehicleId: testVehicleId,
      });

      expect(result.primary_driver_id).toBeNull();

      // Verify assignment was ended
      const assignment = await db.vehicleAssignment.findFirst({
        where: {
          vehicle_id: testVehicleId,
          driver_id: testDriverId,
        },
      });
      expect(assignment?.unassigned_date).toBeTruthy();
    });
  });

  describe("GET /vehicle.getStatistics", () => {
    it("should return vehicle fleet statistics", async () => {
      // Create test data
      await Promise.all([
        db.vehicle.create({
          data: {
            vin: "STAT1234567890AB",
            license_plate: "STAT1",
            make: "Honda",
            model: "Civic",
            year: 2022,
            category: "SEDAN",
            fuel_type: "GASOLINE",
            status: "ACTIVE",
            current_mileage: 15000,
          },
        }),
        db.vehicle.create({
          data: {
            vin: "STAT2234567890AB",
            license_plate: "STAT2",
            make: "Toyota",
            model: "RAV4",
            year: 2021,
            category: "SUV",
            fuel_type: "HYBRID",
            status: "MAINTENANCE",
            current_mileage: 25000,
          },
        }),
      ]);

      const stats = await appRouter.vehicle.getStatistics.query();

      expect(stats.total_vehicles).toBeGreaterThanOrEqual(2);
      expect(stats.active_vehicles).toBeGreaterThanOrEqual(1);
      expect(stats.in_maintenance).toBeGreaterThanOrEqual(1);
      expect(stats.average_mileage).toBeGreaterThan(0);
      expect(stats.vehicles_by_category).toBeDefined();
      expect(stats.vehicles_by_fuel_type).toBeDefined();
    });
  });
});
