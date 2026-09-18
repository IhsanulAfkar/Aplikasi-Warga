"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { logoutAction } from "@/server/actions/auth";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  rightElement?: React.ReactNode;
  userRole?: "ADMIN" | "WARGA";
  userName?: string;
}

export function TopBar({
  title = "Warga RT 001",
  subtitle,
  showBack = false,
  backHref,
  rightElement,
  userRole,
  userName,
}: TopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between transition-all">
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 active:bg-slate-200 text-slate-700 transition-colors"
            aria-label="Kembali"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold tracking-tight text-slate-900 truncate">
              {title}
            </h1>
            {userRole && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  userRole === "ADMIN"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                {userRole === "ADMIN" ? "Admin RT" : "Warga"}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {rightElement}
        {!rightElement && (
          <form action={logoutAction}>
            <button
              type="submit"
              className="p-2 text-slate-400 hover:text-red-600 active:bg-red-50 rounded-full transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
