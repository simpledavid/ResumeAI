import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-transparent bg-[#eceef1] px-4 py-2 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 transition focus-visible:border-[#33b672] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#33b672]/15 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
