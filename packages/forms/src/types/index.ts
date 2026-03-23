import type { FieldErrors, FieldValues, UseFormReturn } from "react-hook-form";
import type { ZodSchema } from "zod";

/**
 * Form validation modes
 */
export type ValidationMode = "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";

/**
 * Form submission result
 */
export interface FormSubmitResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: FieldErrors;
}

/**
 * Form configuration options
 */
export interface FormConfig<TFieldValues extends FieldValues = FieldValues> {
  mode?: ValidationMode;
  reValidateMode?: Exclude<ValidationMode, "onSubmit" | "all">;
  defaultValues?: Partial<TFieldValues>;
  resolver?: any;
  shouldFocusError?: boolean;
  shouldUnregister?: boolean;
  criteriaMode?: "firstError" | "all";
  progressive?: boolean;
}

/**
 * Form metadata for tracking form states
 */
export interface FormMetadata {
  id: string;
  name: string;
  description?: string;
  fields: Array<FormFieldMetadata>;
}

/**
 * Individual field metadata
 */
export interface FormFieldMetadata {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "checkbox"
    | "radio"
    | "textarea"
    | "date"
    | "file";
  placeholder?: string;
  required?: boolean;
  validation?: ZodSchema;
  options?: Array<{ label: string; value: string | number }>;
  helperText?: string;
  autoComplete?: string;
}

/**
 * Form error structure
 */
export interface FormError {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Extended form return with additional utilities
 */
export interface ExtendedFormReturn<TFieldValues extends FieldValues = FieldValues>
  extends UseFormReturn<TFieldValues> {
  isSubmitting: boolean;
  submitError?: string;
  fieldErrors: FieldErrors<TFieldValues>;
}
