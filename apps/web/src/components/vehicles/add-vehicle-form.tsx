import { zodResolver } from "@hookform/resolvers/zod";
import { generateFakeVehicleData } from "@papaya-fleet/forms";
// UI Components with Form components for proper integration
import { Button } from "@papaya-fleet/ui/components/button";
import { DatePicker } from "@papaya-fleet/ui/components/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@papaya-fleet/ui/components/form";
import { Input } from "@papaya-fleet/ui/components/input";
import { ScrollArea } from "@papaya-fleet/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@papaya-fleet/ui/components/select";
import { Textarea } from "@papaya-fleet/ui/components/textarea";
import { type ApiError, toApiError } from "@papaya-fleet/utils";
import { type CreateVehicleInput, createVehicleSchema } from "@papaya-fleet/validation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Car, DollarSign, FileText, Loader2, MapPin, Package, Wand2, Wrench } from "lucide-react";
// Form utilities - use react-hook-form directly for compatibility
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { queryClient, trpc } from "@/utils/trpc";
import { getVehicleFormDefaults } from "./vehicle-form-defaults";

interface AddVehicleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Vehicle categories
const VEHICLE_CATEGORIES = [
  { value: "SEDAN", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "TRUCK", label: "Truck" },
  { value: "VAN", label: "Van" },
  { value: "MINIVAN", label: "Minivan" },
  { value: "PICKUP", label: "Pickup" },
  { value: "MOTORCYCLE", label: "Motorcycle" },
  { value: "BUS", label: "Bus" },
  { value: "TRAILER", label: "Trailer" },
  { value: "SPECIALIZED", label: "Specialized" },
];

// Fuel types
const FUEL_TYPES = [
  { value: "GASOLINE", label: "Gasoline" },
  { value: "DIESEL", label: "Diesel" },
  { value: "ELECTRIC", label: "Electric" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "CNG", label: "CNG" },
  { value: "LPG", label: "LPG" },
  { value: "HYDROGEN", label: "Hydrogen" },
];

// Vehicle statuses
const VEHICLE_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "REPAIR", label: "Repair" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "RETIRED", label: "Retired" },
  { value: "RESERVED", label: "Reserved" },
];

// Transmission types
const TRANSMISSION_TYPES = [
  { value: "Manual", label: "Manual" },
  { value: "Automatic", label: "Automatic" },
  { value: "CVT", label: "CVT" },
  { value: "Semi-Automatic", label: "Semi-Automatic" },
];

