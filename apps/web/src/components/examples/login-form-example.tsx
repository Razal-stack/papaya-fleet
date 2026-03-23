/**
 * Example Login Form Implementation
 *
 * This demonstrates the complete form handling architecture:
 * - Zod validation with @papaya-fleet/validation schemas
 * - React Hook Form integration via @papaya-fleet/forms
 * - Type-safe form handling
 * - Error display with Shadcn UI components
 * - TRPC mutation integration
 */

// Form utilities from our forms package
import { useForm } from "@papaya-fleet/forms";
import { Button } from "@papaya-fleet/ui/components/button";
import { Card } from "@papaya-fleet/ui/components/card";
import { Checkbox } from "@papaya-fleet/ui/components/checkbox";
// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@papaya-fleet/ui/components/form";
import { Input } from "@papaya-fleet/ui/components/input";
// Validation schemas
import { type LoginInput, loginSchema } from "@papaya-fleet/validation";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Auth context
import { useAuth } from "@/contexts/auth-context";

export function LoginFormExample() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form with Zod schema
  const form = useForm<LoginInput>({
    schema: loginSchema,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onTouched", // Validate when field is touched
  });

  // Handle form submission
  const onSubmit = async (data: LoginInput) => {
    try {
      // Call auth service
      await signIn(data.email, data.password);

      // Show success message
      toast.success("Welcome back!");

      // Navigate to dashboard
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      // Show error message
      toast.error(error.message || "Invalid credentials");

      // Set form-level error
      form.setError("root", {
        message: "Invalid email or password",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Sign In</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your credentials to access your account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="john@example.com"
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember Me Checkbox */}
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm font-normal cursor-pointer">
                  Remember me for 30 days
                </FormLabel>
              </FormItem>
            )}
          />

          {/* Form Error */}
          {form.formState.errors.root && (
            <div className="text-sm text-destructive text-center">
              {form.formState.errors.root.message}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={form.isSubmitting}>
            {form.isSubmitting ? (
              <div className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Form State Debug (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 p-4 bg-muted rounded-lg text-xs">
          <p className="font-semibold mb-2">Form State (Dev Only):</p>
          <p>Valid: {form.formState.isValid ? "✅" : "❌"}</p>
          <p>Dirty: {form.formState.isDirty ? "Yes" : "No"}</p>
          <p>Touched Fields: {Object.keys(form.formState.touchedFields).join(", ") || "None"}</p>
          <p>Submitting: {form.isSubmitting ? "Yes" : "No"}</p>
        </div>
      )}
    </Card>
  );
}
