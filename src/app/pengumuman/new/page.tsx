"use client";

import React, { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement } from "@/server/actions/announcements";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
    const res = await createAnnouncement(prev, formData);
    if (res?.success) {
      router.push("/pengumuman");
    }
    return res;
  }, null);

  return (
    <MobileFrame>
      <TopBar
        title="Buat Pengumuman"
        subtitle="Siarkan Informasi ke Warga"
        showBack
        backHref="/pengumuman"
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
              label="Judul Pengumuman"
              name="title"
              placeholder="Contoh: Jadwal Kerja Bakti Bersama & Fogging"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Tingkat Prioritas"
                name="priority"
                defaultValue="NORMAL"
                options={[
                  { value: "NORMAL", label: "Normal (Informasi Rutin)" },
                  { value: "IMPORTANT", label: "Penting (Mendesak/Wajib)" },
                ]}
              />

              <Select
                label="Status Publikasi"
                name="status"
                defaultValue="PUBLISHED"
                options={[
                  { value: "PUBLISHED", label: "Langsung Terbit" },
                  { value: "DRAFT", label: "Simpan Draft" },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Isi Pengumuman Lengkap <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="content"
                rows={5}
                required
                placeholder="Tuliskan isi pengumuman, lokasi, waktu, dan instruksi jelas untuk warga..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              ></textarea>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4 font-semibold"
              isLoading={isPending}
            >
              Publikasikan Pengumuman
            </Button>
          </form>
        </Card>
      </div>
    </MobileFrame>
  );
}
