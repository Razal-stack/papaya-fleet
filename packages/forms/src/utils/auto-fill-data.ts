import type { CreateDriverInput, CreateVehicleInput } from "@papaya-fleet/validation";

// Random data generators
const randomFromArray = <T>(arr: Array<T>): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals = 2): number =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// Generate random dates
const randomPastDate = (yearsAgo: number): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - randomInt(0, yearsAgo));
  date.setMonth(randomInt(0, 11));
  date.setDate(randomInt(1, 28));
  return date.toISOString();
};

const randomFutureDate = (yearsAhead: number): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + randomInt(1, yearsAhead));
  date.setMonth(randomInt(0, 11));
  date.setDate(randomInt(1, 28));
  return date.toISOString();
};

// Data pools
const FIRST_NAMES = [
  "James",
  "John",
  "Robert",
  "Michael",
  "David",
  "William",
  "Richard",
  "Joseph",
  "Thomas",
  "Christopher",
  "Mary",
  "Patricia",
  "Jennifer",
  "Linda",
  "Elizabeth",
  "Barbara",
  "Susan",
  "Jessica",
  "Sarah",
  "Karen",
  "Daniel",
  "Matthew",
  "Anthony",
  "Mark",
  "Paul",
  "Steven",
  "Andrew",
  "Joshua",
  "Kenneth",
  "Kevin",
  "Nancy",
  "Betty",
  "Helen",
  "Sandra",
  "Donna",
  "Carol",
  "Ruth",
  "Sharon",
  "Michelle",
  "Laura",
];

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
];

const STREET_NAMES = [
  "Main",
  "Oak",
  "Maple",
  "Cedar",
  "Pine",
  "Elm",
  "Washington",
  "Lake",
  "Hill",
  "Park",
  "Church",
  "Spring",
  "North",
  "South",
  "East",
  "West",
  "River",
  "Forest",
  "Mountain",
  "Valley",
];

const STREET_TYPES = [
  "Street",
  "Avenue",
  "Boulevard",
  "Drive",
  "Road",
  "Lane",
  "Way",
  "Court",
  "Place",
  "Circle",
];

const CITIES = [
  { name: "New York", state: "NY", zip: "10001" },
  { name: "Los Angeles", state: "CA", zip: "90001" },
  { name: "Chicago", state: "IL", zip: "60601" },
  { name: "Houston", state: "TX", zip: "77001" },
  { name: "Phoenix", state: "AZ", zip: "85001" },
  { name: "Philadelphia", state: "PA", zip: "19101" },
  { name: "San Antonio", state: "TX", zip: "78201" },
  { name: "San Diego", state: "CA", zip: "92101" },
  { name: "Dallas", state: "TX", zip: "75201" },
  { name: "San Jose", state: "CA", zip: "95101" },
  { name: "Austin", state: "TX", zip: "78701" },
  { name: "Jacksonville", state: "FL", zip: "32201" },
  { name: "Fort Worth", state: "TX", zip: "76101" },
  { name: "Columbus", state: "OH", zip: "43201" },
  { name: "Indianapolis", state: "IN", zip: "46201" },
  { name: "Charlotte", state: "NC", zip: "28201" },
  { name: "San Francisco", state: "CA", zip: "94101" },
  { name: "Seattle", state: "WA", zip: "98101" },
  { name: "Denver", state: "CO", zip: "80201" },
  { name: "Boston", state: "MA", zip: "02101" },
];

