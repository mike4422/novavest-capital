import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors", {
  variants: {
    variant: {
      default: "border-teal-300/20 bg-teal-300/10 text-teal-200",
      secondary: "border-white/10 bg-white/10 text-slate-200",
      warning: "border-amber-300/20 bg-amber-300/10 text-amber-200",
      destructive: "border-red-300/20 bg-red-300/10 text-red-200",
      success: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
      violet: "border-violet-300/20 bg-violet-300/10 text-violet-200"
    }
  },
  defaultVariants: { variant: "default" }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
