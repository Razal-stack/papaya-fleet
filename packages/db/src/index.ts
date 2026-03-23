import { env } from "@papaya-fleet/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;

// Export types from Prisma
export type {
  Driver,
  DriverStatus,
  FuelType,
  LicenseClass,
  MaintenanceLog,
  Prisma,
  Vehicle,
  VehicleAssignment,
  VehicleCategory,
  VehicleStatus,
} from "../prisma/generated/client";
export { prisma as db };
