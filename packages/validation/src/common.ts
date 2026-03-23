import { z } from "zod";

/**
 * Common validation schemas - Only essentials, no business logic
 */

// Basic validations
export const emailSchema = z.string().email("Invalid email address").toLowerCase().trim();

export const uuidSchema = z.string().uuid("Invalid ID format");

export const urlSchema = z.string().url("Invalid URL");

export const phoneSchema = z
  .string()
  .regex(/^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/, "Invalid phone number")
  .optional();

// Pagination - Essential for any list view
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Search - Essential for any search feature
export const searchSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// File upload - Generic, reusable
export const fileSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).optional(),
});

// Types
export type EmailInput = z.infer<typeof emailSchema>;
export type UuidInput = z.infer<typeof uuidSchema>;
export type UrlInput = z.infer<typeof urlSchema>;
export type PhoneInput = z.infer<typeof phoneSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type FileInput = z.infer<typeof fileSchema>;