export function AddVehicleForm({ onSuccess, onCancel }: AddVehicleFormProps) {
  // Initialize form with Zod schema using react-hook-form directly
  const form = useForm<CreateVehicleInput>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: getVehicleFormDefaults(), // Use comprehensive defaults
    mode: "onChange", // Real-time validation for better UX
  });

  // Fetch available drivers
  const { data: driversData } = useQuery({
    ...trpc.driver.getAll.queryOptions({
      page: 1,
      limit: 100, // Get more drivers for selection
      sort_by: "first_name",
      sort_order: "asc",
    }),
  });

  // Set up the mutation using useMutation with trpc options
  const createVehicleMutation = useMutation({
    ...trpc.vehicle.create.mutationOptions(),
    onSuccess: () => {
      toast.success("Vehicle created successfully!");
      // Invalidate the vehicle list query to refresh data
      queryClient.invalidateQueries({ queryKey: [["vehicle", "getAll"]] });
      form.reset(); // Reset form after success
      onSuccess();
    },
    onError: (error: unknown) => {
      const apiError = toApiError(error);
      toast.error(apiError.message || "Failed to create vehicle");
    },
  });

  // Handle form submission
  const onSubmit = async (data: CreateVehicleInput) => {
    await createVehicleMutation.mutateAsync(data);
  };

  // Auto-fill function with comprehensive field handling
  const handleAutoFill = () => {
    const fakeData = generateFakeVehicleData();

    // Log for debugging
    console.log("Generated fake data:", fakeData);

    // Basic Information - Required fields
    form.setValue("vin", fakeData.vin || generateVIN());
    form.setValue("license_plate", fakeData.license_plate || generateLicensePlate());
    form.setValue("make", fakeData.make || "Toyota");
    form.setValue("model", fakeData.model || "Camry");
    form.setValue("year", fakeData.year || new Date().getFullYear());

    // Optional basic fields
    form.setValue("color", fakeData.color || "");

    // Dropdowns - Required fields with defaults
    form.setValue("category", fakeData.category || "SEDAN");
    form.setValue("fuel_type", fakeData.fuel_type || "GASOLINE");
    form.setValue("status", fakeData.status || "ACTIVE");

    // Optional dropdown
    form.setValue("transmission_type", fakeData.transmission_type || "");

    // Tracking & Location - all optional
    form.setValue("current_mileage", fakeData.current_mileage || 0);
    form.setValue("current_location", fakeData.current_location || "");
    form.setValue("home_location", fakeData.home_location || "");
    form.setValue("department", fakeData.department || "");

    // Registration & Compliance - all optional
    form.setValue("registration_number", fakeData.registration_number || "");
    form.setValue("registration_expiry", fakeData.registration_expiry || "");
    form.setValue("insurance_policy_no", fakeData.insurance_policy_no || "");
    form.setValue("insurance_expiry", fakeData.insurance_expiry || "");

    // Service Information - only dates, NO mileage fields (they don't exist in form)
    form.setValue("last_service_date", fakeData.last_service_date || "");
    form.setValue("next_service_date", fakeData.next_service_date || "");

    // Specifications - all optional (keep undefined for number fields)
    form.setValue("seating_capacity", fakeData.seating_capacity || undefined);
    form.setValue("cargo_capacity", fakeData.cargo_capacity || undefined);
    form.setValue("fuel_capacity", fakeData.fuel_capacity || undefined);

    // Purchase/Lease Information - all optional
    form.setValue("purchase_date", fakeData.purchase_date || "");
    form.setValue("purchase_price", fakeData.purchase_price || undefined);
    form.setValue("lease_end_date", fakeData.lease_end_date || "");
    form.setValue("cost_center", fakeData.cost_center || "");

    // Additional Information
    form.setValue("notes", fakeData.notes || "");

    // Don't auto-assign driver
    form.setValue("primary_driver_id", "");

    // Trigger validation and show success message
    setTimeout(() => {
      form.trigger();
      toast.success("Form auto-filled with test data!");
    }, 100);
  };

  // Helper functions for generating data
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
    return `${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}-${Math.floor(Math.random() * 9000) + 1000}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            <div className="space-y-6 pb-6 w-full">
              {/* Auto-fill Button */}
              <div className="flex justify-end mb-4">
                <Button
                  type="button"
                  onClick={handleAutoFill}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Auto-fill with Test Data
                </Button>
              </div>

              {/* Basic Information Section */}
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>

                {/* Row 1: VIN and License Plate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          VIN <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter 17-character VIN" maxLength={17} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="license_plate"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          License Plate <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., ABC-123" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 2: Make, Model, Year - 3 columns makes sense here */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Make <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Toyota" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Model <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Camry" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Year <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="2024"
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 3: Color and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Silver" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Category <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {VEHICLE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value} className="py-2">
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 4: Fuel Type and Transmission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="fuel_type"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Fuel Type <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fuel type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FUEL_TYPES.map((fuel) => (
                              <SelectItem key={fuel.value} value={fuel.value} className="py-2">
                                {fuel.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transmission_type"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Transmission</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transmission" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TRANSMISSION_TYPES.map((trans) => (
                              <SelectItem key={trans.value} value={trans.value} className="py-2">
                                {trans.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 5: Status and Assign Driver */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Status <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "ACTIVE"}
                          defaultValue={field.value || "ACTIVE"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {VEHICLE_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value} className="py-2">
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primary_driver_id"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Assign Driver</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          defaultValue={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a driver (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="" className="py-2">
                              No driver assigned
                            </SelectItem>
                            {driversData?.items?.map((driver: any) => (
                              <SelectItem key={driver.id} value={driver.id} className="py-2">
                                {driver.firstName} {driver.lastName} - {driver.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Tracking & Location Section */}
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Tracking & Location</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="current_mileage"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Current Mileage</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="0"
                            min="0"
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="current_location"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Current Location</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Main Office" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="home_location"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Home Location</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Fleet Garage A" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Sales" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Registration & Compliance Section */}
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Registration & Compliance</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="registration_number"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Registration Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., REG-12345" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration_expiry"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Registration Expiry</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => field.onChange(date?.toISOString())}
                            placeholder="Select expiry date"
                            disabled={false}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="insurance_policy_no"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Insurance Policy</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., POL-12345" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="insurance_expiry"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Insurance Expiry</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => field.onChange(date?.toISOString())}
                            placeholder="Select expiry date"
                            disabled={false}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Service Information Section */}
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Service Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="last_service_date"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Last Service Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => field.onChange(date?.toISOString())}
                            placeholder="Select last service date"
                            disabled={false}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="next_service_date"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Next Service Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => field.onChange(date?.toISOString())}
                            placeholder="Select next service date"
                            disabled={false}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Specifications Section */}
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Specifications</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="seating_capacity"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Seating Capacity</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="e.g., 5"
                            min="1"
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value, 10) || undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargo_capacity"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Cargo Capacity (m³)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.1"
                            placeholder="e.g., 15.5"
                            min="0"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fuel_capacity"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Fuel Capacity (L)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.1"
                            placeholder="e.g., 60"
                            min="0"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Purchase/Lease Information Section */}
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Purchase/Lease Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="purchase_date"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Purchase Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => field.onChange(date?.toISOString())}
                            placeholder="Select purchase date"
                            disabled={false}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purchase_price"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Purchase Price</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="e.g., 25000"
                            min="0"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="lease_end_date"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Lease End Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => field.onChange(date?.toISOString())}
                            placeholder="Select lease end date"
                            disabled={false}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cost_center"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Cost Center</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., CC-001" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="mt-6 space-y-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Additional notes about the vehicle..."
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 px-8 py-6 border-t border-border/50 bg-gradient-to-r from-background to-muted/20 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createVehicleMutation.isPending}
            className="h-11 px-6 border-border/60 hover:bg-muted/50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createVehicleMutation.isPending}
            className="h-11 px-6 bg-primary hover:bg-primary/90 shadow-md"
          >
            {createVehicleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Vehicle...
              </>
            ) : (
              "Create Vehicle"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
