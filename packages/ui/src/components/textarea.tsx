import { cn } from "@papaya-fleet/ui/lib/utils";
import type * as React from "react";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none",
        "transition-colors outline-none",
        "placeholder:text-muted-foreground",
        "hover:border-muted-foreground/50",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
