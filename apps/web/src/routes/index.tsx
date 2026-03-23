import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { user } = useAuth();

  // If user is authenticated, show a different view
  if (user) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 text-center -mt-12">
          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 dark:text-white mb-4">
            Welcome back, {user.name?.split(" ")[0]}!
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Your fleet management dashboard is ready
          </p>

          <Link to="/dashboard">
            <button className="btn-primary">
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Show sign in/up options for non-authenticated users
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-4 text-center -mt-12">
        <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 dark:text-white mb-4">
          Welcome to Papaya
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Fleet management intelligence platform
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link to="/login?tab=signup">
            <button className="btn-primary">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>

          <Link to="/login">
            <button className="btn-secondary">Sign In</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
