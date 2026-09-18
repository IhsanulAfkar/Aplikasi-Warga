import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMyDuesBills } from "@/server/actions/dues";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { BottomNav } from "@/components/mobile/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah, formatShortDate } from "@/lib/formatters";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  QrCode,
  ShieldCheck,
} from "lucide-react";

export default async function WargaIuranPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const duesData = await getMyDuesBills();

  return (
    <MobileFrame>
      <TopBar
        title="Iuran Saya"
        subtitle="Daftar Tagihan & Riwayat Bayar"
        userRole="WARGA"
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
        {/* Balance & Summary Header */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl p-4 text-white shadow-lg space-y-3">
          <span className="text-xs text-blue-200 font-medium">
            Status Iuran Keluarga Anda
          </span>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <p className="text-[10px] text-blue-200">Belum Dibayar</p>
              <p className="text-base font-bold text-amber-300">
                {formatRupiah(duesData.totalUnpaidAmount)}
              </p>
              <p className="text-[10px] text-blue-200 mt-0.5">
                {duesData.unpaidBills.length} Tagihan
              </p>
            </div>

            <div>
              <p className="text-[10px] text-blue-200">Total Telah Lunas</p>
              <p className="text-base font-bold text-emerald-300">
                {formatRupiah(duesData.totalPaidAmount)}
              </p>
              <p className="text-[10px] text-blue-200 mt-0.5">
                {duesData.paidBills.length} Periode
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Tagihan Aktif (Unpaid) */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tagihan Menunggu Pembayaran ({duesData.unpaidBills.length})
          </h3>

          {duesData.unpaidBills.length === 0 ? (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-900">
                  Tidak Ada Tunggakan
                </h4>
                <p className="text-[11px] text-emerald-700">
                  Seluruh iuran keluarga Anda telah lunas.
                </p>
              </div>
            </div>
          ) : (
            duesData.unpaidBills.map((bill) => (
              <div
                key={bill.id}
                className="p-3.5 bg-white border border-amber-200/80 rounded-2xl shadow-sm space-y-2.5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                <div className="flex items-start justify-between pl-1">
                  <div>
                    <span className="text-[10px] font-semibold text-amber-600 uppercase">
                      {bill.period.duesType.name}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                      {bill.period.periodName}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Jatuh Tempo: {formatShortDate(bill.period.dueDate)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block">
                      {formatRupiah(bill.amount)}
                    </span>
                    <Badge variant="warning" size="sm" className="mt-1">
                      Belum Bayar
                    </Badge>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-700">
                    💡 Cara Pembayaran:
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Bayar langsung ke Bendahara RT 001 (Bpk. Joko) secara tunai atau transfer QRIS, lalu pengurus akan mengonfirmasi status lunas.
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Section 2: Riwayat Pembayaran (Paid) */}
        <div className="space-y-2.5 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Riwayat Pembayaran Lunas ({duesData.paidBills.length})
          </h3>

          {duesData.paidBills.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="w-8 h-8 text-slate-400" />}
              title="Belum ada riwayat"
              description="Riwayat iuran yang telah lunas akan tercatat di sini."
            />
          ) : (
            duesData.paidBills.map((bill) => (
              <div
                key={bill.id}
                className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {bill.period.periodName} ({bill.period.duesType.name})
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Lunas: {formatShortDate(bill.paidAt)} • Via {bill.payment?.paymentMethod}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-600">
                  {formatRupiah(bill.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav role="WARGA" />
    </MobileFrame>
  );
}
