/**
 * Date utilities using date-fns
 * The modern, tree-shakeable date library
 */

import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  formatDistance,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isThisWeek,
  isThisYear,
  isToday,
  isTomorrow,
  isValid,
  isYesterday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";

/**
 * Format date with various presets
 */
export function formatDate(date: Date | string, formatString: string = "PPP"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid date";
  return format(d, formatString);
}

/**
 * Common date formats
 */
export const dateFormats = {
  short: (date: Date | string) => formatDate(date, "MM/dd/yyyy"),
  long: (date: Date | string) => formatDate(date, "MMMM do, yyyy"),
  full: (date: Date | string) => formatDate(date, "EEEE, MMMM do, yyyy"),
  time: (date: Date | string) => formatDate(date, "h:mm a"),
  datetime: (date: Date | string) => formatDate(date, "MMM dd, yyyy h:mm a"),
  iso: (date: Date | string) => formatDate(date, "yyyy-MM-dd"),
  timestamp: (date: Date | string) => formatDate(date, "yyyy-MM-dd HH:mm:ss"),
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid date";
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Get friendly relative time
 */
export function getFriendlyDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid date";

  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return `Tomorrow at ${format(d, "h:mm a")}`;
  if (isThisWeek(d)) return format(d, "EEEE 'at' h:mm a");
  if (isThisYear(d)) return format(d, "MMM d 'at' h:mm a");
  return format(d, "MMM d, yyyy");
}

/**
 * Date range helpers
 */
export const dateRanges = {
  today: () => ({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  }),
  yesterday: () => ({
    start: startOfDay(subDays(new Date(), 1)),
    end: endOfDay(subDays(new Date(), 1)),
  }),
  thisWeek: () => ({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  }),
  thisMonth: () => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  }),
  last7Days: () => ({
    start: startOfDay(subDays(new Date(), 7)),
    end: endOfDay(new Date()),
  }),
  last30Days: () => ({
    start: startOfDay(subDays(new Date(), 30)),
    end: endOfDay(new Date()),
  }),
};

/**
 * Calculate age from date
 */
export function calculateAge(birthDate: Date | string): number {
  const d = typeof birthDate === "string" ? parseISO(birthDate) : birthDate;
  if (!isValid(d)) return 0;

  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const monthDiff = today.getMonth() - d.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
    age--;
  }

  return age;
}

/**
 * Get time difference in human readable format
 */
export function getTimeDifference(date1: Date | string, date2: Date | string): string {
  const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
  const d2 = typeof date2 === "string" ? parseISO(date2) : date2;

  if (!isValid(d1) || !isValid(d2)) return "Invalid dates";

  return formatDistance(d1, d2);
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isValid(d) && isBefore(d, new Date());
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isValid(d) && isAfter(d, new Date());
}

// Re-export commonly used date-fns functions
export {
  addDays,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isToday,
  isTomorrow,
  isValid,
  isYesterday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
