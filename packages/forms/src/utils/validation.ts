import type { FieldErrors, FieldValues } from "react-hook-form";
import type { ZodError, ZodSchema } from "zod";

/**
 * Convert Zod errors to react-hook-form FieldErrors
 */
export function zodErrorToFieldErrors<T extends FieldValues>(error: ZodError): FieldErrors<T> {
  const fieldErrors: FieldErrors<T> = {};

  error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (path) {
      (fieldErrors as any)[path] = {
        type: err.code,
        message: err.message,
      };
    }
  });

  return fieldErrors;
}

/**
 * Validate form data against a Zod schema
 */
export async function validateFormData<T>(
  data: unknown,
  schema: ZodSchema<T>,
): Promise<{ success: true; data: T } | { success: false; errors: FieldErrors }> {
  try {
    const validData = await schema.parseAsync(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof Error && "errors" in error) {
      return {
        success: false,
        errors: zodErrorToFieldErrors(error as ZodError),
      };
    }
    return {
      success: false,
      errors: {
        root: {
          type: "validation",
          message: "Validation failed",
        },
      },
    };
  }
}

/**
 * Parse FormData to a plain object
 */
export function parseFormData(formData: FormData): Record<string, any> {
  const data: Record<string, any> = {};

  formData.forEach((value, key) => {
    // Handle array fields (e.g., checkboxes with the same name)
    if (key.endsWith("[]")) {
      const actualKey = key.slice(0, -2);
      if (!data[actualKey]) {
        data[actualKey] = [];
      }
      data[actualKey].push(value);
    } else if (data[key]) {
      // If the key already exists, convert to array
      if (!Array.isArray(data[key])) {
        data[key] = [data[key]];
      }
      data[key].push(value);
    } else {
      data[key] = value;
    }
  });

  return data;
}

/**
 * Get validated form data from a Request object
 */
export async function getValidatedFormData<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ data?: T; errors?: FieldErrors }> {
  const formData = await request.formData();
  const data = parseFormData(formData);

  const result = await validateFormData(data, schema);

  if (result.success) {
    return { data: result.data };
  }

  return { errors: result.errors };
}

/**
 * Create a safe parse function for form data
 */
export function createFormParser<T>(schema: ZodSchema<T>) {
  return async (data: unknown) => {
    return validateFormData(data, schema);
  };
}

/**
 * Check if a field has an error
 */
export function hasFieldError(errors: FieldErrors, fieldName: string): boolean {
  return fieldName in errors;
}

/**
 * Get field error message
 */
export function getFieldError(errors: FieldErrors, fieldName: string): string | undefined {
  const error = errors[fieldName];
  if (typeof error === "object" && "message" in error) {
    return error.message;
  }
  return undefined;
}