const VEHICLE_MAKES_MODELS = {
  Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "Prius", "Tacoma", "4Runner", "Sienna"],
  Honda: ["Accord", "Civic", "CR-V", "Pilot", "HR-V", "Odyssey", "Ridgeline", "Fit"],
  Ford: ["F-150", "Mustang", "Explorer", "Escape", "Focus", "Fusion", "Edge", "Expedition"],
  Chevrolet: [
    "Silverado",
    "Malibu",
    "Equinox",
    "Tahoe",
    "Cruze",
    "Traverse",
    "Colorado",
    "Suburban",
  ],
  BMW: ["3 Series", "5 Series", "X3", "X5", "M4", "X1", "7 Series", "i4"],
  Mercedes: ["C-Class", "E-Class", "GLC", "GLE", "S-Class", "A-Class", "GLA", "G-Class"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck"],
  Nissan: ["Altima", "Sentra", "Rogue", "Pathfinder", "Leaf", "Frontier", "Murano", "Titan"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Kona", "Ioniq", "Venue"],
  Kia: ["Forte", "Optima", "Sportage", "Sorento", "Telluride", "Soul", "Stinger", "Carnival"],
  Volkswagen: ["Jetta", "Passat", "Tiguan", "Atlas", "Golf", "ID.4", "Arteon", "Taos"],
  Mazda: ["Mazda3", "Mazda6", "CX-5", "CX-9", "MX-5", "CX-30", "CX-50", "CX-90"],
  Subaru: ["Outback", "Impreza", "Crosstrek", "Ascent", "Legacy", "Forester", "WRX", "BRZ"],
  Jeep: ["Wrangler", "Cherokee", "Grand Cherokee", "Compass", "Renegade", "Gladiator", "Wagoneer"],
  Ram: ["1500", "2500", "3500", "ProMaster", "ProMaster City"],
  GMC: ["Sierra", "Acadia", "Terrain", "Canyon", "Yukon", "Savana"],
  Audi: ["A3", "A4", "A6", "Q3", "Q5", "Q7", "e-tron", "RS5"],
  Lexus: ["ES", "IS", "GS", "RX", "NX", "GX", "UX", "LS"],
};

const COLORS = [
  "Silver",
  "Black",
  "White",
  "Red",
  "Blue",
  "Gray",
  "Green",
  "Gold",
  "Brown",
  "Orange",
  "Pearl White",
  "Midnight Blue",
  "Charcoal",
  "Burgundy",
  "Forest Green",
];

const LOCATIONS = [
  "Main Office",
  "North Branch",
  "South Depot",
  "East Warehouse",
  "West Garage",
  "Downtown Hub",
  "Airport Location",
  "Central Station",
  "Regional Office",
  "Distribution Center",
  "Fleet Garage A",
  "Fleet Garage B",
  "Maintenance Bay 1",
  "Maintenance Bay 2",
  "Customer Service Center",
];

const DEPARTMENTS = [
  "Sales",
  "Operations",
  "Logistics",
  "Management",
  "Service",
  "Delivery",
  "Executive",
  "IT",
  "Finance",
  "Marketing",
  "Human Resources",
  "Customer Service",
  "Fleet Management",
  "Maintenance",
  "Procurement",
];

const CERTIFICATIONS = [
  "CDL Class A",
  "CDL Class B",
  "HAZMAT",
  "Defensive Driving",
  "Forklift Operation",
  "DOT Compliance",
  "Safety Training",
  "First Aid/CPR",
  "Advanced Driving",
  "Crane Operation",
];

// Helper functions
const generateVIN = (): string => {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
  let vin = "";
  for (let i = 0; i < 17; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  return vin;
};

const generateLicensePlate = (): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const _numbers = "0123456789";
  const formats = [
    () =>
      `${randomFromArray(letters.split(""))}${randomFromArray(letters.split(""))}${randomFromArray(letters.split(""))}${randomInt(100, 999)}`,
    () =>
      `${randomInt(100, 999)}-${randomFromArray(letters.split(""))}${randomFromArray(letters.split(""))}${randomFromArray(letters.split(""))}`,
    () =>
      `${randomFromArray(letters.split(""))}${randomFromArray(letters.split(""))}${randomFromArray(letters.split(""))}-${randomInt(1000, 9999)}`,
    () =>
      `${randomInt(10, 99)}${randomFromArray(letters.split(""))}${randomFromArray(letters.split(""))}${randomInt(100, 999)}`,
  ];
  return randomFromArray(formats)();
};

const generateEmployeeId = (): string => {
  const prefix = randomFromArray(["EMP", "DR", "OP", "FL"]);
  return `${prefix}-${randomInt(10000, 99999)}`;
};

const generateDriverLicense = (): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return `${randomFromArray(letters.split(""))}${randomInt(100000000, 999999999)}`;
};

