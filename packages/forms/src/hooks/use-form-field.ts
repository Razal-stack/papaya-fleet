import type { FieldPath, FieldValues } from "react-hook-form";
import { useFormContext } from "react-hook-form";

/**
 * Hook to access individual form field state and methods
 *
 * @example
 * ```tsx
 * function EmailField() {
 *   const field = useFormField('email');
 *
 *   return (
 *     <div>
 *       <input {...field.register()} />
 *       {field.error && <span>{field.error.message}</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(name: TName) {
  const form = useFormContext<TFieldValues>();

  if (!form) {
    throw new Error("useFormField must be used within a FormProvider");
  }

  const fieldState = form.getFieldState(name);
  const watchedValue = form.watch(name);

  return {
    register: () => form.register(name),
    value: watchedValue,
    setValue: (value: any) => form.setValue(name, value),
    error: fieldState.error,
    isDirty: fieldState.isDirty,
    isTouched: fieldState.isTouched,
    isInvalid: fieldState.invalid,
    clearErrors: () => form.clearErrors(name),
    trigger: () => form.trigger(name),
    fieldState,
  };
}

/**
 * Hook for controlled form fields
 *
 * @example
 * ```tsx
 * function SelectField() {
 *   const field = useControlledField('category');
 *
 *   return (
 *     <Select
 *       value={field.value}
 *       onChange={field.onChange}
 *       onBlur={field.onBlur}
 *     />
 *   );
 * }
 * ```
 */
export function useControlledField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(name: TName) {
  const form = useFormContext<TFieldValues>();

  if (!form) {
    throw new Error("useControlledField must be used within a FormProvider");
  }

  const {
    field,
    fieldState: { error, isDirty, isTouched, invalid },
  } = form.control._fields[name] || {};

  return {
    ...form.register(name),
    value: form.watch(name),
    onChange: (value: any) => {
      form.setValue(name, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    },
    onBlur: () => {
      form.trigger(name);
    },
    error,
    isDirty,
    isTouched,
    isInvalid: invalid,
  };
}
