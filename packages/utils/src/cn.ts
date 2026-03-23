import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS conflict resolution
 * This is the standard utility for Shadcn components
 */
export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}