const generateEmail = (firstName: string, lastName: string): string => {
  const domains = ["company.com", "fleet.com", "transport.com", "logistics.com", "delivery.com"];
  const formats = [
    () => `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomFromArray(domains)}`,
    () =>
      `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}@${randomFromArray(domains)}`,
    () =>
      `${firstName.toLowerCase()}${lastName.charAt(0).toLowerCase()}@${randomFromArray(domains)}`,
    () => `${firstName.toLowerCase()}_${lastName.toLowerCase()}@${randomFromArray(domains)}`,
  ];
  return randomFromArray(formats)();
};

const generatePhone = (): string => {
  const areaCode = randomInt(200, 999);
  const prefix = randomInt(200, 999);
  const suffix = randomInt(1000, 9999);
  return `${areaCode}-${prefix}-${suffix}`;
};

// Main export functions
export function generateFakeVehicleData(): Partial<CreateVehicleInput> {
  const make = randomFromArray(Object.keys(VEHICLE_MAKES_MODELS));
  const models = VEHICLE_MAKES_MODELS[make as keyof typeof VEHICLE_MAKES_MODELS];
  const model = randomFromArray(models);
  const year = randomInt(2018, new Date().getFullYear() + 1);
  const currentMileage = randomInt(0, 150000);

  const categories = [
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
  ] as const;
  const fuelTypes = ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID", "CNG", "LPG", "HYDROGEN"] as const;
  const transmissions = ["Manual", "Automatic", "CVT", "Semi-Automatic"];
  const statuses = ["ACTIVE", "MAINTENANCE", "REPAIR", "INACTIVE", "RETIRED", "RESERVED"] as const;

  const purchaseDate = randomPastDate(5);
  const lastServiceDate = randomPastDate(1);

  const vehicleData: Partial<CreateVehicleInput> = {
    // Basic Information - ALL REQUIRED
    vin: generateVIN(),
    license_plate: generateLicensePlate(),
    make,
    model,
    year,
    color: randomFromArray(COLORS),

    // Classification - ALL REQUIRED
    category: randomFromArray(categories),
    fuel_type: randomFromArray(fuelTypes),
    transmission_type: randomFromArray(transmissions),
    status: randomFromArray(statuses),

    // Tracking & Location
    current_mileage: currentMileage,
    current_location: randomFromArray(LOCATIONS),
    home_location: randomFromArray(LOCATIONS),
    department: randomFromArray(DEPARTMENTS),

    // Registration & Compliance
    registration_number: `REG-${randomInt(100000, 999999)}`,
    registration_expiry: randomFutureDate(2),
    insurance_policy_no: `POL-${randomInt(100000, 999999)}`,
    insurance_expiry: randomFutureDate(1),

    // Service Information
    last_service_date: lastServiceDate,
    next_service_date: randomFutureDate(1),

    // Specifications
    seating_capacity: randomInt(2, 8),
    cargo_capacity: randomFloat(5, 50),
    fuel_capacity: randomInt(40, 120),

    // Purchase/Lease Information
    purchase_date: purchaseDate,
    purchase_price: randomInt(20000, 80000),
    cost_center: `CC-${randomInt(100, 999).toString().padStart(3, "0")}`,

    // Additional Information
    notes: `Test vehicle added via auto-fill. ${make} ${model} ${year} in excellent condition.`,
  };

  // Only add lease_end_date 50% of the time
  if (Math.random() > 0.5) {
    vehicleData.lease_end_date = randomFutureDate(3);
  }

  return vehicleData;
}

