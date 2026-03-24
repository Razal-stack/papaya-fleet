"use client";

import { Button } from "@papaya-fleet/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@papaya-fleet/ui/components/dialog";
import { ScrollArea } from "@papaya-fleet/ui/components/scroll-area";
import { cn } from "@papaya-fleet/ui/lib/utils";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "full";
  className?: string;
  bodyClassName?: string;
  showFooter?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  full: "max-w-[95vw]",
};

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "lg",
  className,
  bodyClassName,
  showFooter = true,
  isSubmitting = false,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onSubmit,
  onCancel,
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          "w-[90vw] max-h-[90vh] overflow-hidden flex flex-col",
          className,
        )}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className={cn("flex-1 overflow-hidden", bodyClassName)}>{children}</div>

        {showFooter && (
          <DialogFooter className="shrink-0">
            {footer ? (
              footer
            ) : (
              <>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    {cancelLabel}
                  </Button>
                )}
                {onSubmit && (
                  <Button type="submit" onClick={onSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      submitLabel
                    )}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Subcomponents for more control
export function FormModalBody({
  children,
  className,
  scrollable = true,
}: {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}) {
  if (scrollable) {
    return (
      <ScrollArea className={cn("h-[calc(70vh-12rem)] px-1 pr-4", className)}>
        {children}
      </ScrollArea>
    );
  }
  return <div className={className}>{children}</div>;
}

export function FormModalSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {children}
    </div>
  );
}
