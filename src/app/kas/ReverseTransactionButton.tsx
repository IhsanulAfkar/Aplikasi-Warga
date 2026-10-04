"use client";

import React, { useState } from "react";
import { reverseCashTransaction } from "@/server/actions/cash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Undo2, X } from "lucide-react";

interface ReverseTransactionButtonProps {
  transactionId: string;
}

export function ReverseTransactionButton({ transactionId }: ReverseTransactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReverse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Alasan pembatalan wajib diisi");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await reverseCashTransaction(transactionId, reason);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "Gagal membatalkan transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-[10px] text-rose-500 hover:text-rose-700 flex items-center gap-0.5"
      >
        <Undo2 className="w-3 h-3" />
        <span>Koreksi / Batalkan</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-[400px] bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Batalkan Transaksi Kas
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Transaksi yang dibatalkan tidak akan dihitung dalam total saldo kas RT.
        </p>

        <form onSubmit={handleReverse} className="space-y-3">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <Input
            label="Alasan Pembatalan / Koreksi"
            placeholder="Contoh: Salah input nominal / Duplikasi transaksi"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"

              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="destructive"

              className="flex-1 font-semibold"
              disabled={isLoading}
            >
              Ya, Batalkan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
