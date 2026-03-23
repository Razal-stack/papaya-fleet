# Forms Quick Reference

## 🚀 Quick Setup

```tsx
// 1. Import from forms package
import { useForm } from "@papaya-fleet/forms";
import { mySchema } from "@papaya-fleet/validation";

// 2. Import UI components
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@papaya-fleet/ui/components/form";

// 3. Create your form
const form = useForm({
  schema: mySchema,
  mode: "onTouched",
});

// 4. Handle submission
const onSubmit = form.handleSubmit(async (data) => {
  // Your logic here
});
```

## 📦 Packages

- **@papaya-fleet/forms** - Form hooks and utilities
- **@papaya-fleet/validation** - Zod schemas
- **@papaya-fleet/ui/components/form** - UI components

## 🎯 Common Patterns

### Basic Form
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### With TRPC
```tsx
const form = useTRPCForm({
  schema: createSchema,
  mutation: trpc.entity.create,
  onSuccess: () => toast.success("Created!"),
});
```

### Field Arrays
```tsx
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "items",
});
```

### Form Persistence
```tsx
useFormPersist({
  form,
  storage: "draft-key",
  exclude: ["password"],
});
```

## 🔧 Validation Modes

- `onChange` - Validate on every keystroke
- `onBlur` - Validate when field loses focus
- `onTouched` - Validate after first blur (recommended)
- `onSubmit` - Validate only on submit

## 📝 Schema Examples

```typescript
// Simple validation
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

// With refinement
const schema = z.object({
  password: z.string().min(8),
  confirm: z.string(),
}).refine(
  data => data.password === data.confirm,
  { message: "Passwords must match", path: ["confirm"] }
);

// Transform values
const schema = z.object({
  price: z.string()
    .transform(val => parseFloat(val))
    .pipe(z.number().positive()),
});
```

## ✅ Examples

- Login Form: `/apps/web/src/components/examples/login-form-example.tsx`
- Advanced Form: `/apps/web/src/components/examples/advanced-form-example.tsx`

## 📚 Full Documentation

See [FORMS.md](./FORMS.md) for complete documentation.