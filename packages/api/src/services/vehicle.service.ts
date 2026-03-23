import type { Prisma } from "@papaya-fleet/db";
import { db } from "@papaya-fleet/db";
import type { CreateVehicleInput, VehicleFilter } from "@papaya-fleet/validation";

export class VehicleService {
  /**
   * Get all vehicles with pagination and filtering
   */
  static async findMany(filter: VehicleFilter) {
    const {
      page = 1,
      limit = 20,
      sort_by = "created_at",
      sort_order = "desc",
      status,
      category,
      fuel_type,
      department,
      current_location,
      search,
      year_min,
      year_max,
      mileage_min,
      mileage_max,
      has_driver,
      driver_id,
    } = filter;

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: Prisma.VehicleWhereInput = {};

    // Status filter - convert to uppercase for database enum
    if (status && status.length > 0) {
      where.status = { in: status };
    }

    // Category filter - convert to uppercase for database enum
    if (category && category.length > 0) {
      where.category = { in: category };
    }

    // Fuel type filter - convert to uppercase for database enum
    if (fuel_type && fuel_type.length > 0) {
      where.fuel_type = { in: fuel_type };
    }

    // Department filter
    if (department) {
      where.department = department;
    }

    // Location filter
    if (current_location) {
      where.current_location = {
        contains: current_location,
        mode: "insensitive",
      };
    }

    // Search filter - search in multiple fields
    if (search) {
      where.OR = [
        { vin: { contains: search, mode: "insensitive" } },
        { license_plate: { contains: search, mode: "insensitive" } },
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ];
    }

    // Year range filter
    if (year_min !== undefined || year_max !== undefined) {
      where.year = {};
      if (year_min !== undefined) {
        where.year.gte = year_min;
      }
      if (year_max !== undefined) {
        where.year.lte = year_max;
      }
    }

    // Mileage range filter
    if (mileage_min !== undefined || mileage_max !== undefined) {
      where.current_mileage = {};
      if (mileage_min !== undefined) {
        where.current_mileage.gte = mileage_min;
      }
      if (mileage_max !== undefined) {
        where.current_mileage.lte = mileage_max;
      }
    }

    // Driver filters
    if (has_driver !== undefined) {
      if (has_driver) {
        where.primary_driver_id = { not: null };
      } else {
        where.primary_driver_id = null;
      }
    }

    if (driver_id) {
      where.primary_driver_id = driver_id;
    }

    const [vehicles, totalCount] = await Promise.all([
      db.vehicle.findMany({
        where,
        include: {
          primary_driver: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sort_by]: sort_order },
      }),
      db.vehicle.count({ where }),
    ]);

    // Transform to camelCase for frontend
    const transformedVehicles = vehicles.map((v) => ({
      id: v.id,
      registrationNumber: v.license_plate,
      vehicleType: v.category?.toLowerCase() || "unknown",
      make: v.make,
      model: v.model,
      year: v.year,
      status: v.status?.toLowerCase() || "unknown",
      currentLocation: v.current_location,
      fuelType: v.fuel_type?.toLowerCase() || "unknown",
      mileage: v.current_mileage,
      driverId: v.primary_driver_id,
      driver: v.primary_driver
        ? {
            id: v.primary_driver.id,
            firstName: v.primary_driver.first_name,
            lastName: v.primary_driver.last_name,
            email: v.primary_driver.email,
          }
        : null,
      createdAt: v.created_at.toISOString(),
      updatedAt: v.updated_at.toISOString(),
    }));

    return {
      items: transformedVehicles,
      total: totalCount,
      page,
      pageSize: limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * Get a single vehicle by ID
   */
  static async findById(id: string) {
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        primary_driver: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    // Transform to camelCase for frontend
    return {
      id: vehicle.id,
      registrationNumber: vehicle.license_plate,
      vehicleType: vehicle.category?.toLowerCase() || "unknown",
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      status: vehicle.status?.toLowerCase() || "unknown",
      currentLocation: vehicle.current_location,
      fuelType: vehicle.fuel_type?.toLowerCase() || "unknown",
      mileage: vehicle.current_mileage,
      driverId: vehicle.primary_driver_id,
      driver: vehicle.primary_driver
        ? {
            id: vehicle.primary_driver.id,
            firstName: vehicle.primary_driver.first_name,
            lastName: vehicle.primary_driver.last_name,
            email: vehicle.primary_driver.email,
          }
        : null,
      createdAt: vehicle.created_at.toISOString(),
      updatedAt: vehicle.updated_at.toISOString(),
    };
  }

  /**
   * Create a new vehicle
   */
  static async create(data: CreateVehicleInput) {
    // Check for duplicate VIN
    const existingVin = await db.vehicle.findUnique({
      where: { vin: data.vin },
      select: { id: true, vin: true },
    });

    if (existingVin) {
      throw new Error(`Vehicle with VIN ${data.vin} already exists`);
    }

    // Check for duplicate license plate
    const existingPlate = await db.vehicle.findUnique({
      where: { license_plate: data.license_plate },
      select: { id: true, license_plate: true },
    });

    if (existingPlate) {
      throw new Error(`Vehicle with license plate ${data.license_plate} already exists`);
    }

    // Create the vehicle
    const vehicle = await db.vehicle.create({
      data: {
        vin: data.vin,
        license_plate: data.license_plate,
        make: data.make,
        model: data.model,
        year: data.year,
        color: data.color,
        category: data.category,
        fuel_type: data.fuel_type,
        transmission_type: data.transmission_type,
        status: data.status || "ACTIVE",
        current_mileage: data.current_mileage || 0,
        last_service_date: data.last_service_date ? new Date(data.last_service_date) : undefined,
        next_service_date: data.next_service_date ? new Date(data.next_service_date) : undefined,
        current_location: data.current_location,
        home_location: data.home_location,
        registration_number: data.registration_number,
        registration_expiry: data.registration_expiry
          ? new Date(data.registration_expiry)
          : undefined,
        insurance_policy_no: data.insurance_policy_no,
        insurance_expiry: data.insurance_expiry ? new Date(data.insurance_expiry) : undefined,
        seating_capacity: data.seating_capacity,
        cargo_capacity: data.cargo_capacity,
        fuel_capacity: data.fuel_capacity,
        purchase_date: data.purchase_date ? new Date(data.purchase_date) : undefined,
        purchase_price: data.purchase_price,
        lease_end_date: data.lease_end_date ? new Date(data.lease_end_date) : undefined,
        department: data.department,
        cost_center: data.cost_center,
        notes: data.notes,
      },
      include: {
        primary_driver: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    // Transform to camelCase for frontend
    return {
      id: vehicle.id,
      registrationNumber: vehicle.license_plate,
      vehicleType: vehicle.category?.toLowerCase() || "unknown",
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      status: vehicle.status?.toLowerCase() || "unknown",
      currentLocation: vehicle.current_location,
      fuelType: vehicle.fuel_type?.toLowerCase() || "unknown",
      mileage: vehicle.current_mileage,
      driverId: vehicle.primary_driver_id,
      driver: vehicle.primary_driver
        ? {
            id: vehicle.primary_driver.id,
            firstName: vehicle.primary_driver.first_name,
            lastName: vehicle.primary_driver.last_name,
            email: vehicle.primary_driver.email,
          }
        : null,
      createdAt: vehicle.created_at.toISOString(),
      updatedAt: vehicle.updated_at.toISOString(),
    };
  }
}
