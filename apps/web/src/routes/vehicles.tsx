import { Badge } from "@papaya-fleet/ui/components/badge";
import { Button } from "@papaya-fleet/ui/components/button";
import { Card, CardContent } from "@papaya-fleet/ui/components/card";
// UI imports
import { DataTable } from "@papaya-fleet/ui/components/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@papaya-fleet/ui/components/dialog";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, ArrowUpDown, Plus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { AddVehicleForm } from "@/components/vehicles/add-vehicle-form";
import { useAuth } from "@/contexts/auth-context";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/vehicles")({
  component: VehiclesPage,
});

interface Vehicle {
  id: string;
  registrationNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  status: string;
  currentLocation: string | null;
  fuelType: string;
  mileage: number;
  driverId: string | null;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

function VehiclesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

  // Fetch vehicles using simplified API (similar to drivers page)
  const {
    data: vehiclesData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.vehicle.getAll.queryOptions({
      page: 1,
      limit: 100,
      sort_by: "created_at",
      sort_order: "desc",
    }),
  );

  // Define columns for the data table
  const columns: Array<ColumnDef<Vehicle>> = useMemo(
    () => [
      {
        accessorKey: "registrationNumber",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Registration
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue("registrationNumber")}</div>,
      },
      {
        accessorKey: "vehicleType",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Type
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        filterFn: "fuzzy", // Use case-insensitive filtering
        cell: ({ row }) => {
          const type = row.getValue("vehicleType") as string;
          return (
            <Badge variant="outline" className="font-medium rounded-md">
              {type}
            </Badge>
          );
        },
      },
      {
        accessorKey: "make",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Make
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "model",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Model
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "year",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Year
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        filterFn: "fuzzy", // Use case-insensitive filtering
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const statusUpper = status?.toUpperCase();

          // Map status to appropriate color classes
          const colorClass =
            statusUpper === "ACTIVE" || status === "active"
              ? "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20"
              : statusUpper === "RESERVED" || status === "reserved"
                ? "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20"
                : statusUpper === "MAINTENANCE" || status === "maintenance"
                  ? "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20"
                  : statusUpper === "REPAIR" || status === "repair"
                    ? "bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20"
                    : statusUpper === "INACTIVE" || status === "inactive"
                      ? "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20"
                      : statusUpper === "RETIRED" || status === "retired"
                        ? "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-500/20"
                        : "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20";

          return (
            <Badge
              variant="outline"
              className={`font-medium px-2.5 py-0.5 rounded-full border ${colorClass}`}
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "currentLocation",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Location
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const location = row.getValue("currentLocation");
          return location ? (
            <span>{location}</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: "driver",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Driver
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const driver = row.original.driver;
          return driver ? (
            <span>
              {driver.firstName} {driver.lastName}
            </span>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          );
        },
      },
      {
        accessorKey: "mileage",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Mileage
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const mileage = row.getValue("mileage") as number;
          return <div>{mileage.toLocaleString()} km</div>;
        },
      },
    ],
    [],
  );

  // Define filters for the data table
  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Maintenance", value: "maintenance" },
        { label: "Repair", value: "repair" },
        { label: "Inactive", value: "inactive" },
        { label: "Retired", value: "retired" },
        { label: "Reserved", value: "reserved" },
      ],
    },
    {
      key: "vehicleType",
      label: "Type",
      options: [
        { label: "Sedan", value: "sedan" },
        { label: "SUV", value: "suv" },
        { label: "Truck", value: "truck" },
        { label: "Van", value: "van" },
        { label: "Minivan", value: "minivan" },
      ],
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-destructive">Error loading vehicles</h2>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Auth check
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please sign in to view vehicles
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Fleet Vehicles</h1>
        <p className="text-muted-foreground">Manage and monitor your vehicle fleet</p>
      </div>

      <DataTable
        columns={columns}
        data={vehiclesData?.items || []}
        searchPlaceholder="Search vehicles..."
        filters={filters}
        pageSize={20}
        onRowClick={(vehicle) => navigate({ to: `/vehicles/$id`, params: { id: vehicle.id } })}
        actionButton={
          <Button onClick={() => setIsAddVehicleOpen(true)} className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        }
      />

      {/* Add Vehicle Dialog */}
      <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
        <DialogContent size="xl" className="h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="shrink-0 px-8 pt-8 pb-6 border-b bg-gradient-to-r from-background to-muted/20">
            <DialogTitle className="text-2xl font-bold">Add New Vehicle</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Fill in the details below to add a new vehicle to the fleet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <AddVehicleForm
              onSuccess={() => {
                setIsAddVehicleOpen(false);
                refetch(); // Refresh the vehicles list
              }}
              onCancel={() => setIsAddVehicleOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