export function generateFakeDriverData(): Partial<CreateDriverInput> {
  const firstName = randomFromArray(FIRST_NAMES);
  const lastName = randomFromArray(LAST_NAMES);
  const city = randomFromArray(CITIES);
  const birthYear = new Date().getFullYear() - randomInt(25, 65);
  const birthDate = new Date(birthYear, randomInt(0, 11), randomInt(1, 28)).toISOString();
  const hireYear = new Date().getFullYear() - randomInt(0, 15);
  const hireDate = new Date(hireYear, randomInt(0, 11), randomInt(1, 28)).toISOString();

  const statuses = ["ACTIVE", "INACTIVE", "ON_LEAVE", "SUSPENDED", "TRAINING"] as const;
  const licenseClasses = ["A", "B", "C", "D", "CDL", "SPECIAL"] as const;
  const relations = ["Spouse", "Parent", "Sibling", "Friend", "Partner", "Child"];

  // Generate emergency contact
  const emergencyFirstName = randomFromArray(FIRST_NAMES);
  const emergencyLastName = randomFromArray(LAST_NAMES);

  // Generate certifications
  const numCertifications = randomInt(1, 4);
  const driverCertifications: Array<string> = [];
  for (let i = 0; i < numCertifications; i++) {
    const cert = randomFromArray(CERTIFICATIONS);
    if (!driverCertifications.includes(cert)) {
      driverCertifications.push(cert);
    }
  }

  return {
    employee_id: generateEmployeeId(),

    // Personal information
    first_name: firstName,
    last_name: lastName,
    middle_name: randomFromArray(["", "A.", "B.", "C.", "D.", "E.", "J.", "M.", "R.", "S."]),
    email: generateEmail(firstName, lastName),
    phone: generatePhone(),
    alternate_phone: Math.random() > 0.5 ? generatePhone() : undefined,
    date_of_birth: birthDate,

    // Address
    street_address: `${randomInt(100, 9999)} ${randomFromArray(STREET_NAMES)} ${randomFromArray(STREET_TYPES)}`,
    city: city.name,
    state_province: city.state,
    postal_code: city.zip,
    country: "USA",

    // License information
    license_number: generateDriverLicense(),
    license_class: randomFromArray(licenseClasses),
    license_state: city.state,
    license_expiry: randomFutureDate(3),
    license_restrictions: Math.random() > 0.7 ? "Corrective lenses required" : undefined,

    // Employment
    status: randomFromArray(statuses),
    hire_date: hireDate,
    department: randomFromArray(DEPARTMENTS),
    supervisor_name: `${randomFromArray(FIRST_NAMES)} ${randomFromArray(LAST_NAMES)}`,
    supervisor_email: generateEmail(randomFromArray(FIRST_NAMES), randomFromArray(LAST_NAMES)),

    // Emergency contact
    emergency_contact_name: `${emergencyFirstName} ${emergencyLastName}`,
    emergency_contact_phone: generatePhone(),
    emergency_contact_relation: randomFromArray(relations),

    // Certifications and training
    certifications: driverCertifications,
    last_training_date: randomPastDate(1),
    next_training_date: randomFutureDate(1),

    // Performance metrics
    safety_score: randomInt(75, 100),
    total_miles_driven: randomInt(1000, 500000),
    accidents_count: Math.random() > 0.8 ? randomInt(1, 3) : 0,
    violations_count: Math.random() > 0.9 ? randomInt(1, 2) : 0,

    // Metadata
    notes: `Test driver profile created via auto-fill. ${firstName} ${lastName} is an experienced driver with ${driverCertifications.length} certification(s).`,
  };
}

// Batch generation functions
export function generateMultipleVehicles(count: number): Array<Partial<CreateVehicleInput>> {
  const vehicles: Array<Partial<CreateVehicleInput>> = [];
  for (let i = 0; i < count; i++) {
    vehicles.push(generateFakeVehicleData());
  }
  return vehicles;
}

export function generateMultipleDrivers(count: number): Array<Partial<CreateDriverInput>> {
  const drivers: Array<Partial<CreateDriverInput>> = [];
  for (let i = 0; i < count; i++) {
    drivers.push(generateFakeDriverData());
  }
  return drivers;
}

// Export specific field generators for custom use
export const generators = {
  vin: generateVIN,
  licensePlate: generateLicensePlate,
  employeeId: generateEmployeeId,
  driverLicense: generateDriverLicense,
  email: generateEmail,
  phone: generatePhone,
  pastDate: randomPastDate,
  futureDate: randomFutureDate,
  randomFromArray,
  randomInt,
  randomFloat,
};
