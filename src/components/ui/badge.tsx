import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline" | "secondary";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20",
    warning: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20",
    danger: "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20",
    info: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20",
    outline: "border-slate-300 text-slate-700",
    secondary: "bg-slate-200/70 text-slate-700 border-transparent",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full border transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
