"use client";

import React, { useActionState, useState } from "react";
import { changePasswordAction } from "@/server/actions/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(changePasswordAction, null);

  if (!isOpen) {
    return (
      <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Ganti Password Akun
            </p>
            <p className="text-[10px] text-slate-400">
              Perbarui kata sandi untuk keamanan akun
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
          Ubah
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between pb-1">
        <h4 className="text-xs font-bold text-slate-900">Perbarui Password</h4>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-[11px] text-slate-400 hover:text-slate-600"
        >
          Tutup
        </button>
      </div>

      <form action={formAction} className="space-y-3">
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

        <Input
          label="Password Saat Ini"
          name="oldPassword"
          type="password"
          placeholder="Masukkan password lama"
          required
        />

        <Input
          label="Password Baru"
          name="newPassword"
          type="password"
          placeholder="Minimal 6 karakter"
          required
        />

        <Input
          label="Konfirmasi Password Baru"
          name="confirmPassword"
          type="password"
          placeholder="Ulangi password baru"
          required
        />

        <Button
          type="submit"

          size="sm"
          className="w-full mt-2 font-semibold"
          disabled={isPending}
        >
          Simpan Password Baru
        </Button>
      </form>
    </Card>
  );
}
