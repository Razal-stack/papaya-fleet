/**
 * Common Utility Types
 *
 * Shared TypeScript utility types used across the application
 * These types provide safe alternatives to 'any' and help maintain type safety
 */

/**
 * Generic JSON value - safer alternative to 'any' for JSON data
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Generic JSON object - for Prisma Json fields and API payloads
 */
export type JsonObject = { [key: string]: JsonValue };

/**
 * JSON array type
 */
export type JsonArray = JsonValue[];

/**
 * Unknown object type - for cases where we need to handle dynamic objects
 */
export type UnknownObject = Record<string, unknown>;

/**
 * Type for form data values
 */
export type FormValues = Record<string, unknown>;

/**
 * Type for React Hook Form resolver
 */
export type FormResolver<T = FormValues> = {
  resolver: unknown;
  defaultValues?: Partial<T>;
  mode?: "onChange" | "onBlur" | "onSubmit" | "all";
};

/**
 * Type for API error responses
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Type for table/list filters
 */
export type FilterValue = string | number | boolean | null | undefined;

/**
 * Type for mutation/query options
 */
export interface QueryOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: ApiError) => void;
  enabled?: boolean;
}

/**
 * Type for React component with children
 */
export interface WithChildren {
  children: React.ReactNode;
}

/**
 * Type for React component with className
 */
export interface WithClassName {
  className?: string;
}

/**
 * Type for async function return type
 */
export type AsyncFunction<T = void> = () => Promise<T>;

/**
 * Type for event handlers
 */
export type EventHandler<T = unknown> = (event: T) => void;

/**
 * Type for form submit handlers
 */
export type FormSubmitHandler<T = FormValues> = (data: T) => void | Promise<void>;

/**
 * Type for icon components (lucide-react, etc.)
 */
export type IconComponent = React.ComponentType<{ className?: string; size?: number | string }>;

/**
 * Type for table column definitions
 */
export interface ColumnDefinition<T = UnknownObject> {
  key: keyof T | string;
  header: string;
  cell?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

/**
 * Type guard to check if value is an Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if value is an API error
 */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as ApiError).message === "string"
  );
}

/**
 * Type guard to check if value is an object with specific property
 */
export function hasProperty<K extends string>(
  value: unknown,
  property: K,
): value is Record<K, unknown> {
  return typeof value === "object" && value !== null && property in value;
}

/**
 * Type guard to check if value is a valid JSON object
 */
export function isJsonObject(value: unknown): value is JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return true;
}

/**
 * Type guard to check if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Type guard to check if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Type guard to check if value is defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Type for nullable values
 */
export type Nullable<T> = T | null | undefined;

/**
 * Type for deep partial (makes all nested properties optional)
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Type for extracting promise type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Type for extracting array element type
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Safe JSON parse with type checking
 */
export function safeJsonParse<T = JsonValue>(text: string, defaultValue?: T): T | undefined {
  try {
    return JSON.parse(text) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Convert unknown error to ApiError
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }
  if (isError(error)) {
    return {
      message: error.message,
      details: error.stack,
    };
  }
  if (isString(error)) {
    return { message: error };
  }
  return {
    message: "An unknown error occurred",
    details: error,
  };
}

/**
 * Type for pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Type for paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
