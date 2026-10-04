"use client";

import React, { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createResident } from "@/server/actions/residents";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface NewResidentFormProps {
  familyCards: { id: string; nomorKK: string; kepalaKeluarga: string }[];
  defaultFamilyCardId?: string;
}

export function NewResidentForm({
  familyCards,
  defaultFamilyCardId,
}: NewResidentFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
    const res = await createResident(prev, formData);
    if (res?.success && res.id) {
      router.push(`/warga/resident/${res.id}`);
    }
    return res;
  }, null);

  return (
    <Card className="p-4">
      <form action={formAction} className="space-y-3.5">
        {state?.error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {state.error}
          </div>
        )}

        <Select
          label="Pilih Kartu Keluarga (KK)"
          name="familyCardId"
          defaultValue={defaultFamilyCardId || familyCards[0]?.id || ""}
          required
        >
          {familyCards.map((kk) => (
            <option key={kk.id} value={kk.id}>
              {kk.kepalaKeluarga} ({kk.nomorKK})
            </option>
          ))}
        </Select>

        <Input
          label="Nomor Induk Kependudukan (NIK - 16 Digit)"
          name="nik"
          type="text"
          placeholder="Contoh: 3276011203850001"
          maxLength={16}
          required
        />

        <Input
          label="Nama Lengkap Sesuai KTP"
          name="nama"
          type="text"
          placeholder="Nama lengkap"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Hubungan Keluarga"
            name="hubunganKeluarga"
            defaultValue="KEPALA_KELUARGA"
            options={[
              { value: "KEPALA_KELUARGA", label: "Kepala Keluarga" },
              { value: "ISTRI", label: "Istri" },
              { value: "ANAK", label: "Anak" },
              { value: "ORANG_TUA", label: "Orang Tua" },
              { value: "FAMILI_LAIN", label: "Famili Lain" },
            ]}
          />

          <Select
            label="Jenis Kelamin"
            name="jenisKelamin"
            defaultValue="L"
            options={[
              { value: "L", label: "Laki-Laki (L)" },
              { value: "P", label: "Perempuan (P)" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tempat Lahir"
            name="tempatLahir"
            placeholder="Kota lahir"
            required
          />

          <Input
            label="Tanggal Lahir"
            name="tanggalLahir"
            type="date"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Agama"
            name="agama"
            defaultValue="ISLAM"
            options={[
              { value: "ISLAM", label: "Islam" },
              { value: "KRISTEN", label: "Kristen" },
              { value: "KATOLIK", label: "Katolik" },
              { value: "HINDU", label: "Hindu" },
              { value: "BUDDHA", label: "Buddha" },
              { value: "KONGHUCU", label: "Konghucu" },
            ]}
          />

          <Select
            label="Status Perkawinan"
            name="statusPerkawinan"
            defaultValue="BELUM_KAWIN"
            options={[
              { value: "BELUM_KAWIN", label: "Belum Kawin" },
              { value: "KAWIN", label: "Kawin" },
              { value: "CERAI_HIDUP", label: "Cerai Hidup" },
              { value: "CERAI_MATI", label: "Cerai Mati" },
            ]}
          />
        </div>

        <Input
          label="Pekerjaan"
          name="pekerjaan"
          type="text"
          placeholder="Contoh: Karyawan Swasta, Guru, Wiraswasta"
        />

        <Input
          label="Nomor WhatsApp / Telepon"
          name="noTelepon"
          type="tel"
          placeholder="Contoh: 081234567890"
        />

        <Select
          label="Status Kependudukan"
          name="statusWarga"
          defaultValue="AKTIF"
          options={[
            { value: "AKTIF", label: "Aktif (Menetap)" },
            { value: "PINDAH", label: "Pindah Domisili" },
            { value: "MENINGGAL", label: "Meninggal Dunia" },
          ]}
        />

        <Button
          type="submit"

          size="lg"
          className="w-full mt-4 font-semibold"
          disabled={isPending}
        >
          Simpan Data Warga
        </Button>
      </form>
    </Card>
  );
}
