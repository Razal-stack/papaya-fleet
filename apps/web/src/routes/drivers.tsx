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
import { differenceInYears, format } from "date-fns";
import { AlertCircle, ArrowUpDown, Car, Phone, Plus, RefreshCw, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { AddDriverForm } from "@/components/drivers/add-driver-form";
import { useAuth } from "@/contexts/auth-context";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/drivers")({
  component: DriversPage,
});

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  status: string;
  dateOfBirth: string;
  hireDate: string;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  vehicleId: string | null;
  vehicle?: {
    id: string;
    registrationNumber: string;
    make: string;
    model: string;
    year: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

function DriversPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  // Fetch drivers using simplified API
  const {
    data: driversData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.driver.getAll.queryOptions({
      page: 1,
      limit: 100,
      sort_by: "created_at",
      sort_order: "desc",
    }),
  );

  // Define columns for the data table
  const columns: Array<ColumnDef<Driver>> = useMemo(
    () => [
      {
        accessorKey: "firstName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const driver = row.original;
          return (
            <div>
              <div className="font-medium">
                {driver.firstName} {driver.lastName}
              </div>
              <div className="text-sm text-muted-foreground">{driver.email}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "licenseNumber",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              License
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const driver = row.original;
          return (
            <div>
              <div className="font-medium">{driver.licenseNumber}</div>
              <Badge variant="outline" className="mt-1 font-medium rounded-md">
                <Shield className="h-3 w-3 mr-1" />
                Class {driver.licenseClass}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Phone
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="flex items-center">
            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
            {row.getValue("phone")}
          </div>
        ),
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
              : statusUpper === "TRAINING" || status === "training"
                ? "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20"
                : statusUpper === "ON_LEAVE" || status === "on_leave"
                  ? "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20"
                  : statusUpper === "INACTIVE" || status === "inactive"
                    ? "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20"
                    : statusUpper === "SUSPENDED" || status === "suspended"
                      ? "bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20"
                      : statusUpper === "TERMINATED" || status === "terminated"
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
        accessorKey: "licenseExpiry",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              License Expiry
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const expiry = row.getValue("licenseExpiry") as string;
          const expiryDate = new Date(expiry);
          const daysUntilExpiry = Math.floor(
            (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          );
          const isExpiringSoon = daysUntilExpiry < 30;

          return (
            <div>
              <div className={isExpiringSoon ? "text-warning" : ""}>
                {format(expiryDate, "MMM dd, yyyy")}
              </div>
              {isExpiringSoon && (
                <span className="text-xs text-warning">Expires in {daysUntilExpiry} days</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "vehicle",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Assigned Vehicle
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const vehicle = row.original.vehicle;
          return vehicle ? (
            <div className="flex items-center">
              <Car className="h-3 w-3 mr-1 text-muted-foreground" />
              <span>
                {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">No vehicle assigned</span>
          );
        },
      },
      {
        accessorKey: "hireDate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Hire Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const hireDate = new Date(row.getValue("hireDate"));
          const yearsOfService = differenceInYears(new Date(), hireDate);
          return (
            <div>
              <div>{format(hireDate, "MMM dd, yyyy")}</div>
              <span className="text-xs text-muted-foreground">
                {yearsOfService} year{yearsOfService !== 1 ? "s" : ""} of service
              </span>
            </div>
          );
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
        { label: "Inactive", value: "inactive" },
        { label: "On Leave", value: "on_leave" },
        { label: "Suspended", value: "suspended" },
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
            <h2 className="text-lg font-semibold text-destructive">Error loading drivers</h2>
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
                Please sign in to view drivers
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
        <h1 className="text-3xl font-bold tracking-tight">Fleet Drivers</h1>
        <p className="text-muted-foreground">Manage your driver team</p>
      </div>

      <DataTable
        columns={columns}
        data={driversData?.items || []}
        searchPlaceholder="Search drivers..."
        filters={filters}
        pageSize={20}
        onRowClick={(driver) => navigate({ to: `/drivers/$id`, params: { id: driver.id } })}
        actionButton={
          <Button onClick={() => setIsAddDriverOpen(true)} className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Add Driver
          </Button>
        }
      />

      {/* Add Driver Dialog */}
      <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
        <DialogContent size="xl" className="h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="shrink-0 px-8 pt-8 pb-6 border-b bg-gradient-to-r from-background to-muted/20">
            <DialogTitle className="text-2xl font-bold">Add New Driver</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Fill in the details below to add a new driver to your fleet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <AddDriverForm
              onSuccess={() => {
                setIsAddDriverOpen(false);
                refetch(); // Refresh the drivers list
              }}
              onCancel={() => setIsAddDriverOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
