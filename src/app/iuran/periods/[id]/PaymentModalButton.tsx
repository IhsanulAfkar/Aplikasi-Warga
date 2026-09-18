"use client";

import React, { useActionState, useState } from "react";
import { recordManualPayment } from "@/server/actions/dues";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatRupiah } from "@/lib/formatters";
import { CheckCircle, X } from "lucide-react";

interface PaymentModalButtonProps {
  billId: string;
  targetName: string;
  amount: number;
  periodName: string;
}

export function PaymentModalButton({
  billId,
  targetName,
  amount,
  periodName,
}: PaymentModalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
    const res = await recordManualPayment(prev, formData);
    if (res?.success) {
      setIsOpen(false);
    }
    return res;
  }, null);

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="sm"
        className="text-xs h-7 px-2.5 font-semibold"
        onClick={() => setIsOpen(true)}
      >
        Catat Bayar
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Catat Pembayaran Iuran
                  </h3>
                  <p className="text-[11px] text-slate-500">{periodName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Wajib Bayar:</span>
                <strong className="text-slate-900">{targetName}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Nominal Tagihan:</span>
                <strong className="text-blue-600 font-bold">
                  {formatRupiah(amount)}
                </strong>
              </div>
            </div>

            <form action={formAction} className="space-y-3">
              {state?.error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {state.error}
                </div>
              )}

              <input type="hidden" name="billId" value={billId} />

              <Select
                label="Metode Pembayaran"
                name="paymentMethod"
                defaultValue="CASH"
                options={[
                  { value: "CASH", label: "Tunai (Cash ke Pengurus)" },
                  { value: "TRANSFER", label: "Transfer Bank / QRIS RT" },
                ]}
              />

              <Input
                label="Catatan Tambahan (Opsional)"
                name="notes"
                placeholder="Contoh: Diterima oleh Bendahara"
              />

              <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-800">
                ⚡ Pembayaran ini akan otomatis masuk ke pembukuan Kas RT sebagai Pemasukan.
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1 font-semibold"
                  isLoading={isPending}
                >
                  Konfirmasi Lunas
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
