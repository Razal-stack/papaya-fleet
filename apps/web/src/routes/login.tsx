import { Card } from "@papaya-fleet/ui/components/card";
import { toApiError } from "@papaya-fleet/utils";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";
import { authClient } from "@/lib/auth-client";

const searchSchema = z.object({
  tab: z.enum(["signin", "signup"]).optional().default("signin"),
});

export const Route = createFileRoute("/login")({
  component: LoginComponent,
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
});

function LoginComponent() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { tab } = Route.useSearch();
  const [activeTab, setActiveTab] = useState(tab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "signup") {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }

        await signUp(formData.email, formData.password, formData.name);
        toast.success("Account created successfully!");
        // Small delay to ensure auth state updates
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 100);
      } else {
        await signIn(formData.email, formData.password);
        toast.success("Welcome back!");
        // Small delay to ensure auth state updates
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 100);
      }
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast.error(apiError.message || "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-8 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {activeTab === "signin" ? "Sign in to Papaya" : "Create your account"}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeTab === "signin"
                ? "Enter your credentials to access your dashboard"
                : "Get started with Papaya fleet management"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-900 p-1 mb-6">
            <button
              onClick={() => setActiveTab("signin")}
              className={`
                flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200
                ${
                  activeTab === "signin"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }
              `}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`
                flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200
                ${
                  activeTab === "signup"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }
              `}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "signup" && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 pr-3 py-2 w-full text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 pr-3 py-2 w-full text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 py-2 w-full text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {activeTab === "signup" && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-3 py-2 w-full text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            {activeTab === "signin" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 mr-2"
                  />
                  <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <a href="#" className="text-gray-900 dark:text-white hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {activeTab === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </Card>
      </div>
    </div>
  );
}
