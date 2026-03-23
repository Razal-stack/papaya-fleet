/**
 * Advanced Form Example
 *
 * Demonstrates advanced form features:
 * - Field arrays for dynamic lists
 * - Conditional fields
 * - Form persistence to localStorage
 * - Custom validation
 * - File uploads
 * - TRPC mutation integration
 */

// Form utilities
import { useFieldArray, useForm, useFormPersist, zodResolver } from "@papaya-fleet/forms";
import { Badge } from "@papaya-fleet/ui/components/badge";
import { Button } from "@papaya-fleet/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@papaya-fleet/ui/components/card";
// UI Components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@papaya-fleet/ui/components/form";
import { Input } from "@papaya-fleet/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@papaya-fleet/ui/components/select";
import { Switch } from "@papaya-fleet/ui/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@papaya-fleet/ui/components/tabs";
import { Textarea } from "@papaya-fleet/ui/components/textarea";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Define complex schema
const vehicleServiceSchema = z.object({
  // Basic Information
  vehicleId: z.string().min(1, "Vehicle is required"),
  serviceType: z.enum(["maintenance", "repair", "inspection"]),
  scheduledDate: z.string().min(1, "Date is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),

  // Service Details
  description: z.string().min(10, "Please provide more details"),
  estimatedCost: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Cost must be positive")),

  // Parts List (Dynamic Field Array)
  parts: z
    .array(
      z.object({
        name: z.string().min(1, "Part name is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().positive("Price must be positive"),
      }),
    )
    .min(1, "Add at least one part"),

  // Conditional Fields
  requiresApproval: z.boolean(),
  approverEmail: z.string().email().optional(),
  approvalNotes: z.string().optional(),

  // File Attachments
  attachments: z.array(z.instanceof(File)).optional(),

  // Notifications
  notifications: z.object({
    emailOnComplete: z.boolean(),
    smsOnComplete: z.boolean(),
    notifyDriver: z.boolean(),
  }),
});

type VehicleServiceForm = z.infer<typeof vehicleServiceSchema>;

export function AdvancedFormExample() {
  // Initialize form with all features
  const form = useForm<VehicleServiceForm>({
    resolver: zodResolver(vehicleServiceSchema),
    defaultValues: {
      vehicleId: "",
      serviceType: "maintenance",
      scheduledDate: "",
      priority: "medium",
      description: "",
      estimatedCost: "0",
      parts: [{ name: "", quantity: 1, unitPrice: 0 }],
      requiresApproval: false,
      approverEmail: "",
      approvalNotes: "",
      attachments: [],
      notifications: {
        emailOnComplete: true,
        smsOnComplete: false,
        notifyDriver: true,
      },
    },
    mode: "onChange", // Real-time validation
  });

  // Field array for dynamic parts list
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parts",
  });

  // Persist form to localStorage
  const { clearPersisted } = useFormPersist({
    form,
    storage: "vehicle-service-form",
    exclude: ["attachments"], // Don't persist files
    debounceMs: 1000,
  });

  // Watch for conditional field
  const requiresApproval = form.watch("requiresApproval");

  // Calculate total cost
  const parts = form.watch("parts");
  const totalPartsCost = parts.reduce(
    (sum, part) => sum + (part.quantity * part.unitPrice || 0),
    0,
  );

  // Handle form submission
  const onSubmit = async (data: VehicleServiceForm) => {
    try {
      // Simulate API call
      console.log("Submitting form data:", data);

      // Show loading state
      toast.loading("Creating service request...");

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success
      toast.dismiss();
      toast.success("Service request created successfully!");

      // Clear form and persisted data
      form.reset();
      clearPersisted();
    } catch (_error) {
      toast.dismiss();
      toast.error("Failed to create service request");
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Vehicle Service Request</CardTitle>
        <CardDescription>
          Create a comprehensive service request with parts tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="parts">Parts & Cost</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="v1">Truck #001</SelectItem>
                            <SelectItem value="v2">Truck #002</SelectItem>
                            <SelectItem value="v3">Van #003</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="inspection">Inspection</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the service requirements..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide detailed information about the service needed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Parts & Cost Tab */}
              <TabsContent value="parts" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Parts List</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ name: "", quantity: 1, unitPrice: 0 })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Part
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-3 p-3 border rounded-lg">
                        <FormField
                          control={form.control}
                          name={`parts.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Part name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`parts.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className="w-24">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Qty"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`parts.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem className="w-32">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Unit price"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Labor Cost Estimate</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Total Estimate</FormLabel>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Parts:</span>
                        <span>${totalPartsCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Labor:</span>
                        <span>${parseFloat(form.watch("estimatedCost") || "0").toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total:</span>
                        <span>
                          $
                          {(
                            totalPartsCost + parseFloat(form.watch("estimatedCost") || "0")
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <FormField
                  control={form.control}
                  name="requiresApproval"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Requires Approval</FormLabel>
                        <FormDescription>
                          Request manager approval before proceeding
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Conditional Fields */}
                {requiresApproval && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <FormField
                      control={form.control}
                      name="approverEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approver Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="manager@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="approvalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approval Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes for approver..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <FormLabel>Notification Preferences</FormLabel>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="notifications.emailOnComplete"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Email notification on completion
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifications.smsOnComplete"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            SMS notification on completion
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifications.notifyDriver"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Notify assigned driver</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-2">
                {form.formState.isDirty && <Badge variant="outline">Unsaved Changes</Badge>}
                {form.formState.isValidating && <Badge variant="outline">Validating...</Badge>}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    clearPersisted();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.isSubmitting || !form.formState.isValid}>
                  {form.isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Create Service Request"
                  )}
                </Button>
              </div>
            </div>

            {/* Debug Info (Dev Only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-6 p-4 bg-muted rounded-lg text-xs space-y-1">
                <p className="font-semibold mb-2">Form Debug Info:</p>
                <p>Valid: {form.formState.isValid ? "✅" : "❌"}</p>
                <p>Dirty: {form.formState.isDirty ? "Yes" : "No"}</p>
                <p>
                  Errors:{" "}
                  {Object.keys(form.formState.errors).length > 0
                    ? JSON.stringify(form.formState.errors, null, 2)
                    : "None"}
                </p>
                <p>Submit Count: {form.formState.submitCount}</p>
                <p>
                  Total Cost: $
                  {(totalPartsCost + parseFloat(form.watch("estimatedCost") || "0")).toFixed(2)}
                </p>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
