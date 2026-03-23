import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@papaya-fleet/ui/lib/utils";

function Input({ className, type, ...props }: InputPrimitive.Props) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors outline-none",
        "placeholder:text-muted-foreground",
        "hover:border-muted-foreground/50",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/20",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Date input specific styles
        "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
        "[&::-webkit-calendar-picker-indicator]:opacity-50",
        "[&::-webkit-calendar-picker-indicator]:hover:opacity-100",
        "[&::-webkit-datetime-edit]:text-sm",
        "[&::-webkit-datetime-edit-fields-wrapper]:p-0",
        "[&::-webkit-date-and-time-value]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
