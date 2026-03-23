/**
 * Case conversion utilities for API responses
 * Handles conversion between snake_case (backend) and camelCase (frontend)
 */

type AnyObject = Record<string, unknown>;

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Deep convert object keys from snake_case to camelCase
 */
export function snakeToCamelObject<T = AnyObject>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamelObject(item)) as T;
  }

  if (typeof obj === "object" && obj !== null) {
    const converted: AnyObject = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      converted[camelKey] = snakeToCamelObject(value);
    }
    return converted as T;
  }

  return obj as T;
}

/**
 * Deep convert object keys from camelCase to snake_case
 */
export function camelToSnakeObject<T = AnyObject>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnakeObject(item)) as T;
  }

  if (typeof obj === "object" && obj !== null) {
    const converted: AnyObject = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      converted[snakeKey] = camelToSnakeObject(value);
    }
    return converted as T;
  }

  return obj as T;
}

/**
 * Create a transformer middleware for TRPC or API responses
 */
export const caseTransformer = {
  input: camelToSnakeObject,
  output: snakeToCamelObject,
};

/**
 * Utility to transform API response
 */
export function transformApiResponse<T>(response: unknown): T {
  return snakeToCamelObject<T>(response);
}

/**
 * Utility to transform API request
 */
export function transformApiRequest<T>(request: unknown): T {
  return camelToSnakeObject<T>(request);
}
