import { cn } from "@papaya-fleet/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface NavItemProps {
  href: string;
  children: ReactNode;
  icon?: React.ElementType;
  className?: string;
}

export function NavItem({ href, children, icon: Icon, className }: NavItemProps) {
  const location = useRouterState({ select: (s) => s.location });
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive
          ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
        className,
      )}
      preload="intent"
    >
      <span className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </span>
    </Link>
  );
}
