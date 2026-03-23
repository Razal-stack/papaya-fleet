import { db } from "@papaya-fleet/db";
import type { CreateDriverInput, DriverFilter } from "@papaya-fleet/validation";

export class DriverService {
  /**
   * Get all drivers with basic pagination
   */
  static async findMany(filter: DriverFilter) {
    const { page = 1, limit = 20, sort_by = "created_at", sort_order = "desc" } = filter;

    const skip = (page - 1) * limit;

    const [drivers, totalCount] = await Promise.all([
      db.driver.findMany({
        include: {
          primary_vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              license_plate: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sort_by]: sort_order },
      }),
      db.driver.count(),
    ]);

    // Transform to camelCase for frontend
    const transformedDrivers = drivers.map((d) => ({
      id: d.id,
      firstName: d.first_name,
      lastName: d.last_name,
      email: d.email,
      phone: d.phone,
      licenseNumber: d.license_number,
      licenseClass: d.license_class,
      licenseExpiry: d.license_expiry?.toISOString() || null,
      status: d.status?.toLowerCase() || "unknown",
      dateOfBirth: d.date_of_birth?.toISOString() || null,
      hireDate: d.hire_date?.toISOString() || null,
      emergencyContact: d.emergency_contact_name,
      emergencyPhone: d.emergency_contact_phone,
      address: d.street_address,
      city: d.city,
      state: d.state_province,
      zipCode: d.postal_code,
      vehicleId: d.primary_vehicle?.id || null,
      vehicle: d.primary_vehicle
        ? {
            id: d.primary_vehicle.id,
            registrationNumber: d.primary_vehicle.license_plate,
            make: d.primary_vehicle.make,
            model: d.primary_vehicle.model,
            year: d.primary_vehicle.year,
          }
        : null,
      createdAt: d.created_at.toISOString(),
      updatedAt: d.updated_at.toISOString(),
    }));

    return {
      items: transformedDrivers,
      total: totalCount,
      page,
      pageSize: limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * Get a single driver by ID
   */
  static async findById(id: string) {
    const driver = await db.driver.findUnique({
      where: { id },
      include: {
        primary_vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            license_plate: true,
          },
        },
      },
    });

    if (!driver) {
      throw new Error("Driver not found");
    }

    // Transform to camelCase for frontend
    return {
      id: driver.id,
      firstName: driver.first_name,
      lastName: driver.last_name,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.license_number,
      licenseClass: driver.license_class,
      licenseExpiry: driver.license_expiry?.toISOString() || null,
      status: driver.status?.toLowerCase() || "unknown",
      dateOfBirth: driver.date_of_birth?.toISOString() || null,
      hireDate: driver.hire_date?.toISOString() || null,
      emergencyContact: driver.emergency_contact_name,
      emergencyPhone: driver.emergency_contact_phone,
      address: driver.street_address,
      city: driver.city,
      state: driver.state_province,
      zipCode: driver.postal_code,
      vehicleId: driver.primary_vehicle?.id || null,
      vehicle: driver.primary_vehicle
        ? {
            id: driver.primary_vehicle.id,
            registrationNumber: driver.primary_vehicle.license_plate,
            make: driver.primary_vehicle.make,
            model: driver.primary_vehicle.model,
            year: driver.primary_vehicle.year,
          }
        : null,
      createdAt: driver.created_at.toISOString(),
      updatedAt: driver.updated_at.toISOString(),
    };
  }

  /**
   * Create a new driver
   */
  static async create(data: CreateDriverInput) {
    // Check for duplicate employee ID
    const existingEmployeeId = await db.driver.findUnique({
      where: { employee_id: data.employee_id },
      select: { id: true, employee_id: true },
    });

    if (existingEmployeeId) {
      throw new Error(`Driver with employee ID ${data.employee_id} already exists`);
    }

    // Check for duplicate email
    const existingEmail = await db.driver.findUnique({
      where: { email: data.email },
      select: { id: true, email: true },
    });

    if (existingEmail) {
      throw new Error(`Driver with email ${data.email} already exists`);
    }

    // Check for duplicate license number
    const existingLicense = await db.driver.findUnique({
      where: { license_number: data.license_number },
      select: { id: true, license_number: true },
    });

    if (existingLicense) {
      throw new Error(`Driver with license number ${data.license_number} already exists`);
    }

    // Create the driver
    const driver = await db.driver.create({
      data: {
        employee_id: data.employee_id,
        first_name: data.first_name,
        last_name: data.last_name,
        middle_name: data.middle_name,
        email: data.email,
        phone: data.phone,
        alternate_phone: data.alternate_phone,
        date_of_birth: new Date(data.date_of_birth),
        street_address: data.street_address,
        city: data.city,
        state_province: data.state_province,
        postal_code: data.postal_code,
        country: data.country || "USA",
        license_number: data.license_number,
        license_class: data.license_class,
        license_state: data.license_state,
        license_expiry: new Date(data.license_expiry),
        license_restrictions: data.license_restrictions,
        status: data.status || "ACTIVE",
        hire_date: new Date(data.hire_date),
        termination_date: data.termination_date ? new Date(data.termination_date) : undefined,
        department: data.department,
        supervisor_name: data.supervisor_name,
        supervisor_email: data.supervisor_email,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_relation: data.emergency_contact_relation,
        certifications: data.certifications || [],
        last_training_date: data.last_training_date ? new Date(data.last_training_date) : undefined,
        next_training_date: data.next_training_date ? new Date(data.next_training_date) : undefined,
        safety_score: data.safety_score || 100,
        total_miles_driven: data.total_miles_driven || 0,
        accidents_count: data.accidents_count || 0,
        violations_count: data.violations_count || 0,
        notes: data.notes,
        profile_picture: data.profile_picture,
      },
      include: {
        primary_vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            license_plate: true,
          },
        },
      },
    });

    // Transform to camelCase for frontend
    return {
      id: driver.id,
      firstName: driver.first_name,
      lastName: driver.last_name,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.license_number,
      licenseClass: driver.license_class,
      licenseExpiry: driver.license_expiry?.toISOString() || null,
      status: driver.status?.toLowerCase() || "unknown",
      dateOfBirth: driver.date_of_birth?.toISOString() || null,
      hireDate: driver.hire_date?.toISOString() || null,
      emergencyContact: driver.emergency_contact_name,
      emergencyPhone: driver.emergency_contact_phone,
      address: driver.street_address,
      city: driver.city,
      state: driver.state_province,
      zipCode: driver.postal_code,
      vehicleId: driver.primary_vehicle?.id || null,
      vehicle: driver.primary_vehicle
        ? {
            id: driver.primary_vehicle.id,
            registrationNumber: driver.primary_vehicle.license_plate,
            make: driver.primary_vehicle.make,
            model: driver.primary_vehicle.model,
            year: driver.primary_vehicle.year,
          }
        : null,
      createdAt: driver.created_at.toISOString(),
      updatedAt: driver.updated_at.toISOString(),
    };
  }
}
