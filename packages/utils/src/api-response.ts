/**
 * Standard API response formats
 * Provides consistent response structure across all APIs
 */

export type ApiStatus = "success" | "error" | "warning";

export interface ApiResponse<T = unknown> {
  status: ApiStatus;
  message?: string;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface ApiMeta {
  timestamp: string;
  version?: string;
  requestId?: string;
  pagination?: ApiPagination;
}

export interface ApiPagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: Partial<ApiMeta>,
): ApiResponse<T> {
  return {
    status: "success",
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ApiResponse {
  return {
    status: "error",
    message,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Create a warning response
 */
export function warningResponse<T>(
  data: T,
  message: string,
  meta?: Partial<ApiMeta>,
): ApiResponse<T> {
  return {
    status: "warning",
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: Array<T>,
  page: number,
  pageSize: number,
  totalItems: number,
  message?: string,
): ApiResponse<Array<T>> {
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    status: "success",
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    },
  };
}

/**
 * Check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>,
): response is ApiResponse<T> & { data: T } {
  return response.status === "success" && response.data !== undefined;
}

/**
 * Check if response is error
 */
export function isErrorResponse(
  response: ApiResponse,
): response is ApiResponse & { error: ApiError } {
  return response.status === "error" && response.error !== undefined;
}
