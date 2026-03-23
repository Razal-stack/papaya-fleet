import { db } from "@papaya-fleet/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VehicleService } from "./vehicle.service";

// Mock the database
vi.mock("@papaya-fleet/db", () => ({
  db: {
    vehicle: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    driver: {
      findUnique: vi.fn(),
    },
    vehicleAssignment: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    maintenanceLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("VehicleService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findMany", () => {
    it("should return paginated vehicles with filters", async () => {
      const mockVehicles = [
        {
          id: "1",
          vin: "1HGBH41JXMN109186",
          license_plate: "ABC123",
          make: "Honda",
          model: "Civic",
          year: 2020,
          status: "ACTIVE",
          category: "SEDAN",
          fuel_type: "GASOLINE",
          current_mileage: 15000,
          primary_driver_id: null,
          primary_driver: null,
          created_at: new Date("2024-01-01"),
          updated_at: new Date("2024-01-02"),
        },
      ];

      vi.mocked(db.vehicle.findMany).mockResolvedValue(mockVehicles as any);
      vi.mocked(db.vehicle.count).mockResolvedValue(1);

      const result = await VehicleService.findMany({
        search: "Honda",
        page: 1,
        limit: 20,
        sort_by: "created_at",
        sort_order: "desc",
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].registrationNumber).toBe("ABC123");
      expect(result.items[0].vehicleType).toBe("sedan");
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.page).toBe(1);
      expect(db.vehicle.findMany).toHaveBeenCalledTimes(1);
      expect(db.vehicle.count).toHaveBeenCalledTimes(1);
    });

    it("should handle empty results", async () => {
      vi.mocked(db.vehicle.findMany).mockResolvedValue([]);
      vi.mocked(db.vehicle.count).mockResolvedValue(0);

      const result = await VehicleService.findMany({
        search: "NonExistent",
        page: 1,
        limit: 20,
        sort_by: "created_at",
        sort_order: "desc",
      });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe("findById", () => {
    it("should return a vehicle by ID with relations", async () => {
      const mockVehicle = {
        id: "1",
        vin: "1HGBH41JXMN109186",
        license_plate: "ABC123",
        make: "Honda",
        model: "Civic",
        year: 2020,
        status: "ACTIVE",
        category: "SEDAN",
        fuel_type: "GASOLINE",
        current_mileage: 15000,
        primary_driver_id: "driver1",
        primary_driver: {
          id: "driver1",
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
        },
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-01-02"),
      };

      vi.mocked(db.vehicle.findUnique).mockResolvedValue(mockVehicle as any);

      const result = await VehicleService.findById("1");

      expect(result.id).toBe("1");
      expect(result.registrationNumber).toBe("ABC123");
      expect(result.vehicleType).toBe("sedan");
      expect(result.driver?.firstName).toBe("John");
      expect(db.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: expect.objectContaining({
          primary_driver: expect.any(Object),
        }),
      });
    });

    it("should throw error if vehicle not found", async () => {
      vi.mocked(db.vehicle.findUnique).mockResolvedValue(null);

      await expect(VehicleService.findById("999")).rejects.toThrow("Vehicle not found");
    });
  });

  describe("create", () => {
    it("should create a new vehicle", async () => {
      const newVehicle = {
        vin: "1HGBH41JXMN109186",
        license_plate: "ABC123",
        make: "Honda",
        model: "Civic",
        year: 2020,
        category: "SEDAN" as const,
        fuel_type: "GASOLINE" as const,
        status: "ACTIVE" as const,
        current_mileage: 0,
        tags: [],
      };

      const createdVehicle = {
        ...newVehicle,
        id: "1",
        color: null,
        transmission_type: null,
        last_service_date: null,
        next_service_date: null,
        current_location: null,
        home_location: null,
        registration_number: null,
        registration_expiry: null,
        insurance_policy_no: null,
        insurance_expiry: null,
        seating_capacity: null,
        cargo_capacity: null,
        fuel_capacity: null,
        purchase_date: null,
        purchase_price: null,
        lease_end_date: null,
        department: null,
        cost_center: null,
        notes: null,
        primary_driver_id: null,
        primary_driver: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(db.vehicle.findUnique).mockResolvedValue(null);
      vi.mocked(db.vehicle.create).mockResolvedValue(createdVehicle as any);

      const result = await VehicleService.create(newVehicle);

      expect(result.id).toBe("1");
      expect(result.registrationNumber).toBe("ABC123");
      expect(result.vehicleType).toBe("sedan");
      expect(result.fuelType).toBe("gasoline");
      expect(result.status).toBe("active");

      // Verify duplicate checks were made
      expect(db.vehicle.findUnique).toHaveBeenCalledWith({
        where: { vin: newVehicle.vin },
        select: { id: true, vin: true },
      });
      expect(db.vehicle.findUnique).toHaveBeenCalledWith({
        where: { license_plate: newVehicle.license_plate },
        select: { id: true, license_plate: true },
      });
      expect(db.vehicle.create).toHaveBeenCalledTimes(1);
    });

    it("should throw error if VIN already exists", async () => {
      const existingVehicle = { id: "1", vin: "1HGBH41JXMN109186" };

      // First call returns existing vehicle (VIN check)
      vi.mocked(db.vehicle.findUnique).mockResolvedValueOnce(existingVehicle as any);

      await expect(
        VehicleService.create({
          vin: "1HGBH41JXMN109186",
          license_plate: "XYZ789",
          make: "Honda",
          model: "Civic",
          year: 2020,
          category: "SEDAN",
          fuel_type: "GASOLINE",
          status: "ACTIVE",
          current_mileage: 0,
          tags: [],
        }),
      ).rejects.toThrow("Vehicle with VIN 1HGBH41JXMN109186 already exists");
    });

    it("should throw error if license plate already exists", async () => {
      const existingVehicle = { id: "1", license_plate: "ABC123" };

      // First call returns null (VIN check passes)
      vi.mocked(db.vehicle.findUnique).mockResolvedValueOnce(null);
      // Second call returns existing vehicle (license plate check fails)
      vi.mocked(db.vehicle.findUnique).mockResolvedValueOnce(existingVehicle as any);

      await expect(
        VehicleService.create({
          vin: "NEW_VIN_12345678",
          license_plate: "ABC123",
          make: "Toyota",
          model: "Camry",
          year: 2021,
          category: "SEDAN",
          fuel_type: "HYBRID",
          status: "ACTIVE",
          current_mileage: 0,
          tags: [],
        }),
      ).rejects.toThrow("Vehicle with license plate ABC123 already exists");
    });

    it("should create vehicle with all optional fields", async () => {
      const fullVehicle = {
        vin: "FULL_VIN_1234567",
        license_plate: "FULL123",
        make: "Tesla",
        model: "Model S",
        year: 2023,
        color: "Midnight Silver",
        category: "SEDAN" as const,
        fuel_type: "ELECTRIC" as const,
        transmission_type: "Automatic",
        status: "ACTIVE" as const,
        current_mileage: 1000,
        last_service_date: "2023-06-01T00:00:00Z",
        next_service_date: "2024-06-01T00:00:00Z",
        current_location: "Main Office",
        home_location: "Fleet Garage A",
        registration_number: "REG123",
        registration_expiry: "2025-01-01T00:00:00Z",
        insurance_policy_no: "POL123456",
        insurance_expiry: "2024-12-31T00:00:00Z",
        seating_capacity: 5,
        cargo_capacity: 15.5,
        fuel_capacity: 85,
        purchase_date: "2023-01-15T00:00:00Z",
        purchase_price: 89990,
        lease_end_date: null,
        department: "Sales",
        cost_center: "CC-001",
        notes: "Executive vehicle",
        tags: ["luxury", "electric", "executive"],
      };

      const createdVehicle = {
        ...fullVehicle,
        id: "full-1",
        last_service_date: new Date(fullVehicle.last_service_date),
        next_service_date: new Date(fullVehicle.next_service_date),
        registration_expiry: new Date(fullVehicle.registration_expiry),
        insurance_expiry: new Date(fullVehicle.insurance_expiry),
        purchase_date: new Date(fullVehicle.purchase_date),
        lease_end_date: null,
        primary_driver_id: null,
        primary_driver: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(db.vehicle.findUnique).mockResolvedValue(null);
      vi.mocked(db.vehicle.create).mockResolvedValue(createdVehicle as any);

      const result = await VehicleService.create(fullVehicle);

      expect(result.id).toBe("full-1");
      expect(result.registrationNumber).toBe("FULL123");
      expect(result.make).toBe("Tesla");
      expect(result.vehicleType).toBe("sedan");
      expect(result.fuelType).toBe("electric");
      expect(db.vehicle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          vin: fullVehicle.vin,
          license_plate: fullVehicle.license_plate,
          department: fullVehicle.department,
          tags: fullVehicle.tags,
        }),
        include: expect.any(Object),
      });
    });
  });
});
