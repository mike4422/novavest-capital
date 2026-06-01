import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-teal-400 text-slate-950 shadow-[0_0_30px_rgba(45,212,191,.25)] hover:bg-teal-300",
        secondary: "bg-white/10 text-white hover:bg-white/15 dark:bg-white/10",
        outline: "border border-white/15 bg-white/5 hover:bg-white/10",
        ghost: "hover:bg-white/10",
        destructive: "bg-red-500 text-white hover:bg-red-400",
        premium: "bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-400 text-slate-950 shadow-[0_0_40px_rgba(45,212,191,.25)] hover:scale-[1.01]"
      },
      size: {
        sm: "h-9 px-3",
        default: "h-11 px-5",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, loadingText, disabled, children, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }), loading && "cursor-wait")}
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </button>
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
