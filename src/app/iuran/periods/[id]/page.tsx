import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/permissions";
import { getPeriodDetailWithBills } from "@/server/actions/dues";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatShortDate, formatDateTime } from "@/lib/formatters";
import { PaymentModalButton } from "./PaymentModalButton";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Home,
  User,
  Filter,
} from "lucide-react";

interface PeriodDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function PeriodDetailPage({
  params,
  searchParams,
}: PeriodDetailPageProps) {
  await requireAdmin();
  const { id } = await params;
  const { status } = await searchParams;

  const period = await getPeriodDetailWithBills(id, status);

  if (!period) {
    notFound();
  }

  const totalBills = period.bills.length;
  const paidBills = period.bills.filter((b) => b.status === "PAID").length;
  const unpaidBills = period.bills.filter((b) => b.status === "UNPAID").length;
  const totalCollected = paidBills * period.amount;

  return (
    <MobileFrame>
      <TopBar
        title={period.periodName}
        subtitle={period.duesType.name}
        showBack
        backHref="/iuran"
        userRole="ADMIN"
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
        {/* Period Summary Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                {period.duesType.name}
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                {period.periodName}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Jatuh Tempo: <strong>{formatShortDate(period.dueDate)}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Tagihan</span>
              <p className="text-sm font-bold text-slate-900">
                {formatRupiah(period.amount)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 bg-slate-50 rounded-xl">
              <p className="text-[10px] text-slate-400">Total Wajib</p>
              <p className="text-xs font-bold text-slate-800">{totalBills} KK</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <p className="text-[10px] text-emerald-600">Lunas</p>
              <p className="text-xs font-bold text-emerald-700">{paidBills} KK</p>
            </div>
            <div className="p-2 bg-rose-50 rounded-xl">
              <p className="text-[10px] text-rose-600">Belum Bayar</p>
              <p className="text-xs font-bold text-rose-700">{unpaidBills} KK</p>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl">
          <Link
            href={`/iuran/periods/${period.id}`}
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition-all ${
              !status || status === "ALL"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua ({totalBills})
          </Link>
          <Link
            href={`/iuran/periods/${period.id}?status=UNPAID`}
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition-all ${
              status === "UNPAID"
                ? "bg-white text-rose-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Belum Bayar ({unpaidBills})
          </Link>
          <Link
            href={`/iuran/periods/${period.id}?status=PAID`}
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition-all ${
              status === "PAID"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Lunas ({paidBills})
          </Link>
        </div>

        {/* Bills List */}
        <div className="space-y-2.5">
          {period.bills.map((bill) => {
            const isPaid = bill.status === "PAID";
            const targetName = bill.familyCard
              ? bill.familyCard.kepalaKeluarga
              : bill.resident?.nama;

            return (
              <div
                key={bill.id}
                className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900">
                        {targetName}
                      </h4>
                      {isPaid ? (
                        <Badge variant="success" size="sm">
                          Lunas
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          Belum Bayar
                        </Badge>
                      )}
                    </div>
                    {bill.familyCard && (
                      <p className="text-[11px] text-slate-500">
                        {bill.familyCard.alamat}
                      </p>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-900">
                    {formatRupiah(bill.amount)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {isPaid ? (
                    <div className="text-[10px] text-slate-400">
                      <span>
                        Dibayar: {formatShortDate(bill.paidAt)} ({bill.payment?.paymentMethod})
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-rose-500 font-medium">
                      Menunggu pembayaran
                    </div>
                  )}

                  {!isPaid && (
                    <PaymentModalButton
                      billId={bill.id}
                      targetName={targetName || "Warga"}
                      amount={bill.amount}
                      periodName={period.periodName}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileFrame>
  );
}
