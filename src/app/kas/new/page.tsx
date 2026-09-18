"use client";

import React, { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { recordCashTransaction } from "@/server/actions/cash";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function NewCashTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");

  const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
    const res = await recordCashTransaction(prev, formData);
    if (res?.success) {
      router.push("/kas");
    }
    return res;
  }, null);

  const today = new Date().toISOString().split("T")[0];

  return (
    <MobileFrame>
      <TopBar
        title="Catat Transaksi Kas"
        subtitle="Pemasukan & Pengeluaran RT"
        showBack
        backHref="/kas"
        userRole="ADMIN"
      />

      <div className="flex-1 pb-12 px-4 pt-3 space-y-4">
        {/* Type Toggle */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setType("INCOME")}
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl transition-all ${
              type === "INCOME"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            + Pemasukan (Income)
          </button>
          <button
            type="button"
            onClick={() => setType("EXPENSE")}
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl transition-all ${
              type === "EXPENSE"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            - Pengeluaran (Expense)
          </button>
        </div>

        <Card className="p-4">
          <form action={formAction} className="space-y-3.5">
            {state?.error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {state.error}
              </div>
            )}

            <input type="hidden" name="type" value={type} />

            <Select
              label="Kategori Transaksi"
              name="category"
              defaultValue={type === "INCOME" ? "DONASI" : "OPERASIONAL"}
              options={
                type === "INCOME"
                  ? [
                      { value: "DONASI", label: "Donasi / Sumbangan Warga" },
                      { value: "IURAN_WARGA", label: "Iuran Warga Manual" },
                      { value: "LAINNYA", label: "Pemasukan Lainnya" },
                    ]
                  : [
                      { value: "OPERASIONAL", label: "Operasional & Gaji Petugas" },
                      { value: "PEMELIHARAAN", label: "Pemeliharaan & Perbaikan Sarana" },
                      { value: "KEGIATAN", label: "Kegiatan Lingkungan & Acara" },
                      { value: "LAINNYA", label: "Pengeluaran Lainnya" },
                    ]
              }
            />

            <Input
              label="Nominal Transaksi (Rp)"
              name="amount"
              type="number"
              placeholder="Contoh: 150000"
              required
            />

            <Input
              label="Tanggal Transaksi"
              name="transactionDate"
              type="date"
              defaultValue={today}
              required
            />

            <Input
              label="Keterangan / Rincian Penggunaan Dana"
              name="description"
              placeholder="Contoh: Pembelian lampu penerangan gang melati"
              required
            />

            <Button
              type="submit"
              variant={type === "INCOME" ? "primary" : "danger"}
              size="lg"
              className="w-full mt-4 font-semibold"
              isLoading={isPending}
            >
              Simpan {type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
            </Button>
          </form>
        </Card>
      </div>
    </MobileFrame>
  );
}
