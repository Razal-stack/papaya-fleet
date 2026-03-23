import { db } from "@papaya-fleet/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DriverService } from "./driver.service";

// Mock the database
vi.mock("@papaya-fleet/db", () => ({
  db: {
    driver: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    vehicle: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    vehicleAssignment: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("DriverService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findMany", () => {
    it("should return paginated drivers with filters", async () => {
      const mockDrivers = [
        {
          id: "1",
          employee_id: "EMP001",
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          status: "ACTIVE",
          license_class: "B",
          safety_score: 95,
          primary_vehicle: null,
          _count: { assignments: 3 },
        },
      ];

      vi.mocked(db.driver.findMany).mockResolvedValue(mockDrivers as any);
      vi.mocked(db.driver.count).mockResolvedValue(1);

      const result = await DriverService.findMany({
        search: "John",
        page: 1,
        limit: 20,
        sort_by: "created_at",
        sort_order: "desc",
      });

      expect(result.data).toEqual(mockDrivers);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.pages).toBe(1);
      expect(db.driver.findMany).toHaveBeenCalledTimes(1);
      expect(db.driver.count).toHaveBeenCalledTimes(1);
    });

    it("should filter by age range", async () => {
      vi.mocked(db.driver.findMany).mockResolvedValue([]);
      vi.mocked(db.driver.count).mockResolvedValue(0);

      await DriverService.findMany({
        age_min: 25,
        age_max: 50,
        page: 1,
        limit: 20,
        sort_by: "created_at",
        sort_order: "desc",
      });

      expect(db.driver.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ date_of_birth: expect.any(Object) }),
          ]),
        }),
        include: expect.any(Object),
        skip: 0,
        take: 20,
        orderBy: expect.any(Object),
      });
    });
  });

  describe("findById", () => {
    it("should return a driver with calculated age", async () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 35); // 35 years old

      const mockDriver = {
        id: "1",
        employee_id: "EMP001",
        first_name: "John",
        last_name: "Doe",
        date_of_birth: birthDate,
        primary_vehicle: null,
        assignments: [],
        _count: { assignments: 2 },
      };

      vi.mocked(db.driver.findUnique).mockResolvedValue(mockDriver as any);

      const result = await DriverService.findById("1");

      expect(result.age).toBe(35);
      expect(result.id).toBe("1");
      expect(db.driver.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: expect.objectContaining({
          primary_vehicle: true,
          assignments: expect.any(Object),
          _count: expect.any(Object),
        }),
      });
    });

    it("should throw error if driver not found", async () => {
      vi.mocked(db.driver.findUnique).mockResolvedValue(null);

      await expect(DriverService.findById("999")).rejects.toThrow("Driver not found");
    });
  });

  describe("create", () => {
    it("should create a new driver", async () => {
      const newDriver = {
        employee_id: "EMP002",
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
        phone: "123-456-7890",
        date_of_birth: "1990-01-01T00:00:00Z",
        street_address: "123 Main St",
        city: "New York",
        state_province: "NY",
        postal_code: "10001",
        country: "USA",
        license_number: "D123456",
        license_class: "B" as const,
        license_state: "NY",
        license_expiry: "2025-01-01T00:00:00Z",
        status: "ACTIVE" as const,
        hire_date: "2023-01-01T00:00:00Z",
        safety_score: 100,
        total_miles_driven: 0,
        accidents_count: 0,
        violations_count: 0,
        certifications: [],
        tags: [],
      };

      vi.mocked(db.driver.findFirst).mockResolvedValue(null);
      vi.mocked(db.driver.create).mockResolvedValue({ ...newDriver, id: "2" } as any);

      const result = await DriverService.create(newDriver);

      expect(result.id).toBe("2");
      expect(db.driver.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { employee_id: newDriver.employee_id },
            { email: newDriver.email },
            { license_number: newDriver.license_number },
          ],
        },
      });
      expect(db.driver.create).toHaveBeenCalledTimes(1);
    });

    it("should throw error if email already exists", async () => {
      const existingDriver = { id: "1", email: "existing@example.com" };
      vi.mocked(db.driver.findFirst).mockResolvedValue(existingDriver as any);

      await expect(
        DriverService.create({
          employee_id: "EMP003",
          email: "existing@example.com",
          first_name: "Test",
          last_name: "User",
          phone: "123-456-7890",
          date_of_birth: "1990-01-01T00:00:00Z",
          street_address: "123 Main St",
          city: "New York",
          state_province: "NY",
          postal_code: "10001",
          country: "USA",
          license_number: "D789012",
          license_class: "B",
          license_state: "NY",
          license_expiry: "2025-01-01T00:00:00Z",
          status: "ACTIVE",
          hire_date: "2023-01-01T00:00:00Z",
          safety_score: 100,
          total_miles_driven: 0,
          accidents_count: 0,
          violations_count: 0,
          certifications: [],
          tags: [],
        }),
      ).rejects.toThrow("Driver with this email already exists");
    });
  });

  describe("delete", () => {
    it("should delete a driver without vehicle", async () => {
      const driver = {
        id: "1",
        primary_vehicle: null,
      };

      vi.mocked(db.driver.findUnique).mockResolvedValue(driver as any);
      vi.mocked(db.driver.delete).mockResolvedValue(driver as any);

      const result = await DriverService.delete("1");

      expect(result).toEqual(driver);
      expect(db.driver.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    });

    it("should throw error if driver has assigned vehicle", async () => {
      const driver = {
        id: "1",
        primary_vehicle: { id: "vehicle1" },
      };

      vi.mocked(db.driver.findUnique).mockResolvedValue(driver as any);

      await expect(DriverService.delete("1")).rejects.toThrow(
        "Cannot delete driver with an assigned vehicle. Please unassign the vehicle first.",
      );
    });
  });

  describe("updatePerformanceMetrics", () => {
    it("should update driver metrics correctly", async () => {
      const driver = {
        id: "1",
        total_miles_driven: 10000,
        accidents_count: 0,
        violations_count: 1,
        safety_score: 95,
      };

      vi.mocked(db.driver.findUnique).mockResolvedValue(driver as any);
      vi.mocked(db.driver.update).mockResolvedValue({
        ...driver,
        total_miles_driven: 10500,
        violations_count: 2,
        safety_score: 90,
      } as any);

      const _result = await DriverService.updatePerformanceMetrics("1", {
        miles_driven: 500,
        violation: true,
      });

      expect(db.driver.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          total_miles_driven: 10500,
          violations_count: 2,
          safety_score: 90, // 95 - 5 for violation
        },
      });
    });

    it("should reduce safety score for accidents", async () => {
      const driver = {
        id: "1",
        total_miles_driven: 5000,
        accidents_count: 0,
        violations_count: 0,
        safety_score: 100,
      };

      vi.mocked(db.driver.findUnique).mockResolvedValue(driver as any);
      vi.mocked(db.driver.update).mockResolvedValue({
        ...driver,
        accidents_count: 1,
        safety_score: 90,
      } as any);

      await DriverService.updatePerformanceMetrics("1", {
        accident: true,
      });

      expect(db.driver.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          accidents_count: 1,
          safety_score: 90, // 100 - 10 for accident
        },
      });
    });
  });

  describe("getStatistics", () => {
    it("should return aggregated driver statistics", async () => {
      vi.mocked(db.driver.count).mockResolvedValueOnce(50); // total
      vi.mocked(db.driver.count).mockResolvedValueOnce(40); // active
      vi.mocked(db.driver.count).mockResolvedValueOnce(30); // with vehicles
      vi.mocked(db.driver.aggregate).mockResolvedValueOnce({
        _avg: { safety_score: 92.5 },
      } as any);
      vi.mocked(db.driver.aggregate).mockResolvedValueOnce({
        _sum: { total_miles_driven: 500000 },
      } as any);

      // Mock getExpiringLicenses
      vi.spyOn(DriverService, "getExpiringLicenses").mockResolvedValue([
        { id: "1" },
        { id: "2" },
      ] as any);

      // Mock getTrainingDue
      vi.spyOn(DriverService, "getTrainingDue").mockResolvedValue([
        { id: "3" },
        { id: "4" },
        { id: "5" },
      ] as any);

      const result = await DriverService.getStatistics();

      expect(result).toEqual({
        total_drivers: 50,
        active_drivers: 40,
        drivers_with_vehicles: 30,
        average_safety_score: 92.5,
        total_miles_driven: 500000,
        licenses_expiring_soon: 2,
        training_due_soon: 3,
        utilization_rate: 60, // 30/50 * 100
      });
    });
  });

  describe("createAssignment", () => {
    it("should create a vehicle assignment", async () => {
      const vehicle = { id: "vehicle1", primary_driver_id: null };
      const driver = { id: "driver1" };
      const assignment = {
        vehicle_id: "vehicle1",
        driver_id: "driver1",
      };

      vi.mocked(db.vehicle.findUnique).mockResolvedValue(vehicle as any);
      vi.mocked(db.driver.findUnique).mockResolvedValue(driver as any);
      vi.mocked(db.driver.findFirst).mockResolvedValue(null);
      vi.mocked(db.$transaction).mockResolvedValue([
        { id: "assignment1", ...assignment },
        { ...vehicle, primary_driver_id: "driver1" },
      ] as any);

      const result = await DriverService.createAssignment(assignment);

      expect(result.id).toBe("assignment1");
      expect(db.$transaction).toHaveBeenCalledTimes(1);
    });

    it("should throw error if vehicle already has a driver", async () => {
      const vehicle = { id: "vehicle1", primary_driver_id: "existingDriver" };
      const driver = { id: "driver1" };

      vi.mocked(db.vehicle.findUnique).mockResolvedValue(vehicle as any);
      vi.mocked(db.driver.findUnique).mockResolvedValue(driver as any);

      await expect(
        DriverService.createAssignment({
          vehicle_id: "vehicle1",
          driver_id: "driver1",
        }),
      ).rejects.toThrow("Vehicle already has a driver assigned");
    });
  });
});
