import { zodResolver } from "@hookform/resolvers/zod";
import { generateFakeDriverData } from "@papaya-fleet/forms";
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
import { type CreateDriverInput, createDriverSchema } from "@papaya-fleet/validation";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Briefcase, FileText, Loader2, Shield, User, Wand2 } from "lucide-react";
// Form utilities - use react-hook-form directly for compatibility
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { queryClient, trpc } from "@/utils/trpc";
import { getDriverFormDefaults } from "./driver-form-defaults";

interface AddDriverFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// License classes
const LICENSE_CLASSES = [
  { value: "A", label: "Motorcycle" },
  { value: "B", label: "Regular Car" },
  { value: "C", label: "Truck" },
  { value: "D", label: "Bus" },
  { value: "CDL", label: "Commercial" },
  { value: "SPECIAL", label: "Special" },
];

// Driver statuses
const DRIVER_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "TERMINATED", label: "Terminated" },
  { value: "TRAINING", label: "Training" },
];

// Common US states
const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

export function AddDriverForm({ onSuccess, onCancel }: AddDriverFormProps) {
  // Initialize form with Zod schema using react-hook-form directly
  const form = useForm<CreateDriverInput>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: getDriverFormDefaults(), // Use comprehensive defaults
    mode: "onChange", // Real-time validation for better UX
  });

  // Set up the mutation using useMutation with trpc options
  const createDriverMutation = useMutation({
    ...trpc.driver.create.mutationOptions(),
    onSuccess: () => {
      toast.success("Driver created successfully!");
      // Invalidate the driver list query to refresh data
      queryClient.invalidateQueries({ queryKey: [["driver", "getAll"]] });
      form.reset(); // Reset form after success
      onSuccess();
    },
    onError: (error: unknown) => {
      const apiError = toApiError(error);
      toast.error(apiError.message || "Failed to create driver");
    },
  });

  // Handle form submission
  const onSubmit = async (data: CreateDriverInput) => {
    await createDriverMutation.mutateAsync(data);
  };

  // Auto-fill function with comprehensive field handling
  const handleAutoFill = () => {
    const fakeData = generateFakeDriverData();

    // Log for debugging
    console.log("Generated fake driver data:", fakeData);

    // Personal Information - Required fields
    form.setValue("employee_id", fakeData.employee_id || "");
    form.setValue("first_name", fakeData.first_name || "");
    form.setValue("last_name", fakeData.last_name || "");
    form.setValue("middle_name", fakeData.middle_name || "");
    form.setValue("email", fakeData.email || "");
    form.setValue("phone", fakeData.phone || "");
    form.setValue("alternate_phone", fakeData.alternate_phone || "");
    form.setValue("date_of_birth", fakeData.date_of_birth || "");

    // Address - Required fields
    form.setValue("street_address", fakeData.street_address || "");
    form.setValue("city", fakeData.city || "");
    form.setValue("state_province", fakeData.state_province || "");
    form.setValue("postal_code", fakeData.postal_code || "");
    form.setValue("country", fakeData.country || "USA");

    // License Information - Required fields
    form.setValue("license_number", fakeData.license_number || "");
    form.setValue("license_class", fakeData.license_class || "B");
    form.setValue("license_state", fakeData.license_state || "");
    form.setValue("license_expiry", fakeData.license_expiry || "");
    form.setValue("license_restrictions", fakeData.license_restrictions || "");

    // Employment Information
    form.setValue("status", fakeData.status || "ACTIVE");
    form.setValue("hire_date", fakeData.hire_date || new Date().toISOString());
    form.setValue("department", fakeData.department || "");
    form.setValue("supervisor_name", fakeData.supervisor_name || "");
    form.setValue("supervisor_email", fakeData.supervisor_email || "");

    // Emergency Contact
    form.setValue("emergency_contact_name", fakeData.emergency_contact_name || "");
    form.setValue("emergency_contact_phone", fakeData.emergency_contact_phone || "");
    form.setValue("emergency_contact_relation", fakeData.emergency_contact_relation || "");

    // Training/Certifications
    form.setValue("certifications", fakeData.certifications || []);
    form.setValue("last_training_date", fakeData.last_training_date || "");
    form.setValue("next_training_date", fakeData.next_training_date || "");

    // Performance Metrics (defaults)
    form.setValue("safety_score", fakeData.safety_score || 100);
    form.setValue("total_miles_driven", fakeData.total_miles_driven || 0);
    form.setValue("accidents_count", fakeData.accidents_count || 0);
    form.setValue("violations_count", fakeData.violations_count || 0);

    // Notes
    form.setValue("notes", fakeData.notes || "");

    // Trigger validation and show success message
    setTimeout(() => {
      form.trigger();
      toast.success("Form auto-filled with test data!");
    }, 100);
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

              {/* Personal Information Section */}
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="employee_id"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Employee ID <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., EMP-12345" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Email <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="john.doe@company.com" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          First Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="middle_name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="M." />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Last Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Phone <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="555-123-4567" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Date of Birth <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => field.onChange(date?.toISOString())}
                            placeholder="Select birth date"
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
                    name="hire_date"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Hire Date <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => field.onChange(date?.toISOString())}
                            placeholder="Select hire date"
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

              {/* Address Section */}
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Address Information</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="street_address"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Street Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123 Main Street" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          City <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="New York" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state_province"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          State <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state} value={state} className="py-2">
                                {state}
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
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Postal Code <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="10001" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="USA" disabled />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* License Information Section */}
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold">License Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="license_number"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          License Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., D123456789" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="license_class"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          License Class <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "B"}
                          defaultValue={field.value || "B"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select license class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LICENSE_CLASSES.map((lic) => (
                              <SelectItem key={lic.value} value={lic.value} className="py-2">
                                {lic.label} ({lic.value})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="license_state"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          License State <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select license state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state} value={state} className="py-2">
                                {state}
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
                    name="license_expiry"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          License Expiry <span className="text-red-500">*</span>
                        </FormLabel>
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

              {/* Employment Information Section */}
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Employment Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            {DRIVER_STATUSES.map((status) => (
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
                    name="department"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="e.g., Logistics"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Emergency Contact</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="e.g., Jane Doe"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergency_contact_phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="555-987-6543" />
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
                          value={field.value || ""}
                          placeholder="Additional notes about the driver..."
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
            disabled={createDriverMutation.isPending}
            className="h-11 px-6 border-border/60 hover:bg-muted/50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createDriverMutation.isPending}
            className="h-11 px-6 bg-primary hover:bg-primary/90 shadow-md"
          >
            {createDriverMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Driver...
              </>
            ) : (
              "Create Driver"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
