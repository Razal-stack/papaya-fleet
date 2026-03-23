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
import { differenceInYears, format } from "date-fns";
import { ArrowLeft, Calendar, Car, Mail, MapPin, Phone, Shield, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/drivers/$id")({
  component: DriverDetailPage,
});

function DriverDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();

  const { data: driver, isLoading, error } = useQuery(trpc.driver.getById.queryOptions({ id }));

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Driver not found</p>
            <Link to="/drivers">
              <Button className="mt-4">Back to Drivers</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusUpper = driver.status?.toUpperCase();
  const statusColorClass =
    statusUpper === "ACTIVE" || driver.status === "active"
      ? "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20"
      : statusUpper === "TRAINING" || driver.status === "training"
        ? "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20"
        : statusUpper === "ON_LEAVE" || driver.status === "on_leave"
          ? "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20"
          : statusUpper === "INACTIVE" || driver.status === "inactive"
            ? "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20"
            : statusUpper === "SUSPENDED" || driver.status === "suspended"
              ? "bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20"
              : statusUpper === "TERMINATED" || driver.status === "terminated"
                ? "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-500/20"
                : "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20";

  const licenseExpiryDate = driver.licenseExpiry ? new Date(driver.licenseExpiry) : null;
  const daysUntilExpiry = licenseExpiryDate
    ? Math.floor((licenseExpiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const isLicenseExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry < 30;

  const yearsOfService = driver.hireDate
    ? differenceInYears(new Date(), new Date(driver.hireDate))
    : 0;

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/drivers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Drivers
          </Button>
        </Link>
      </div>

      {/* Main Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {driver.firstName} {driver.lastName}
                </CardTitle>
                <CardDescription>{driver.email}</CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`font-medium text-sm px-3 py-1 rounded-full border ${statusColorClass}`}
            >
              {driver.status || "UNKNOWN"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Phone */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Phone</p>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{driver.phone || "N/A"}</span>
            </div>
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Email</p>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{driver.email || "N/A"}</span>
            </div>
          </div>

          {/* License */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">License</p>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <span className="font-medium">{driver.licenseNumber || "N/A"}</span>
                {driver.licenseClass && (
                  <Badge variant="outline" className="ml-2 text-xs font-medium rounded-md">
                    Class {driver.licenseClass}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* License Expiry */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">License Expiry</p>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <span className={`font-medium ${isLicenseExpiringSoon ? "text-warning" : ""}`}>
                  {licenseExpiryDate ? format(licenseExpiryDate, "MMM dd, yyyy") : "N/A"}
                </span>
                {isLicenseExpiringSoon && (
                  <p className="text-xs text-warning">Expires in {daysUntilExpiry} days</p>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Vehicle */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Assigned Vehicle</p>
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-2 text-muted-foreground" />
              {driver.vehicle ? (
                <Link
                  to={`/vehicles/${driver.vehicle.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {driver.vehicle.make} {driver.vehicle.model}
                </Link>
              ) : (
                <span className="font-medium text-muted-foreground">No vehicle assigned</span>
              )}
            </div>
          </div>

          {/* Hire Date & Service */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Service</p>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                {driver.hireDate ? (
                  <>
                    <span className="font-medium">
                      {format(new Date(driver.hireDate), "MMM dd, yyyy")}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {yearsOfService} year{yearsOfService !== 1 ? "s" : ""} of service
                    </p>
                  </>
                ) : (
                  <span className="font-medium">N/A</span>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          {driver.address && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Address</p>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">
                  {driver.address}
                  {driver.city && `, ${driver.city}`}
                  {driver.state && `, ${driver.state}`}
                  {driver.zipCode && ` ${driver.zipCode}`}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact Card */}
      {(driver.emergencyContact || driver.emergencyPhone) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {driver.emergencyContact && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{driver.emergencyContact}</p>
                </div>
              )}
              {driver.emergencyPhone && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium">{driver.emergencyPhone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
