"use client";

import React, { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createDuesPeriodAndBills } from "@/server/actions/dues";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface NewPeriodFormProps {
  duesTypes: { id: string; name: string; amount: number; targetType: string }[];
}

export function NewPeriodForm({ duesTypes }: NewPeriodFormProps) {
  const router = useRouter();
  const [selectedTypeId, setSelectedTypeId] = useState(duesTypes[0]?.id || "");
  const selectedType = duesTypes.find((t) => t.id === selectedTypeId) || duesTypes[0];
  const [amount, setAmount] = useState(selectedType?.amount?.toString() || "35000");

  const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
    const res = await createDuesPeriodAndBills(prev, formData);
    if (res?.success) {
      router.push("/iuran");
    }
    return res;
  }, null);

  const handleTypeChange = (id: string) => {
    setSelectedTypeId(id);
    const type = duesTypes.find((t) => t.id === id);
    if (type) {
      setAmount(type.amount.toString());
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Card className="p-4">
      <form action={formAction} className="space-y-3.5">
        {state?.error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {state.error}
          </div>
        )}

        <Select
          label="Pilih Tipe Iuran"
          name="duesTypeId"
          value={selectedTypeId}
          onChange={(e) => handleTypeChange(e.target.value)}
          required
        >
          {duesTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name} (Dasar: Rp {type.amount.toLocaleString("id-ID")})
            </option>
          ))}
        </Select>

        <Input
          label="Nama Periode Tagihan"
          name="periodName"
          placeholder="Contoh: April 2026 atau HUT RI 2026"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Bulan Tagihan"
            name="billingMonth"
            defaultValue={new Date().getMonth() + 1}
            options={[
              { value: "1", label: "Januari" },
              { value: "2", label: "Februari" },
              { value: "3", label: "Maret" },
              { value: "4", label: "April" },
              { value: "5", label: "Mei" },
              { value: "6", label: "Juni" },
              { value: "7", label: "Juli" },
              { value: "8", label: "Agustus" },
              { value: "9", label: "September" },
              { value: "10", label: "Oktober" },
              { value: "11", label: "November" },
              { value: "12", label: "Desember" },
            ]}
          />

          <Input
            label="Tahun Tagihan"
            name="billingYear"
            type="number"
            defaultValue={currentYear}
            required
          />
        </div>

        <Input
          label="Batas Jatuh Tempo"
          name="dueDate"
          type="date"
          required
        />

        <Input
          label="Nominal Tagihan Periode Ini (Rp)"
          name="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
          <p className="font-semibold">⚡ Otomatisasi Tagihan:</p>
          <p className="text-[11px] mt-0.5 text-blue-700">
            Sistem akan otomatis membuat tagihan individual untuk semua {selectedType?.targetType === "PER_KK" ? "Kartu Keluarga (KK)" : "Warga"} aktif di RT 001.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-4 font-semibold"
          isLoading={isPending}
        >
          Generate Tagihan Warga
        </Button>
      </form>
    </Card>
  );
}
