import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  variant?: "blue" | "emerald" | "amber" | "rose" | "indigo" | "default";
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
  onClick,
}: StatCardProps) {
  const variantStyles = {
    default: "bg-white border-slate-200 text-slate-900",
    blue: "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500 text-white shadow-blue-500/20",
    emerald: "bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-500 text-white shadow-emerald-500/20",
    amber: "bg-gradient-to-br from-amber-500 to-orange-600 border-amber-500 text-white shadow-amber-500/20",
    rose: "bg-gradient-to-br from-rose-600 to-red-700 border-rose-500 text-white shadow-rose-500/20",
    indigo: "bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-500 text-white shadow-indigo-500/20",
  };

  const isGradient = variant !== "default";

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl p-4 border shadow-sm transition-all duration-200 relative overflow-hidden",
        variantStyles[variant],
        onClick && "cursor-pointer active:scale-95 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              "text-xs font-medium tracking-tight",
              isGradient ? "text-white/80" : "text-slate-500"
            )}
          >
            {title}
          </p>
          <div
            className={cn(
              "text-xl font-bold tracking-tight",
              isGradient ? "text-white" : "text-slate-900"
            )}
          >
            {value}
          </div>
          {subtitle && (
            <p
              className={cn(
                "text-[11px]",
                isGradient ? "text-white/70" : "text-slate-400"
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <span
              className={cn(
                "inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1",
                isGradient
                  ? "bg-white/20 text-white"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200"
              )}
            >
              {trend}
            </span>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "p-2.5 rounded-xl flex items-center justify-center shrink-0",
              isGradient ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
