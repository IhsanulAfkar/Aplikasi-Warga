"use client";

import React, { useActionState, useState } from "react";
import { createWargaAccountAction } from "@/server/actions/residents";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, ShieldAlert } from "lucide-react";

interface CreateAccountCardProps {
  residentId: string;
  residentName: string;
}

export function CreateAccountCard({ residentId, residentName }: CreateAccountCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createWargaAccountAction, null);

  if (!isOpen) {
    return (
      <div className="p-3.5 bg-slate-100/80 border border-slate-200 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Belum Memiliki Akun Login
            </p>
            <p className="text-[10px] text-slate-500">
              Buatkan username & password untuk warga ini
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => setIsOpen(true)}
        >
          Buat Akun
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-4 border-blue-200 bg-blue-50/40">
      <form action={formAction} className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-blue-900">
            Buat Akun Login ({residentName})
          </h4>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-[11px] text-slate-400 hover:text-slate-600"
          >
            Batal
          </button>
        </div>

        {state?.error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
            {state.success}
          </div>
        )}

        <input type="hidden" name="residentId" value={residentId} />

        <Input
          label="Username Baru"
          name="username"
          placeholder="contoh: budi_santoso"
          required
        />

        <Input
          label="Password Awal"
          name="password"
          type="password"
          placeholder="Minimal 6 karakter"
          required
        />

        <Button
          type="submit"

          size="sm"
          className="w-full mt-2 font-semibold"
          disabled={isPending}
        >
          Buat Akun Sekarang
        </Button>
      </form>
    </Card>
  );
}
