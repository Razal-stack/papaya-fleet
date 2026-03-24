import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@papaya-fleet/ui/components/card";
import { cn } from "@papaya-fleet/ui/lib/utils";
import type { IconComponent } from "@papaya-fleet/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Activity, AlertCircle, ChevronRight, MapPin, Package, Truck, Users } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session };
  },
});

function DashboardComponent() {
  const { user } = useAuth();
  const _privateData = useQuery(trpc.privateData.queryOptions());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-950">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's your fleet overview for today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Vehicles" value="82" change="+3" trend="up" icon={Truck} />
          <StatsCard title="Active Drivers" value="64" change="+5" trend="up" icon={Users} />
          <StatsCard
            title="Deliveries Today"
            value="127"
            change="-12"
            trend="down"
            icon={Package}
          />
          <StatsCard
            title="Utilization Rate"
            value="78%"
            change="+4.2%"
            trend="up"
            icon={Activity}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fleet Activity Chart */}
          <Card className="lg:col-span-2 border border-gray-200/50 dark:border-gray-800/30 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Fleet Activity</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Vehicle utilization over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg">
                {/* Chart placeholder */}
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Activity chart will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="border border-gray-200/50 dark:border-gray-800/30 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Recent Alerts</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Fleet notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AlertItem type="warning" message="Vehicle #42 maintenance due" time="2 hours ago" />
              <AlertItem type="info" message="New driver assigned to route" time="4 hours ago" />
              <AlertItem
                type="success"
                message="Delivery completed on schedule"
                time="5 hours ago"
              />
            </CardContent>
          </Card>
        </div>

        {/* Active Vehicles Section */}
        <div className="mt-6">
          <Card className="border border-gray-200/50 dark:border-gray-800/30 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-semibold">Active Vehicles</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Currently deployed in the field
                </CardDescription>
              </div>
              <button className="btn-outline btn-sm rounded-lg">
                View All
                <ChevronRight className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-4 px-4 pb-3 border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="col-span-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Vehicle
                </div>
                <div className="col-span-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Driver
                </div>
                <div className="col-span-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </div>
                <div className="col-span-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">
                  Fuel
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">
                  Status
                </div>
              </div>
              {/* Vehicle Items */}
              <div className="space-y-2 mt-3">
                <VehicleItem
                  id="V-1234"
                  driver="John Smith"
                  location="Downtown District"
                  status="On Route"
                  fuel={75}
                />
                <VehicleItem
                  id="V-5678"
                  driver="Sarah Johnson"
                  location="Airport Zone"
                  status="Idle"
                  fuel={45}
                />
                <VehicleItem
                  id="V-9012"
                  driver="Mike Wilson"
                  location="Industrial Park"
                  status="On Route"
                  fuel={90}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: IconComponent;
}) {
  return (
    <Card className="border border-gray-200/50 dark:border-gray-800/30 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg">
            <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full",
              trend === "up"
                ? "text-emerald-700 bg-emerald-100/80 dark:text-emerald-400 dark:bg-emerald-950/50"
                : "text-rose-700 bg-rose-100/80 dark:text-rose-400 dark:bg-rose-950/50",
            )}
          >
            {change}
          </span>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Alert Item Component
function AlertItem({
  type,
  message,
  time,
}: {
  type: "warning" | "info" | "success";
  message: string;
  time: string;
}) {
  const colors = {
    warning: "bg-amber-100/80 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    info: "bg-blue-100/80 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    success: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/20">
      <div className={cn("p-1.5 rounded-lg", colors[type])}>
        <AlertCircle className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

// Vehicle Item Component
function VehicleItem({
  id,
  driver,
  location,
  status,
  fuel,
}: {
  id: string;
  driver: string;
  location: string;
  status: string;
  fuel: number;
}) {
  return (
    <div className="grid grid-cols-12 items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 hover:shadow-sm transition-all duration-200">
      {/* Vehicle Icon and ID - 3 cols */}
      <div className="col-span-3 flex items-center gap-3">
        <div className="p-3 bg-white dark:bg-gray-800/60 rounded-xl shadow-sm flex-shrink-0">
          <Truck className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{id}</p>
      </div>

      {/* Driver - 3 cols */}
      <div className="col-span-3">
        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Users className="h-3 w-3 mr-1.5 opacity-70 flex-shrink-0" />
          <span className="truncate">{driver}</span>
        </span>
      </div>

      {/* Location - 3 cols */}
      <div className="col-span-3">
        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="h-3 w-3 mr-1.5 opacity-70 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </span>
      </div>

      {/* Fuel - 1 col */}
      <div className="col-span-1 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fuel</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white">{fuel}%</p>
      </div>

      {/* Status - 2 cols */}
      <div className="col-span-2 flex justify-end">
        <span
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-full inline-flex items-center",
            status === "On Route"
              ? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
          )}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
