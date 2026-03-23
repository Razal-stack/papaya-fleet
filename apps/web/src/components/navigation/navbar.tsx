import { Link } from "@tanstack/react-router";
import { Car, Layers, LayoutDashboard, Search, Users } from "lucide-react";
import { UserDropdown } from "@/components/layout";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface NavbarProps {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/98 dark:bg-gray-950/98 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 shadow-sm">
      <div className="px-6">
        <div className="flex h-14 items-center justify-between gap-8">
          {/* Left Side - Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-semibold text-base">
              <Layers className="h-5 w-5 text-gray-900 dark:text-white" />
              <span className="text-gray-900 dark:text-white">Papaya</span>
            </Link>

            {/* Navigation Links - Only show when logged in */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200"
                  activeProps={{
                    className: "text-gray-900 dark:text-white bg-gray-100/80 dark:bg-gray-800/80",
                  }}
                  inactiveProps={{
                    className:
                      "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  }}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/vehicles"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200"
                  activeProps={{
                    className: "text-gray-900 dark:text-white bg-gray-100/80 dark:bg-gray-800/80",
                  }}
                  inactiveProps={{
                    className:
                      "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  }}
                >
                  <Car className="h-4 w-4" />
                  Vehicles
                </Link>
                <Link
                  to="/drivers"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200"
                  activeProps={{
                    className: "text-gray-900 dark:text-white bg-gray-100/80 dark:bg-gray-800/80",
                  }}
                  inactiveProps={{
                    className:
                      "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  }}
                >
                  <Users className="h-4 w-4" />
                  Drivers
                </Link>
              </nav>
            )}
          </div>

          {/* Right Side - Search and Actions */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search (⌘ + k)"
                  className="pl-9 pr-3 py-2 w-64 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-gray-300 dark:focus:border-gray-700 transition-all"
                />
              </div>
            </div>

            {/* Mobile Search */}
            <button className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
              <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Actions */}
            {user ? (
              <UserDropdown user={user} />
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="btn-ghost btn-sm">Sign In</button>
                </Link>
                <Link to="/login?tab=signup">
                  <button className="btn-primary btn-sm">Get Started</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
