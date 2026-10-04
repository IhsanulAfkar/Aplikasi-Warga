"use client";

import React, { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createDuesType } from "@/server/actions/dues";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function NewDuesTypePage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
    const res = await createDuesType(prev, formData);
    if (res?.success) {
      router.push("/iuran?tab=types");
    }
    return res;
  }, null);

  return (
    <MobileFrame>
      <TopBar
        title="Tambah Tipe Iuran"
        subtitle="Konfigurasi Iuran Baru"
        showBack
        backHref="/iuran?tab=types"
        userRole="ADMIN"
      />

      <div className="flex-1 pb-12 px-4 pt-3 space-y-4">
        <Card className="p-4">
          <form action={formAction} className="space-y-3.5">
            {state?.error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {state.error}
              </div>
            )}

            <Input
              label="Nama Iuran"
              name="name"
              placeholder="Contoh: Iuran Kebersihan Lingkungan"
              required
            />

            <Input
              label="Kode Unik Iuran"
              name="code"
              placeholder="Contoh: KEBERSIHAN_2026"
              required
              helperText="Gunakan huruf kapital tanpa spasi"
            />

            <Input
              label="Nominal Dasar (Rp)"
              name="amount"
              type="number"
              placeholder="Contoh: 35000"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Frekuensi Penagihan"
                name="frequency"
                defaultValue="MONTHLY"
                options={[
                  { value: "MONTHLY", label: "Bulanan" },
                  { value: "ONCE", label: "Satu Kali (Insidental)" },
                  { value: "YEARLY", label: "Tahunan" },
                  { value: "CUSTOM", label: "Kustom" },
                ]}
              />

              <Select
                label="Target Pembayaran"
                name="targetType"
                defaultValue="PER_KK"
                options={[
                  { value: "PER_KK", label: "Per Kartu Keluarga" },
                  { value: "PER_RESIDENT", label: "Per Jiwa / Warga" },
                ]}
              />
            </div>

            <Input
              label="Deskripsi / Catatan Peruntukan"
              name="description"
              placeholder="Contoh: Pengangkutan sampah warga 3x seminggu"
            />

            <Button
              type="submit"

              size="lg"
              className="w-full mt-4 font-semibold"
              disabled={isPending}
            >
              Simpan Tipe Iuran
            </Button>
          </form>
        </Card>
      </div>
    </MobileFrame>
  );
}
