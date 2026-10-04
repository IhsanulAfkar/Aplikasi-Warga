import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { BottomNav } from "@/components/mobile/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/formatters";
import { ChangePasswordForm } from "@/app/portal/profil/ChangePasswordForm";
import { logoutAction } from "@/server/actions/auth";
import {
  ShieldCheck,
  Building,
  KeyRound,
  LogOut,
  Users,
  Database,
} from "lucide-react";

export default async function AdminProfilPage() {
  await requireAdmin();
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [totalKK, totalWarga, totalBills] = await Promise.all([
    prisma.familyCard.count(),
    prisma.resident.count(),
    prisma.duesBill.count(),
  ]);

  return (
    <MobileFrame>
      <TopBar
        title="Pengaturan Admin"
        subtitle="Akun Pengurus RT 001"
        userRole="ADMIN"
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
        {/* Admin Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-4 text-white shadow-md space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Pengurus RT 001
                </h2>
                <Badge variant="warning" size="sm">
                  Admin
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Username: @{user.username}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-800/80 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Total KK</span>
              <span className="font-bold text-white">{totalKK}</span>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Total Warga</span>
              <span className="font-bold text-white">{totalWarga}</span>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Tagihan</span>
              <span className="font-bold text-white">{totalBills}</span>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Informasi Lingkungan & Sistem</span>
          </h3>
          <p className="text-slate-500 leading-relaxed">
            Aplikasi Manajemen Warga & Kas RT 001 / RW 005, Kelurahan Sukamaju, Kecamatan Cilodong, Kota Depok.
          </p>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <span>Database: SQLite (Prisma ORM)</span>
            <span>Versi: 1.0.0</span>
          </div>
        </div>

        {/* Password Card */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Keamanan Akun
          </h3>
          <ChangePasswordForm />
        </div>

        {/* Logout Action */}
        <div className="pt-2">
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"

              className="w-full text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Aplikasi</span>
            </Button>
          </form>
        </div>
      </div>

      <BottomNav role="ADMIN" />
    </MobileFrame>
  );
}
