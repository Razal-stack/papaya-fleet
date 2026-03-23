import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@papaya-fleet/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#0a0a0a] text-white border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.1)] hover:bg-[#1a1a1a] hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] active:translate-y-0 active:shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(0,0,0,0.15)] dark:bg-white dark:text-[#0a0a0a] dark:border-white/10 dark:hover:bg-[#f5f5f5] dark:active:bg-[#e5e5e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
        outline:
          "bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 hover:shadow-sm active:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:hover:border-gray-500 dark:active:bg-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
        secondary:
          "bg-white text-[#0a0a0a] border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-[1px] hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_4px_6px_rgba(0,0,0,0.04)] active:translate-y-0 active:bg-gray-100 active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:active:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
        ghost:
          "bg-transparent border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white dark:active:bg-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
        destructive:
          "bg-red-500 text-white border-red-600 shadow-sm hover:bg-red-600 hover:border-red-700 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500",
        link: "bg-transparent border-transparent text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
      },
      size: {
        default: "h-9 gap-1.5 px-4 text-sm",
        xs: "h-7 gap-1 px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3.5 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-5 text-base [&_svg:not([class*='size-'])]:size-5",
        icon: "size-9 p-0",
        "icon-xs": "size-7 p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 p-0 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
