"use client";

import { Calendar } from "@papaya-fleet/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@papaya-fleet/ui/components/popover";
import { cn } from "@papaya-fleet/ui/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    onChange?.(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors outline-none text-left",
          "hover:border-muted-foreground/50",
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/20",
          !date && "text-muted-foreground",
          className,
        )}
        disabled={disabled}
        style={{ width: "100%" }}
      >
        <span className="block truncate">{date ? format(date, "MM/dd/yyyy") : placeholder}</span>
        <CalendarIcon className="h-4 w-4 opacity-50 ml-2 shrink-0" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleSelect} initialFocus />
      </PopoverContent>
    </Popover>
  );
}

// Date range picker for future use
interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onChange,
  placeholder = "Pick a date range",
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [range, setRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from,
    to,
  });

  React.useEffect(() => {
    setRange({ from, to });
  }, [from, to]);

  const handleSelect = (newRange: any) => {
    setRange(newRange);
    onChange?.(newRange);
  };

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors outline-none text-left",
          "hover:border-muted-foreground/50",
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/20",
          !range.from && !range.to && "text-muted-foreground",
          className,
        )}
        disabled={disabled}
        style={{ width: "100%" }}
      >
        <span className="block truncate">
          {range.from ? (
            range.to ? (
              <>
                {format(range.from, "MM/dd/yyyy")} - {format(range.to, "MM/dd/yyyy")}
              </>
            ) : (
              format(range.from, "MM/dd/yyyy")
            )
          ) : (
            placeholder
          )}
        </span>
        <CalendarIcon className="h-4 w-4 opacity-50 ml-2 shrink-0" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={range.from}
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
