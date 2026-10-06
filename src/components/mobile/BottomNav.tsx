"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  CreditCard,
  Wallet,
  Megaphone,
  User,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingAIChat } from "../chat";

interface BottomNavProps {
  role: "ADMIN" | "WARGA";
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  const adminNavItems = [
    {
      label: "Beranda",
      href: "/",
      icon: Home,
      exact: true,
    },
    {
      label: "Warga",
      href: "/warga",
      icon: Users,
    },
    {
      label: "Iuran",
      href: "/iuran",
      icon: CreditCard,
    },
    {
      label: "Kas RT",
      href: "/kas",
      icon: Wallet,
    },
    {
      label: "Info",
      href: "/pengumuman",
      icon: Megaphone,
    },
  ];

  const wargaNavItems = [
    {
      label: "Beranda",
      href: "/portal",
      icon: Home,
      exact: true,
    },
    {
      label: "Iuran",
      href: "/portal/iuran",
      icon: CreditCard,
    },
    {
      label: "Kas RT",
      href: "/portal/kas",
      icon: Wallet,
    },
    {
      label: "Pengumuman",
      href: "/portal/pengumuman",
      icon: Megaphone,
    },
    {
      label: "Profil",
      href: "/portal/profil",
      icon: User,
    },
  ];

  const items = role === "ADMIN" ? adminNavItems : wargaNavItems;

  return (<>
    <FloatingAIChat />
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 relative group",
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-slate-500 hover:text-slate-900 active:scale-95"
              )}
            >
              {isActive && (
                <span className="absolute -top-1.5 w-7 h-1 bg-blue-600 rounded-full animate-in fade-in zoom-in duration-200" />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive ? "scale-110 text-blue-600" : "group-hover:scale-105"
                )}
              />
              <span className="text-[10px] tracking-tight mt-1 truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav></>
  );
}
