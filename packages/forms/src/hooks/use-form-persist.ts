import { useEffect } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

/**
 * Persist form data to localStorage
 * Useful for long forms or forms that users might want to continue later
 *
 * @example
 * ```tsx
 * const form = useForm({ ... });
 *
 * useFormPersist({
 *   form,
 *   storage: 'user-profile-form',
 *   exclude: ['password'], // Don't persist sensitive fields
 * });
 * ```
 */
export function useFormPersist<TFieldValues extends FieldValues = FieldValues>({
  form,
  storage,
  exclude = [],
  debounceMs = 500,
}: {
  form: UseFormReturn<TFieldValues>;
  storage: string;
  exclude?: Array<string>;
  debounceMs?: number;
}) {
  // Load persisted data on mount
  useEffect(() => {
    const storedData = localStorage.getItem(storage);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        // Filter out excluded fields
        const filtered = Object.keys(parsed).reduce((acc, key) => {
          if (!exclude.includes(key)) {
            acc[key] = parsed[key];
          }
          return acc;
        }, {} as any);

        form.reset(filtered);
      } catch (error) {
        console.error("Failed to load persisted form data:", error);
      }
    }
  }, [storage, exclude.includes, form.reset]);

  // Save form data on change
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const subscription = form.watch((data) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Filter out excluded fields
        const filtered = Object.keys(data).reduce((acc, key) => {
          if (!exclude.includes(key) && data[key] !== undefined) {
            acc[key] = data[key];
          }
          return acc;
        }, {} as any);

        localStorage.setItem(storage, JSON.stringify(filtered));
      }, debounceMs);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [form.watch, storage, exclude, debounceMs]);

  // Clear persisted data
  const clearPersisted = () => {
    localStorage.removeItem(storage);
  };

  return { clearPersisted };
}
