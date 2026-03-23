# Forms Architecture Guide

## Overview

This document describes the complete form handling architecture for the Papaya Test application. Our forms system is built on **React Hook Form** with **Zod validation**, providing type-safe, performant forms with excellent developer experience.

## Table of Contents

- [Core Principles](#core-principles)
- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Core Principles

1. **Type Safety End-to-End**: Zod schemas generate TypeScript types automatically
2. **Single Source of Truth**: One schema defines validation for both client and server
3. **Progressive Enhancement**: Forms work without JavaScript when possible
4. **Developer Experience**: Auto-complete, real-time validation, clear error messages
5. **Performance**: Optimized re-renders, field-level validation
6. **Reusability**: Shared validation schemas and form components

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Validation Layer                │
│     @papaya-fleet/validation              │
│     (Zod schemas & types)                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Forms Package                  │
│       @papaya-fleet/forms                 │
│   (Hooks, utilities, integrations)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           UI Components                 │
│        @papaya-fleet/ui                  │
│    (Form, Input, Select, etc.)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Application Layer               │
│     Your form implementations           │
│    (Login, Registration, etc.)          │
└─────────────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
# Already installed in the monorepo
bun add react-hook-form @hookform/resolvers
```

### 2. Define Your Schema

```typescript
// packages/validation/src/user.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18 or older"),
  role: z.enum(["admin", "user", "guest"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### 3. Create Your Form

```tsx
import { useForm } from "@papaya-fleet/forms";
import { createUserSchema } from "@papaya-fleet/validation";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@papaya-fleet/ui/components/form";
import { Input } from "@papaya-fleet/ui/components/input";
import { Button } from "@papaya-fleet/ui/components/button";

function UserForm() {
  const form = useForm({
    schema: createUserSchema,
    defaultValues: {
      name: "",
      email: "",
      age: 18,
      role: "user",
    },
  });

  const onSubmit = async (data) => {
    // Your submit logic
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## Basic Usage

### Simple Form

```tsx
import { useForm } from "@papaya-fleet/forms";
import { loginSchema } from "@papaya-fleet/validation";

function LoginForm() {
  const form = useForm({
    schema: loginSchema,
    mode: "onTouched", // Validate when field loses focus
  });

  const onSubmit = async (data) => {
    await signIn(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### With TRPC Mutation

```tsx
import { useTRPCForm } from "@papaya-fleet/forms";
import { createVehicleSchema } from "@papaya-fleet/validation";
import { trpc } from "@/lib/trpc";

function CreateVehicleForm() {
  const form = useTRPCForm({
    schema: createVehicleSchema,
    mutation: trpc.vehicle.create,
    onSuccess: (data) => {
      toast.success("Vehicle created!");
      router.push(`/vehicles/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <form onSubmit={form.onSubmit}>
      {/* Form automatically handles loading states */}
      <Button disabled={form.isLoading}>
        {form.isLoading ? "Creating..." : "Create Vehicle"}
      </Button>
    </form>
  );
}
```

## Advanced Features

### 1. Field Arrays (Dynamic Lists)

```tsx
import { useFieldArray } from "@papaya-fleet/forms";

function PartsListForm() {
  const form = useForm({
    defaultValues: {
      parts: [{ name: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parts",
  });

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id}>
          <Input {...form.register(`parts.${index}.name`)} />
          <Input {...form.register(`parts.${index}.quantity`)} />
          <Button onClick={() => remove(index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={() => append({ name: "", quantity: 1 })}>
        Add Part
      </Button>
    </>
  );
}
```

### 2. Form Persistence

Save form state to localStorage for long forms:

```tsx
import { useFormPersist } from "@papaya-fleet/forms";

function LongForm() {
  const form = useForm({ /* ... */ });

  // Auto-save to localStorage
  useFormPersist({
    form,
    storage: "long-form-draft",
    exclude: ["password"], // Don't persist sensitive fields
    debounceMs: 1000,
  });

  return <form>{/* ... */}</form>;
}
```

### 3. Conditional Fields

```tsx
function ConditionalForm() {
  const form = useForm();

  // Watch field value
  const requiresApproval = form.watch("requiresApproval");

  return (
    <form>
      <Switch {...form.register("requiresApproval")} />

      {requiresApproval && (
        <Input
          {...form.register("approverEmail")}
          placeholder="Enter approver email"
        />
      )}
    </form>
  );
}
```

### 4. Custom Validation

```tsx
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);
```

### 5. File Uploads

```tsx
const schema = z.object({
  avatar: z.instanceof(File).optional(),
  documents: z.array(z.instanceof(File)),
});

function UploadForm() {
  const form = useForm({ schema });

  return (
    <Controller
      control={form.control}
      name="avatar"
      render={({ field: { onChange, value, ...field } }) => (
        <Input
          type="file"
          onChange={(e) => onChange(e.target.files?.[0])}
          {...field}
        />
      )}
    />
  );
}
```

## API Reference

### `useForm`

Main form hook with Zod integration.

```typescript
const form = useForm<TFieldValues>({
  schema?: ZodSchema,           // Zod validation schema
  defaultValues?: TFieldValues, // Initial form values
  mode?: ValidationMode,        // When to validate
  resolver?: Resolver,          // Custom resolver (if not using Zod)
});
```

**Returns:**
- All react-hook-form methods
- `isSubmitting`: Boolean indicating submission state
- `submitError`: Error message from submission
- `fieldErrors`: Field-level errors

### `useTRPCForm`

Form hook with TRPC mutation integration.

```typescript
const form = useTRPCForm({
  schema?: ZodSchema,
  mutation: TRPCMutation,
  onSuccess?: (data) => void,
  onError?: (error) => void,
});
```

### `useFieldArray`

Manage dynamic field arrays.

```typescript
const { fields, append, remove, move } = useFieldArray({
  control: form.control,
  name: "items",
});
```

### `useFormPersist`

Persist form to localStorage.

```typescript
const { clearPersisted } = useFormPersist({
  form,
  storage: "form-key",
  exclude: ["password"],
  debounceMs: 1000,
});
```

## Validation Modes

- `onChange`: Validate on every change (aggressive)
- `onBlur`: Validate when field loses focus
- `onTouched`: Validate after first blur (default)
- `onSubmit`: Validate only on submit
- `all`: Always validate

## Best Practices

### 1. Schema Organization

```typescript
// packages/validation/src/vehicle.ts

// Base schemas for reuse
const vehicleBaseSchema = z.object({
  make: z.string(),
  model: z.string(),
  year: z.number(),
});

// Extend for specific uses
export const createVehicleSchema = vehicleBaseSchema.extend({
  vin: z.string().length(17),
});

export const updateVehicleSchema = vehicleBaseSchema.partial();
```

### 2. Error Handling

```tsx
function FormWithErrors() {
  const form = useForm();

  const onSubmit = async (data) => {
    try {
      await api.submit(data);
    } catch (error) {
      // Set field-specific error
      form.setError("email", {
        message: "Email already exists",
      });

      // Set general error
      form.setError("root", {
        message: "Something went wrong",
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {form.formState.errors.root && (
        <Alert>{form.formState.errors.root.message}</Alert>
      )}
      {/* Form fields */}
    </form>
  );
}
```

### 3. Loading States

```tsx
function FormWithLoading() {
  const form = useForm();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Button disabled={form.isSubmitting}>
        {form.isSubmitting ? (
          <>
            <Spinner />
            Submitting...
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </form>
  );
}
```

### 4. Form Reset

```tsx
// Reset to default values
form.reset();

// Reset with new values
form.reset({ name: "New Name" });

// Reset specific fields
form.resetField("email");
```

### 5. Transform Values

```typescript
const schema = z.object({
  price: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive()),
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase()),
});
```

## Common Patterns

### Search Form with URL State

```tsx
import { useSearchParams } from "@/hooks/use-url-state";

function SearchForm() {
  const [params, setParams] = useSearchParams();

  const form = useForm({
    defaultValues: {
      query: params.query || "",
      filter: params.filter || "all",
    },
  });

  const onSubmit = (data) => {
    setParams(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

### Multi-Step Form

```tsx
function MultiStepForm() {
  const [step, setStep] = useState(1);
  const form = useForm();

  const nextStep = async () => {
    const isValid = await form.trigger(); // Validate current step
    if (isValid) setStep(step + 1);
  };

  return (
    <form>
      {step === 1 && <Step1Fields />}
      {step === 2 && <Step2Fields />}
      {step === 3 && <Step3Fields />}

      <Button onClick={nextStep}>Next</Button>
    </form>
  );
}
```

### Dependent Fields

```tsx
function DependentFields() {
  const form = useForm();
  const country = form.watch("country");

  useEffect(() => {
    // Reset state when country changes
    form.setValue("state", "");
  }, [country]);

  return (
    <form>
      <Select {...form.register("country")}>
        <option value="us">United States</option>
        <option value="ca">Canada</option>
      </Select>

      <Select {...form.register("state")}>
        {country === "us" && (
          <>
            <option value="ca">California</option>
            <option value="ny">New York</option>
          </>
        )}
        {country === "ca" && (
          <>
            <option value="on">Ontario</option>
            <option value="bc">British Columbia</option>
          </>
        )}
      </Select>
    </form>
  );
}
```

## Troubleshooting

### Common Issues

#### 1. Form not validating

```tsx
// ❌ Wrong - forgot resolver
const form = useForm({
  defaultValues: { ... }
});

// ✅ Correct - include schema
const form = useForm({
  schema: mySchema,
  defaultValues: { ... }
});
```

#### 2. TypeScript errors

```tsx
// ❌ Wrong - no type inference
const form = useForm();

// ✅ Correct - with schema type
const form = useForm<MyFormType>({
  schema: mySchema,
});
```

#### 3. Controlled component warnings

```tsx
// ❌ Wrong - undefined default value
const form = useForm({
  defaultValues: {}
});

// ✅ Correct - all fields have defaults
const form = useForm({
  defaultValues: {
    name: "",
    age: 0,
    active: false,
  }
});
```

#### 4. Form not submitting

```tsx
// Check console for validation errors
console.log(form.formState.errors);

// Ensure button is inside form
<form onSubmit={form.handleSubmit(onSubmit)}>
  <Button type="submit">Submit</Button>
</form>
```

#### 5. State not updating

```tsx
// ❌ Wrong - direct mutation
form.getValues().items.push(newItem);

// ✅ Correct - use setValue
form.setValue("items", [...form.getValues().items, newItem]);
```

## Migration Guide

### From Manual Forms

```tsx
// Before - Manual state management
const [email, setEmail] = useState("");
const [errors, setErrors] = useState({});

const handleSubmit = (e) => {
  e.preventDefault();
  if (!email) {
    setErrors({ email: "Required" });
    return;
  }
  // Submit
};

// After - React Hook Form
const form = useForm({
  schema: z.object({
    email: z.string().email(),
  }),
});

const onSubmit = form.handleSubmit(async (data) => {
  // Submit
});
```

## Performance Tips

1. **Use `mode: "onTouched"`** for most forms
2. **Debounce expensive validations** with custom validators
3. **Use `shouldUnregister: false`** for wizard forms
4. **Memoize complex computed values** with `useMemo`
5. **Use field arrays** instead of managing array state manually

## Testing Forms

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("validates required fields", async () => {
  render(<MyForm />);

  const submitButton = screen.getByRole("button", { name: /submit/i });
  await userEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });
});
```

## Summary

Our form architecture provides:

- ✅ **Type safety** from schema to submission
- ✅ **Automatic validation** with clear error messages
- ✅ **Excellent DX** with auto-complete and IntelliSense
- ✅ **Performance** with optimized re-renders
- ✅ **Flexibility** for simple to complex forms
- ✅ **Reusability** across the application

For questions or issues, check the example implementations in:
- `/apps/web/src/components/examples/login-form-example.tsx`
- `/apps/web/src/components/examples/advanced-form-example.tsx`