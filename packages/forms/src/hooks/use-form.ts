import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import type { FieldValues, UseFormProps } from "react-hook-form";
import { useForm as useHookForm } from "react-hook-form";
import type { ZodSchema } from "zod";
import type { ExtendedFormReturn, FormConfig } from "../types";

/**
 * Extended form hook with TRPC integration and Zod validation
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   schema: LoginSchema,
 *   defaultValues: { email: '', password: '' },
 *   mode: 'onTouched'
 * });
 *
 * const onSubmit = form.handleSubmit(async (data) => {
 *   await mutation.mutateAsync(data);
 * });
 * ```
 */
export function useForm<TFieldValues extends FieldValues = FieldValues>(
  options: FormConfig<TFieldValues> & {
    schema?: ZodSchema<TFieldValues>;
  },
): ExtendedFormReturn<TFieldValues> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  // Build form props
  const formProps: UseFormProps<TFieldValues> = {
    mode: options.mode || "onTouched",
    reValidateMode: options.reValidateMode || "onChange",
    defaultValues: options.defaultValues,
    shouldFocusError: options.shouldFocusError ?? true,
    shouldUnregister: options.shouldUnregister ?? false,
    criteriaMode: options.criteriaMode || "firstError",
  };

  // Add resolver if schema is provided
  if (options.schema) {
    formProps.resolver = zodResolver(options.schema);
  } else if (options.resolver) {
    formProps.resolver = options.resolver;
  }

  // Initialize react-hook-form
  const form = useHookForm<TFieldValues>(formProps);

  // Wrap handleSubmit to track submission state
  const originalHandleSubmit = form.handleSubmit;
  const handleSubmit = useCallback(
    (
      onValid: (data: TFieldValues) => void | Promise<void>,
      onInvalid?: (errors: any) => void | Promise<void>,
    ) => {
      return originalHandleSubmit(async (data) => {
        setIsSubmitting(true);
        setSubmitError(undefined);
        try {
          await onValid(data);
        } catch (error) {
          if (error instanceof Error) {
            setSubmitError(error.message);
          } else {
            setSubmitError("An error occurred");
          }
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      }, onInvalid);
    },
    [originalHandleSubmit],
  );

  return {
    ...form,
    handleSubmit,
    isSubmitting,
    submitError,
    fieldErrors: form.formState.errors,
  };
}

/**
 * Hook for TRPC-integrated forms
 * Combines useForm with TRPC mutation handling
 *
 * @example
 * ```tsx
 * const form = useTRPCForm({
 *   schema: CreateUserSchema,
 *   mutation: trpc.user.create,
 *   onSuccess: (data) => {
 *     toast.success('User created!');
 *     router.push(`/users/${data.id}`);
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 * ```
 */
export function useTRPCForm<
  TFieldValues extends FieldValues = FieldValues,
  TMutationData = any,
>(options: {
  schema?: ZodSchema<TFieldValues>;
  mutation: any; // TRPC mutation
  onSuccess?: (data: TMutationData) => void | Promise<void>;
  onError?: (error: Error) => void;
  defaultValues?: Partial<TFieldValues>;
  mode?: FormConfig<TFieldValues>["mode"];
}) {
  const form = useForm({
    schema: options.schema,
    defaultValues: options.defaultValues,
    mode: options.mode,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await options.mutation.mutateAsync(data);
      if (options.onSuccess) {
        await options.onSuccess(result);
      }
      form.reset();
    } catch (error) {
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
      throw error;
    }
  });

  return {
    ...form,
    onSubmit,
    isLoading: options.mutation.isPending,
    error: options.mutation.error,
  };
}
