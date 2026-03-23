import { Badge } from "@papaya-fleet/ui/components/badge";
// UI imports
import { Button } from "@papaya-fleet/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@papaya-fleet/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Car, Fuel, Gauge, MapPin, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/vehicles/$id")({
  component: VehicleDetailPage,
});

function VehicleDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();

  const { data: vehicle, isLoading, error } = useQuery(trpc.vehicle.getById.queryOptions({ id }));

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Vehicle not found</p>
            <Link to="/vehicles">
              <Button className="mt-4">Back to Vehicles</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusUpper = vehicle.status?.toUpperCase();
  const statusColorClass =
    statusUpper === "ACTIVE" || vehicle.status === "active"
      ? "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20"
      : statusUpper === "RESERVED" || vehicle.status === "reserved"
        ? "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20"
        : statusUpper === "MAINTENANCE" || vehicle.status === "maintenance"
          ? "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20"
          : statusUpper === "REPAIR" || vehicle.status === "repair"
            ? "bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20"
            : statusUpper === "INACTIVE" || vehicle.status === "inactive"
              ? "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20"
              : statusUpper === "RETIRED" || vehicle.status === "retired"
                ? "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-500/20"
                : "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20";

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/vehicles">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicles
          </Button>
        </Link>
      </div>

      {/* Main Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {vehicle.make} {vehicle.model}
                </CardTitle>
                <CardDescription>
                  {vehicle.year} • {vehicle.registrationNumber}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`font-medium text-sm px-3 py-1 rounded-full border ${statusColorClass}`}
            >
              {vehicle.status || "UNKNOWN"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Vehicle Type */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Type</p>
            <p className="font-medium">{vehicle.vehicleType || "N/A"}</p>
          </div>

          {/* Fuel Type */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Fuel Type</p>
            <div className="flex items-center">
              <Fuel className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{vehicle.fuelType || "N/A"}</span>
            </div>
          </div>

          {/* Mileage */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Mileage</p>
            <div className="flex items-center">
              <Gauge className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">
                {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "N/A"}
              </span>
            </div>
          </div>

          {/* Location */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Location</p>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{vehicle.currentLocation || "Unknown"}</span>
            </div>
          </div>

          {/* Driver */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Assigned Driver</p>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              {vehicle.driver ? (
                <Link
                  to={`/drivers/${vehicle.driver.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {vehicle.driver.firstName} {vehicle.driver.lastName}
                </Link>
              ) : (
                <span className="font-medium text-muted-foreground">Unassigned</span>
              )}
            </div>
          </div>

          {/* Last Updated */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">
                {vehicle.updatedAt ? format(new Date(vehicle.updatedAt), "MMM dd, yyyy") : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
