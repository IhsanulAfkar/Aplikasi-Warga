import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/permissions";
import { getResidentById } from "@/server/actions/residents";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, RELATION_LABELS } from "@/lib/formatters";
import { CreateAccountCard } from "./CreateAccountCard";
import {
  User,
  Home,
  Phone,
  Briefcase,
  Calendar,
  KeyRound,
  ShieldCheck,
  MapPin,
} from "lucide-react";

interface ResidentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResidentDetailPage({ params }: ResidentDetailPageProps) {
  await requireAdmin();
  const { id } = await params;
  const resident = await getResidentById(id);

  if (!resident) {
    notFound();
  }

  return (
    <MobileFrame>
      <TopBar
        title="Detail Warga"
        subtitle={resident.nama}
        showBack
        backHref="/warga?tab=resident"
        userRole="ADMIN"
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-slate-900">
                  {resident.nama}
                </h2>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${resident.jenisKelamin === "LAKI-LAKI"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-pink-100 text-pink-700"
                    }`}
                >
                  {resident.jenisKelamin === "LAKI-LAKI" ? "Laki-Laki" : "Perempuan"}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                NIK: {resident.nik}
              </p>
            </div>

            <Badge
              variant={
                resident.statusWarga === "AKTIF"
                  ? "success"
                  : resident.statusWarga === "PINDAH"
                    ? "warning"
                    : "danger"
              }

            >
              {resident.statusWarga}
            </Badge>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">
                Hubungan Keluarga
              </span>
              <span className="font-semibold text-slate-800">
                {RELATION_LABELS[resident.hubunganKeluarga] || resident.hubunganKeluarga}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">
                Status Perkawinan
              </span>
              <span className="font-semibold text-slate-800">
                {resident.statusPerkawinan.replace("_", " ")}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">
                Tempat, Tgl Lahir
              </span>
              <span className="font-semibold text-slate-800">
                {resident.tempatLahir}, {formatDate(resident.tanggalLahir)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Agama</span>
              <span className="font-semibold text-slate-800">
                {resident.agama || "-"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Pekerjaan</span>
              <span className="font-semibold text-slate-800">
                {resident.pekerjaan || "Belum Bekerja"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">No. Telepon / WA</span>
              <span className="font-semibold text-slate-800">
                {resident.noTelepon || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Linked KK Card */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Kartu Keluarga
          </h3>
          <Link href={`/warga/kk/${resident.familyCardId}`}>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 active:scale-[0.99] transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    KK: {resident.familyCard.kepalaKeluarga}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-500">
                    {resident.familyCard.nomorKK}
                  </p>
                </div>
              </div>
              <Badge variant="outline" size="sm">
                Lihat KK
              </Badge>
            </div>
          </Link>
        </div>

        {/* Login Account Card */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Akses Login Aplikasi
          </h3>

          {resident.user ? (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    Akun Login Aktif
                  </p>
                  <p className="text-[11px] font-mono text-emerald-700">
                    Username: @{resident.user.username}
                  </p>
                </div>
              </div>
              <Badge variant="success" size="sm">
                Terdaftar
              </Badge>
            </div>
          ) : (
            <CreateAccountCard residentId={resident.id} residentName={resident.nama} />
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
