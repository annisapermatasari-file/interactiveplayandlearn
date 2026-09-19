import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(255,138,61,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(255,138,61,0.32)]",
  secondary: "bg-accent text-accent-foreground shadow-[0_10px_22px_rgba(255,209,102,0.25)] hover:-translate-y-0.5",
  ghost: "bg-white/70 text-foreground border border-border hover:bg-white",
  danger: "bg-danger text-white shadow-[0_10px_22px_rgba(238,91,91,0.22)] hover:-translate-y-0.5",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-14 px-7 text-lg",
};

/** Shared button-look classes, usable on <button>, <Link>, or any element. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold",
    "transition-all duration-150 ease-[var(--spring-out)]",
    "active:scale-[0.97] active:duration-75",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return <button ref={ref} className={buttonClasses({ variant, size, className })} {...props} />;
  },
);
Button.displayName = "Button";
