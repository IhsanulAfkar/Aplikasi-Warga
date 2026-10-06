import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMyDuesBills } from "@/server/actions/dues";
import { getCashSummary } from "@/server/actions/cash";
import { getAnnouncements } from "@/server/actions/announcements";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { BottomNav } from "@/components/mobile/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatShortDate, maskKK } from "@/lib/formatters";
import {
  CreditCard,
  Wallet,
  Megaphone,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Building,
} from "lucide-react";

export default async function WargaPortalPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [duesData, cashSummary, announcements] = await Promise.all([
    getMyDuesBills(),
    getCashSummary(),
    getAnnouncements(true),
  ]);

  const hasUnpaid = duesData.unpaidBills.length > 0;

  return (
    <MobileFrame>
      <TopBar
        title="WargaKu"
        subtitle="Portal Warga RT 001"
        userRole="WARGA"
        userName={user.nama}
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
        {/* User Identity Welcome Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-4 text-white shadow-lg shadow-blue-500/15">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-blue-200 font-medium">
                Selamat Datang,
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                {user.nama || user.username}
              </h2>
              <p className="text-[11px] text-blue-200">
                No. KK: {maskKK(user.nomorKK)}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Highlight Tagihan Iuran Saya */}
        {hasUnpaid ? (
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-4 text-white shadow-lg shadow-amber-500/20 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-100">
                    Tagihan Perlu Dibayar
                  </h3>
                  <p className="text-lg font-extrabold tracking-tight">
                    {formatRupiah(duesData.totalUnpaidAmount)}
                  </p>
                </div>
              </div>
              <span className="text-[11px] bg-white/25 px-2.5 py-0.5 rounded-full font-semibold">
                {duesData.unpaidBills.length} Tagihan
              </span>
            </div>

            <p className="text-xs text-amber-100 leading-relaxed">
              Anda memiliki {duesData.unpaidBills.length} tagihan iuran yang belum lunas. Silakan lakukan pembayaran ke bendahara RT.
            </p>

            <Link href="/portal/iuran" className="block">
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-white text-amber-900 hover:bg-amber-50 border-0 font-semibold flex items-center justify-center gap-1.5 rounded-md"
              >
                <span>Lihat Rincian Tagihan Saya</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-4 text-white shadow-lg shadow-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                    Status Iuran Anda
                  </h3>
                  <p className="text-base font-extrabold">Semua Iuran Lunas</p>
                </div>
              </div>
              <Badge variant="success" className="bg-white/20 text-white border-0">
                Lunas
              </Badge>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Terima kasih telah berpartisipasi menjaga kelancaran operasional lingkungan RT kita!
            </p>
          </div>
        )}

        {/* Quick Portal Navigation Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/portal/iuran"
            className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 active:scale-95 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Iuran Saya</h4>
              <p className="text-[10px] text-slate-500">
                {hasUnpaid ? `${duesData.unpaidBills.length} Belum Bayar` : "Lunas"}
              </p>
            </div>
          </Link>

          <Link
            href="/portal/kas"
            className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-400 active:scale-95 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Kas RT Transparan</h4>
              <p className="text-[10px] text-slate-500">
                Saldo: {formatRupiah(cashSummary.currentBalance)}
              </p>
            </div>
          </Link>
        </div>

        {/* Transparansi Kas Singkat */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-800">
                Transparansi Kas Lingkungan
              </h3>
            </div>
            <Link
              href="/portal/kas"
              className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center"
            >
              Rincian <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400">Pemasukan Bulan Ini</p>
              <p className="text-xs font-bold text-emerald-600">
                {formatRupiah(cashSummary.thisMonthIncome)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Pengeluaran Bulan Ini</p>
              <p className="text-xs font-bold text-slate-700">
                {formatRupiah(cashSummary.thisMonthExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Feed Pengumuman Terbaru */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pengumuman Lingkungan
            </h3>
            <Link
              href="/portal/pengumuman"
              className="text-xs text-blue-600 font-medium flex items-center hover:underline"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {announcements.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {ann.priority === "IMPORTANT" ? (
                      <Badge variant="danger" size="sm">
                        Penting
                      </Badge>
                    ) : (
                      <Badge variant="info" size="sm">
                        Pengumuman
                      </Badge>
                    )}
                    <span className="text-[11px] text-slate-400">
                      {formatShortDate(ann.publishDate)}
                    </span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {ann.title}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav role="WARGA" />
    </MobileFrame>
  );
}
