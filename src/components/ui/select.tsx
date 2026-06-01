import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn("h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-300", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
