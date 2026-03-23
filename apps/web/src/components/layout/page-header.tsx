import { cn } from "@papaya-fleet/ui/lib/utils";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Array<Breadcrumb>;
  className?: string;
  children?: ReactNode;
}

export function PageHeader({ title, breadcrumbs, className, children }: PageHeaderProps) {
  return (
    <div className={cn("border-b", className)}>
      <div className="container mx-auto px-4 py-6">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-foreground transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}
