import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/permissions";
import { getFamilyCardById, toggleFamilyCardStatus } from "@/server/actions/family-cards";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatShortDate, RELATION_LABELS, HOUSE_STATUS_LABELS } from "@/lib/formatters";
import {
  Users,
  UserPlus,
  Home,
  MapPin,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface KKDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function KKDetailPage({ params }: KKDetailPageProps) {
  const user = await requireAuth();
  const { id } = await params;
  const kk = await getFamilyCardById(id);

  if (!kk) {
    notFound();
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <MobileFrame>
      <TopBar
        title="Detail Kartu Keluarga"
        subtitle={`No. KK: ${kk.nomorKK}`}
        showBack
        backHref={isAdmin ? "/warga?tab=kk" : "/portal/profil"}
        userRole={user.role}
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
        {/* KK Overview Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {kk.kepalaKeluarga}
                </h2>
                {!kk.isActive && (
                  <Badge variant="danger" size="sm">
                    Nonaktif
                  </Badge>
                )}
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                No. KK: {kk.nomorKK}
              </p>
            </div>
            <Badge variant="info" size="md">
              {kk.members.length} Anggota
            </Badge>
          </div>

          <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                {kk.alamat}, RT {kk.rt} / RW {kk.rw}, Kel. {kk.kelurahan}, Kec.{" "}
                {kk.kecamatan}, {kk.kota} {kk.kodePos || ""}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>
                Status Rumah:{" "}
                <strong className="text-slate-800">
                  {HOUSE_STATUS_LABELS[kk.statusRumah || ""] || kk.statusRumah}
                </strong>
              </span>
              <span>Terdaftar: {formatShortDate(kk.createdAt)}</span>
            </div>
          </div>

          {isAdmin && (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <form
                action={async () => {
                  "use server";
                  await toggleFamilyCardStatus(kk.id);
                }}
                className="flex-1"
              >
                <Button
                  type="submit"
                  variant={kk.isActive ? "outline" : "primary"}
                  size="sm"
                  className="w-full text-xs"
                >
                  {kk.isActive ? "Nonaktifkan KK" : "Aktifkan KK"}
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Anggota Keluarga Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Anggota Keluarga ({kk.members.length})
            </h3>
            {isAdmin && (
              <Link
                href={`/warga/resident/new?familyCardId=${kk.id}`}
                className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Anggota</span>
              </Link>
            )}
          </div>

          <div className="space-y-2">
            {kk.members.map((member) => (
              <Link
                key={member.id}
                href={isAdmin ? `/warga/resident/${member.id}` : "#"}
                className={`block p-3 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all ${
                  isAdmin ? "hover:border-blue-400 active:scale-[0.99]" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        {member.nama}
                      </h4>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          member.jenisKelamin === "L"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        {member.jenisKelamin}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      NIK: {member.nik}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {RELATION_LABELS[member.hubunganKeluarga] || member.hubunganKeluarga} • {member.pekerjaan || "Belum bekerja"}
                    </p>
                  </div>

                  {isAdmin && (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
