"use client";

import React, { useActionState, useState } from "react";
import { loginAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Building2, Lock, User as UserIcon, ShieldCheck, Home } from "lucide-react";
import { MobileFrame } from "@/components/mobile/MobileFrame";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-blue-50/70 via-white to-slate-50">
        {/* Header Branding */}
        <div className="pt-8 pb-4 text-center space-y-3">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 text-white animate-in zoom-in-50 duration-300">
            <Building2 className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              WargaKu RT 001
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sistem Informasi & Pengelolaan Lingkungan RT 001 / RW 005
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="my-auto py-4">
          <Card className="border-slate-200/90 shadow-xl shadow-slate-200/50 bg-white/95 backdrop-blur">
            <form action={formAction} className="space-y-4">
              <div className="text-center pb-1">
                <h2 className="text-base font-semibold text-slate-800">
                  Masuk ke Akun
                </h2>
                <p className="text-xs text-slate-400">
                  Gunakan akun pengurus atau akun warga Anda
                </p>
              </div>

              {state?.error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>{state.error}</span>
                </div>
              )}

              <Input
                label="Username"
                name="username"
                type="text"
                placeholder="Masukkan username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
                autoComplete="username"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Masukkan password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 font-semibold"
                isLoading={isPending}
              >
                Masuk Sekarang
              </Button>
            </form>
          </Card>

          {/* Quick Demo Credentials for Reviewers */}
          <div className="mt-6 space-y-2.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              ⚡ Akun Demo Siap Pakai:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin", "admin123")}
                className="p-2.5 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl text-left transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin RT</span>
                </div>
                <p className="text-[10px] text-amber-700 font-mono mt-0.5">
                  admin / admin123
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("budi", "warga123")}
                className="p-2.5 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl text-left transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-1.5 text-blue-900 font-semibold text-xs">
                  <Home className="w-3.5 h-3.5 text-blue-600" />
                  <span>Warga (Budi)</span>
                </div>
                <p className="text-[10px] text-blue-700 font-mono mt-0.5">
                  budi / warga123
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-2">
          <p className="text-[11px] text-slate-400">
            Lingkungan Aman, Nyaman, dan Transparan
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}
