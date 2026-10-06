import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/permissions";
import { getCashSummary, getCashTransactions } from "@/server/actions/cash";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { BottomNav } from "@/components/mobile/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah, formatShortDate, CATEGORY_LABELS } from "@/lib/formatters";
import { ReverseTransactionButton } from "./ReverseTransactionButton";
import {
  Wallet,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface KasPageProps {
  searchParams: Promise<{
    type?: string;
    category?: string;
    q?: string;
  }>;
}

export default async function KasManagementPage({ searchParams }: KasPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const filterType = params.type || "ALL";
  const filterCategory = params.category || "ALL";
  const query = params.q || "";

  const [summary, transactions] = await Promise.all([
    getCashSummary(),
    getCashTransactions(filterType, filterCategory, query),
  ]);

  return (
    <MobileFrame>
      <TopBar
        title="Pembukuan Kas RT"
        subtitle="Pemasukan & Pengeluaran Kas"
        userRole="ADMIN"
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
        {/* Main Balance Hero Card */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-5 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-100 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-blue-200" />
              Saldo Kas RT 001
            </span>
          </div>

          <div className="text-3xl font-extrabold tracking-tight">
            {formatRupiah(summary.currentBalance)}
          </div>

          <div className="pt-2 border-t border-white/15 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-blue-200">Total Pemasukan</p>
              <p className="text-xs font-bold text-emerald-300">
                {formatRupiah(summary.totalIncome)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-blue-200">Total Pengeluaran</p>
              <p className="text-xs font-bold text-rose-300">
                {formatRupiah(summary.totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button & Filters */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-200/80 p-1 rounded-2xl flex-1">
            <Link
              href="/kas"
              className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition-all ${filterType === "ALL"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Semua
            </Link>
            <Link
              href="/kas?type=INCOME"
              className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition-all ${filterType === "INCOME"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Masuk
            </Link>
            <Link
              href="/kas?type=EXPENSE"
              className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition-all ${filterType === "EXPENSE"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Keluar
            </Link>
          </div>

          <Link
            href="/kas/new"
            className="h-9 px-3.5 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 active:scale-95 shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Kas</span>
          </Link>
        </div>

        {/* Transactions List */}
        <div className="space-y-2.5">
          {transactions.length === 0 ? (
            <EmptyState
              icon={<Wallet className="w-8 h-8 text-slate-400" />}
              title="Belum ada transaksi kas"
              description="Catat pemasukan atau pengeluaran dana kas lingkungan RT 001."
            />
          ) : (
            transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";

              return (
                <div
                  key={tx.id}
                  className={`p-3.5 bg-white border rounded-2xl shadow-sm space-y-2 ${tx.isReversed
                      ? "border-slate-200 bg-slate-50/70 opacity-60"
                      : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
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
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {tx.description}
                          </h4>
                          {tx.isReversed && (
                            <Badge variant="danger" size="sm">
                              Dibatalkan
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {CATEGORY_LABELS[tx.category] || tx.category} • {formatShortDate(tx.transactionDate)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-bold ${tx.isReversed
                            ? "text-slate-400 line-through"
                            : isIncome
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                      >
                        {isIncome ? "+" : "-"} {formatRupiah(tx.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Reversal / Creator info */}
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Oleh: @{tx.createdBy.username}</span>

                    {!tx.isReversed && (
                      <ReverseTransactionButton transactionId={tx.id} />
                    )}

                    {tx.isReversed && tx.reversalReason && (
                      <span className="text-rose-500 font-medium italic">
                        Alasan: {tx.reversalReason}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <BottomNav role="ADMIN" />
    </MobileFrame>
  );
}
