import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Translucent "material" surface (nav, floating chrome) instead of a flat one. Never stack two. */
  translucent?: boolean;
}

export function Card({ className, translucent, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border p-6 shadow-sm",
        translucent ? "material" : "bg-surface",
        className,
      )}
      {...props}
    />
  );
}
