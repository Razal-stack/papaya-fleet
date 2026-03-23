import type {
  FieldArrayPath,
  FieldValues,
  UseFieldArrayProps,
  UseFieldArrayReturn,
} from "react-hook-form";
import { useFieldArray as useHookFieldArray } from "react-hook-form";

/**
 * Wrapper for react-hook-form's useFieldArray with additional utilities
 *
 * @example
 * ```tsx
 * const { fields, append, remove, move } = useFieldArray({
 *   control: form.control,
 *   name: 'items'
 * });
 * ```
 */
export function useFieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
>(
  props: UseFieldArrayProps<TFieldValues, TFieldArrayName>,
): UseFieldArrayReturn<TFieldValues, TFieldArrayName> & {
  isEmpty: boolean;
  count: number;
  removeAll: () => void;
} {
  const fieldArray = useHookFieldArray(props);

  return {
    ...fieldArray,
    isEmpty: fieldArray.fields.length === 0,
    count: fieldArray.fields.length,
    removeAll: () => {
      for (let i = fieldArray.fields.length - 1; i >= 0; i--) {
        fieldArray.remove(i);
      }
    },
  };
}
