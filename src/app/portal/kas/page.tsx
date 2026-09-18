import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCashSummary, getCashTransactions } from "@/server/actions/cash";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { BottomNav } from "@/components/mobile/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah, formatShortDate, CATEGORY_LABELS } from "@/lib/formatters";
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Building,
} from "lucide-react";

interface WargaKasPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function WargaKasPage({ searchParams }: WargaKasPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const filterType = params.type || "ALL";

  const [summary, transactions] = await Promise.all([
    getCashSummary(),
    getCashTransactions(filterType),
  ]);

  return (
    <MobileFrame>
      <TopBar
        title="Transparansi Kas RT"
        subtitle="Laporan Keuangan Lingkungan"
        userRole="WARGA"
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
        {/* Main Balance Hero */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-5 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-100 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-blue-200" />
              Saldo Kas RT 001 Saat Ini
            </span>
            <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-0">
              Transparan
            </Badge>
          </div>

          <div className="text-3xl font-extrabold tracking-tight">
            {formatRupiah(summary.currentBalance)}
          </div>

          <div className="pt-2 border-t border-white/15 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-blue-200">Pemasukan Bulan Ini</p>
              <p className="text-xs font-bold text-emerald-300">
                {formatRupiah(summary.thisMonthIncome)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-blue-200">Pengeluaran Bulan Ini</p>
              <p className="text-xs font-bold text-rose-300">
                {formatRupiah(summary.thisMonthExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Type Pills */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl">
          <Link
            href="/portal/kas"
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition-all ${
              filterType === "ALL"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua
          </Link>
          <Link
            href="/portal/kas?type=INCOME"
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition-all ${
              filterType === "INCOME"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pemasukan
          </Link>
          <Link
            href="/portal/kas?type=EXPENSE"
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition-all ${
              filterType === "EXPENSE"
                ? "bg-white text-rose-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pengeluaran
          </Link>
        </div>

        {/* Public Transactions List */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Riwayat Arus Kas ({transactions.length})
          </h3>

          {transactions.length === 0 ? (
            <EmptyState
              icon={<Wallet className="w-8 h-8 text-slate-400" />}
              title="Belum ada transaksi"
              description="Belum ada catatan mutasi kas untuk kategori ini."
            />
          ) : (
            transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";

              return (
                <div
                  key={tx.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
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
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {tx.description}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {CATEGORY_LABELS[tx.category] || tx.category} • {formatShortDate(tx.transactionDate)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-bold ${
                          isIncome ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {isIncome ? "+" : "-"} {formatRupiah(tx.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <BottomNav role="WARGA" />
    </MobileFrame>
  );
}
