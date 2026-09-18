import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/permissions";
import { getDuesPeriods, getDuesSummaryStats, getDuesTypes } from "@/server/actions/dues";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { BottomNav } from "@/components/mobile/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah, formatShortDate, FREQUENCY_LABELS, TARGET_TYPE_LABELS } from "@/lib/formatters";
import {
  CreditCard,
  Plus,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
} from "lucide-react";

interface DuesPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DuesManagementPage({ searchParams }: DuesPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const activeTab = params.tab || "periods";

  const [stats, periods, duesTypes] = await Promise.all([
    getDuesSummaryStats(),
    getDuesPeriods(),
    getDuesTypes(),
  ]);

  return (
    <MobileFrame>
      <TopBar
        title="Manajemen Iuran"
        subtitle="Kelola Tipe & Tagihan Warga"
        userRole="ADMIN"
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
        {/* Statistics Summary */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-4 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">
              Ringkasan Tagihan Iuran
            </span>
            <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-0">
              {stats.percentage}% Terkumpul
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <p className="text-[10px] text-slate-400">Total Diterima</p>
              <p className="text-base font-bold text-emerald-400">
                {formatRupiah(stats.totalCollected)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {stats.paidBillsCount} tagihan lunas
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-400">Total Tertunggak</p>
              <p className="text-base font-bold text-rose-400">
                {formatRupiah(stats.totalOutstanding)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {stats.unpaidBillsCount} tagihan tertunda
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex bg-slate-200/80 p-1 rounded-2xl flex-1">
            <Link
              href="/iuran?tab=periods"
              className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "periods"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Periode Tagihan</span>
            </Link>

            <Link
              href="/iuran?tab=types"
              className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "types"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tipe Iuran</span>
            </Link>
          </div>

          <Link
            href={activeTab === "periods" ? "/iuran/periods/new" : "/iuran/types"}
            className="h-9 px-3 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{activeTab === "periods" ? "Tagihan Baru" : "Tipe Baru"}</span>
          </Link>
        </div>

        {/* Tab 1: Periods */}
        {activeTab === "periods" && (
          <div className="space-y-2.5">
            {periods.length === 0 ? (
              <EmptyState
                icon={<CreditCard className="w-8 h-8 text-slate-400" />}
                title="Belum ada periode tagihan"
                description="Buat periode tagihan iuran baru untuk menagih seluruh KK atau warga aktif."
                action={
                  <Link href="/iuran/periods/new">
                    <span className="text-xs font-semibold text-blue-600 hover:underline">
                      + Buat Periode Tagihan
                    </span>
                  </Link>
                }
              />
            ) : (
              periods.map((period) => {
                const totalBills = period.bills.length;
                const paidBills = period.bills.filter((b) => b.status === "PAID").length;
                const percent = totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 0;

                return (
                  <Link
                    key={period.id}
                    href={`/iuran/periods/${period.id}`}
                    className="block"
                  >
                    <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 active:scale-[0.99] transition-all space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900">
                              {period.periodName}
                            </h3>
                            <Badge variant="outline" size="sm">
                              {period.duesType.name}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Jatuh Tempo: {formatShortDate(period.dueDate)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900">
                            {formatRupiah(period.amount)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            /{period.duesType.targetType === "PER_KK" ? "KK" : "Warga"}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 font-medium">
                            Kolektivitas: {paidBills}/{totalBills} Lunas
                          </span>
                          <span className="font-bold text-blue-600">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end text-[10px] font-semibold text-blue-600 pt-0.5">
                        <span className="flex items-center">
                          Lihat Detail & Catat Pembayaran{" "}
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Dues Types */}
        {activeTab === "types" && (
          <div className="space-y-2.5">
            {duesTypes.map((type) => (
              <div
                key={type.id}
                className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {type.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      Kode: {type.code}
                    </p>
                  </div>
                  <Badge variant="info" size="sm">
                    {formatRupiah(type.amount)}
                  </Badge>
                </div>

                {type.description && (
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {type.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                  <span>
                    Target: {TARGET_TYPE_LABELS[type.targetType] || type.targetType}
                  </span>
                  <span>Frekuensi: {FREQUENCY_LABELS[type.frequency] || type.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav role="ADMIN" />
    </MobileFrame>
  );
}
