import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCashSummary } from "@/server/actions/cash";
import { getDuesSummaryStats } from "@/server/actions/dues";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { BottomNav } from "@/components/mobile/BottomNav";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatShortDate, CATEGORY_LABELS } from "@/lib/formatters";
import {
  Users,
  CreditCard,
  Wallet,
  Megaphone,
  UserPlus,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
} from "lucide-react";
import { FloatingAIChat } from "@/components/chat";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "WARGA") {
    redirect("/portal");
  }

  // Fetch metrics in parallel
  const [
    totalKK,
    totalWarga,
    cashSummary,
    duesStats,
    latestAnnouncements,
    latestTransactions,
  ] = await Promise.all([
    prisma.familyCard.count({ where: { isActive: true } }),
    prisma.resident.count({ where: { statusWarga: "AKTIF" } }),
    getCashSummary(),
    getDuesSummaryStats(),
    prisma.announcement.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 2,
    }),
    prisma.cashTransaction.findMany({
      orderBy: { transactionDate: "desc" },
      take: 4,
    }),
  ]);

  return (
    <MobileFrame>
      <TopBar
        title="Dashboard Pengurus"
        subtitle="RT 001 / RW 005 Kel. Sukamaju"
        userRole="ADMIN"
        userName={user.nama}
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
        {/* Main Balance Hero Card */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-blue-200" />
                Saldo Kas RT Saat Ini
              </span>
            </div>

            <div className="text-3xl font-extrabold tracking-tight">
              {formatRupiah(cashSummary.currentBalance)}
            </div>

            {/* Inflow vs Outflow Mini Summary */}
            <div className="pt-2 border-t border-white/15 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-200">Masuk (Bln Ini)</p>
                  <p className="text-xs font-bold text-white">
                    {formatRupiah(cashSummary.thisMonthIncome)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-200">Keluar (Bln Ini)</p>
                  <p className="text-xs font-bold text-white">
                    {formatRupiah(cashSummary.thisMonthExpense)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/warga">
            <StatCard
              title="Keluarga Terdata"
              value={`${totalKK} KK`}
              subtitle={`${totalWarga} Jiwa Warga`}
              icon={<Users className="w-4 h-4 text-blue-600" />}
            />
          </Link>

          <Link href="/iuran">
            <StatCard
              title="Kolektibilitas Iuran"
              value={`${duesStats.percentage}%`}
              subtitle={`${duesStats.paidBillsCount}/${duesStats.totalBills} Tagihan Lunas`}
              icon={<CreditCard className="w-4 h-4 text-emerald-600" />}
            />
          </Link>
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Aksi Cepat
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Link
              href="/warga/kk/new"
              className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 rounded-2xl text-center active:scale-95 transition-all shadow-sm hover:border-blue-300"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 leading-tight">
                Tambah KK
              </span>
            </Link>

            <Link
              href="/iuran/periods/new"
              className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 rounded-2xl text-center active:scale-95 transition-all shadow-sm hover:border-emerald-300"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 leading-tight">
                Tagihan Baru
              </span>
            </Link>

            <Link
              href="/kas/new"
              className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 rounded-2xl text-center active:scale-95 transition-all shadow-sm hover:border-amber-300"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
                <PlusCircle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 leading-tight">
                Catat Kas
              </span>
            </Link>

            <Link
              href="/pengumuman/new"
              className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 rounded-2xl text-center active:scale-95 transition-all shadow-sm hover:border-purple-300"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5">
                <Megaphone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 leading-tight">
                Pengumuman
              </span>
            </Link>
          </div>
        </div>

        {/* Pengumuman Terbaru */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pengumuman Aktif
            </h3>
            <Link
              href="/pengumuman"
              className="text-xs text-blue-600 font-medium flex items-center hover:underline"
            >
              Kelola <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {latestAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1.5 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {ann.priority === "IMPORTANT" ? (
                      <Badge variant="danger" size="sm">
                        Penting
                      </Badge>
                    ) : (
                      <Badge variant="info" size="sm">
                        Info
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
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transaksi Kas Terkini */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Transaksi Kas Terbaru
            </h3>
            <Link
              href="/kas"
              className="text-xs text-blue-600 font-medium flex items-center hover:underline"
            >
              Semua Kas <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="divide-y divide-slate-100 p-0 overflow-hidden">
            {latestTransactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              return (
                <div
                  key={tx.id}
                  className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isIncome
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                        }`}
                    >
                      {isIncome ? (
                        <ArrowDownRight className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>{CATEGORY_LABELS[tx.category] || tx.category}</span>
                        <span>•</span>
                        <span>{formatShortDate(tx.transactionDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span
                      className={`text-xs font-bold ${isIncome ? "text-emerald-600" : "text-slate-900"
                        }`}
                    >
                      {isIncome ? "+" : "-"} {formatRupiah(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      <BottomNav role="ADMIN" />
    </MobileFrame>
  );
}
