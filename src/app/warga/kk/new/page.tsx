"use client";

import React, { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createFamilyCard } from "@/server/actions/family-cards";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function NewFamilyCardPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
    const res = await createFamilyCard(prev, formData);
    if (res?.success && res.id) {
      router.push(`/warga/kk/${res.id}`);
    }
    return res;
  }, null);

  return (
    <MobileFrame>
      <TopBar
        title="Tambah Kartu Keluarga"
        subtitle="Formulir KK Baru RT 001"
        showBack
        backHref="/warga?tab=kk"
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
              label="Nomor Kartu Keluarga (16 Digit)"
              name="nomorKK"
              type="text"
              placeholder="Contoh: 3276011203050001"
              maxLength={16}
              required
              helperText="Pastikan nomor KK tepat 16 digit angka"
            />

            <Input
              label="Nama Kepala Keluarga"
              name="kepalaKeluarga"
              type="text"
              placeholder="Nama lengkap kepala keluarga"
              required
            />

            <Input
              label="Alamat Rumah / Jalan"
              name="alamat"
              type="text"
              placeholder="Contoh: Jl. Melati No. 12, RT 001/RW 005"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input label="RT" name="rt" defaultValue="001" required />
              <Input label="RW" name="rw" defaultValue="005" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Kelurahan" name="kelurahan" defaultValue="Sukamaju" required />
              <Input label="Kecamatan" name="kecamatan" defaultValue="Cilodong" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Kota / Kab." name="kota" defaultValue="Depok" required />
              <Input label="Provinsi" name="provinsi" defaultValue="Jawa Barat" required />
            </div>

            <Input
              label="Kode Pos (Opsional)"
              name="kodePos"
              type="text"
              placeholder="Contoh: 16415"
              maxLength={5}
            />

            <Select
              label="Status Kepemilikan Rumah"
              name="statusRumah"
              defaultValue="MILIK_SENDIRI"
              options={[
                { value: "MILIK_SENDIRI", label: "Milik Sendiri" },
                { value: "SEWA_KONTRAK", label: "Sewa / Kontrak" },
                { value: "KOST", label: "Kost" },
                { value: "LAINNYA", label: "Lainnya" },
              ]}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4 font-semibold"
              isLoading={isPending}
            >
              Simpan Kartu Keluarga
            </Button>
          </form>
        </Card>
      </div>
    </MobileFrame>
  );
}
