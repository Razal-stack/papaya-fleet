#!/usr/bin/env bun

import path from "node:path";
import { fileURLToPath } from "node:url";
// Load environment variables before any other imports
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../apps/server/.env") });

// Set the required environment variables if they're not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5440/papaya-fleet";
}
if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET = "supersecret";
}
if (!process.env.BETTER_AUTH_URL) {
  process.env.BETTER_AUTH_URL = "http://localhost:3100";
}
if (!process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN = "http://localhost:3100";
}

// Now import the database and faker functions
const { db } = await import("./src/index");
const { generateFakeDriverData, generateFakeVehicleData } = await import("@papaya-fleet/forms");

async function seed() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await db.vehicleAssignment.deleteMany({});
  await db.maintenanceLog.deleteMany({});
  await db.vehicle.deleteMany({});
  await db.driver.deleteMany({});

  console.log("🗑️  Cleared existing data");

  // Create 15 drivers using faker data
  const driverPromises = [];
  for (let i = 0; i < 15; i++) {
    const fakeData = generateFakeDriverData();

    // Ensure required fields are present (fix any undefined values)
    const driverData = {
      employee_id: fakeData.employee_id || `EMP${String(i + 1).padStart(3, "0")}`,
      first_name: fakeData.first_name || "John",
      last_name: fakeData.last_name || "Doe",
      middle_name: fakeData.middle_name,
      email: fakeData.email || `driver${i + 1}@fleet.com`,
      phone: fakeData.phone || "555-0000",
      alternate_phone: fakeData.alternate_phone,
      date_of_birth: fakeData.date_of_birth
        ? new Date(fakeData.date_of_birth)
        : new Date("1985-01-01"),
      street_address: fakeData.street_address || "123 Main St",
      city: fakeData.city || "New York",
      state_province: fakeData.state_province || "NY",
      postal_code: fakeData.postal_code || "10001",
      country: fakeData.country || "USA",
      license_number: fakeData.license_number || `DL${String(i + 1).padStart(6, "0")}`,
      license_class: fakeData.license_class || "B",
      license_state: fakeData.license_state || "NY",
      license_expiry: fakeData.license_expiry
        ? new Date(fakeData.license_expiry)
        : new Date("2025-12-31"),
      license_restrictions: fakeData.license_restrictions,
      status: fakeData.status || "ACTIVE",
      hire_date: fakeData.hire_date ? new Date(fakeData.hire_date) : new Date("2020-01-01"),
      termination_date: fakeData.termination_date ? new Date(fakeData.termination_date) : undefined,
      department: fakeData.department,
      supervisor_name: fakeData.supervisor_name,
      supervisor_email: fakeData.supervisor_email,
      emergency_contact_name: fakeData.emergency_contact_name,
      emergency_contact_phone: fakeData.emergency_contact_phone,
      emergency_contact_relation: fakeData.emergency_contact_relation,
      certifications: fakeData.certifications || [],
      last_training_date: fakeData.last_training_date
        ? new Date(fakeData.last_training_date)
        : undefined,
      next_training_date: fakeData.next_training_date
        ? new Date(fakeData.next_training_date)
        : undefined,
      safety_score: fakeData.safety_score || 100,
      total_miles_driven: fakeData.total_miles_driven || 0,
      accidents_count: fakeData.accidents_count || 0,
      violations_count: fakeData.violations_count || 0,
      notes: fakeData.notes,
      tags: [],
      profile_picture: fakeData.profile_picture,
    };

    driverPromises.push(db.driver.create({ data: driverData }));
  }

  const drivers = await Promise.all(driverPromises);

  console.log(`✅ Created ${drivers.length} drivers`);

  // Create 15 vehicles using faker data
  const vehiclePromises = [];
  for (let i = 0; i < 15; i++) {
    const fakeData = generateFakeVehicleData();

    // Ensure required fields are present
    const vehicleData = {
      vin: fakeData.vin || `VIN${String(i + 1).padStart(14, "0")}`,
      license_plate: fakeData.license_plate || `PLT-${String(i + 1).padStart(3, "0")}`,
      make: fakeData.make || "Toyota",
      model: fakeData.model || "Camry",
      year: fakeData.year || 2023,
      color: fakeData.color,
      category: fakeData.category || "SEDAN",
      fuel_type: fakeData.fuel_type || "GASOLINE",
      transmission_type: fakeData.transmission_type,
      status: fakeData.status || "ACTIVE",
      current_mileage: fakeData.current_mileage || 0,
      last_service_date: fakeData.last_service_date
        ? new Date(fakeData.last_service_date)
        : undefined,
      next_service_date: fakeData.next_service_date
        ? new Date(fakeData.next_service_date)
        : undefined,
      current_location: fakeData.current_location,
      home_location: fakeData.home_location,
      registration_number: fakeData.registration_number,
      registration_expiry: fakeData.registration_expiry
        ? new Date(fakeData.registration_expiry)
        : undefined,
      insurance_policy_no: fakeData.insurance_policy_no,
      insurance_expiry: fakeData.insurance_expiry ? new Date(fakeData.insurance_expiry) : undefined,
      seating_capacity: fakeData.seating_capacity,
      cargo_capacity: fakeData.cargo_capacity,
      fuel_capacity: fakeData.fuel_capacity,
      purchase_date: fakeData.purchase_date ? new Date(fakeData.purchase_date) : undefined,
      purchase_price: fakeData.purchase_price,
      lease_end_date: fakeData.lease_end_date ? new Date(fakeData.lease_end_date) : undefined,
      department: fakeData.department,
      cost_center: fakeData.cost_center,
      notes: fakeData.notes,
      tags: [],
    };

    vehiclePromises.push(db.vehicle.create({ data: vehicleData }));
  }

  const vehicles = await Promise.all(vehiclePromises);

  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Assign some drivers to vehicles (roughly 60% assignment rate)
  const assignments = [];
  const assignmentIndices = new Set();

  // Generate random assignments (ensuring no duplicates)
  for (let i = 0; i < 9; i++) {
    const vehicleIndex = Math.floor(Math.random() * vehicles.length);
    const driverIndex = Math.floor(Math.random() * drivers.length);

    const key = `${vehicleIndex}-${driverIndex}`;
    if (
      !assignmentIndices.has(key) &&
      vehicleIndex < vehicles.length &&
      driverIndex < drivers.length
    ) {
      assignmentIndices.add(key);
      assignments.push({ vehicleIndex, driverIndex });
    }
  }

  for (const { vehicleIndex, driverIndex } of assignments) {
    try {
      await db.vehicle.update({
        where: { id: vehicles[vehicleIndex].id },
        data: { primary_driver_id: drivers[driverIndex].id },
      });

      await db.vehicleAssignment.create({
        data: {
          vehicle_id: vehicles[vehicleIndex].id,
          driver_id: drivers[driverIndex].id,
          start_mileage: vehicles[vehicleIndex].current_mileage,
          assignment_reason: "Regular assignment",
        },
      });
    } catch (error) {
      console.warn(
        `⚠️ Could not assign driver ${driverIndex} to vehicle ${vehicleIndex}:`,
        error.message,
      );
    }
  }

  console.log(`✅ Created ${assignments.length} vehicle-driver assignments`);

  // Create some maintenance logs for random vehicles
  const maintenancePromises = [];
  const maintenanceTypes = [
    "Oil Change",
    "Tire Rotation",
    "Brake Service",
    "Battery Check",
    "Filter Replacement",
  ];

  for (let i = 0; i < 10; i++) {
    const vehicleIndex = Math.floor(Math.random() * vehicles.length);
    const vehicle = vehicles[vehicleIndex];
    const maintenanceDate = new Date();
    maintenanceDate.setDate(maintenanceDate.getDate() - Math.floor(Math.random() * 180)); // Random date in last 6 months

    maintenancePromises.push(
      db.maintenanceLog.create({
        data: {
          vehicle_id: vehicle.id,
          maintenance_type: maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)],
          description: "Routine maintenance performed",
          performed_date: maintenanceDate,
          performed_by: "Fleet Service Center",
          mileage_at_service: Math.max(
            0,
            vehicle.current_mileage - Math.floor(Math.random() * 5000),
          ),
          cost: Math.floor(Math.random() * 500) + 50,
          next_service_due: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          parts_replaced: [],
        },
      }),
    );
  }

  await Promise.all(maintenancePromises);

  console.log(`✅ Created ${maintenancePromises.length} maintenance logs`);

  console.log("✨ Seed completed successfully!");
  console.log("📊 Summary:");
  console.log(`   - ${drivers.length} drivers`);
  console.log(`   - ${vehicles.length} vehicles`);
  console.log(`   - ${assignments.length} vehicle-driver assignments`);
  console.log(`   - ${maintenancePromises.length} maintenance logs`);
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
