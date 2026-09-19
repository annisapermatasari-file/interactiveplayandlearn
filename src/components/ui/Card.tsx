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
        "rounded-[28px] border border-border bg-white/90 p-6 shadow-[0_12px_28px_rgba(43,31,26,0.08)]",
        translucent ? "material" : "bg-surface",
        className,
      )}
      {...props}
    />
  );
}
