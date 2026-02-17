import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantClassMap: Record<ButtonVariant, string> = {
  default:
    "bg-[#25b06b] text-white hover:bg-[#1f9c5f] focus-visible:ring-[#25b06b]/35",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300/40",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300/40",
};

const sizeClassMap: Record<ButtonSize, string> = {
  default: "h-11 px-4 py-2 text-sm",
  sm: "h-9 px-3 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export const buttonVariants = ({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50",
    variantClassMap[variant],
    sizeClassMap[size],
    className,
  );

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button };
