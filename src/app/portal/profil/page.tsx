import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { BottomNav } from "@/components/mobile/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, maskNIK, maskKK, RELATION_LABELS, HOUSE_STATUS_LABELS } from "@/lib/formatters";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { logoutAction } from "@/server/actions/auth";
import {
  User,
  Home,
  Shield,
  Phone,
  Briefcase,
  MapPin,
  KeyRound,
  LogOut,
  Users,
} from "lucide-react";

export default async function WargaProfilPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch full resident profile and family members
  let familyCard = null;
  if (user.familyCardId) {
    familyCard = await prisma.familyCard.findUnique({
      where: { id: user.familyCardId },
      include: {
        members: {
          orderBy: [
            { hubunganKeluarga: "asc" },
            { tanggalLahir: "asc" },
          ],
        },
      },
    });
  }

  return (
    <MobileFrame>
      <TopBar
        title="Profil Warga"
        subtitle="Data Diri & Keluarga Saya"
        userRole="WARGA"
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
              {user.nama ? user.nama.charAt(0).toUpperCase() : "W"}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {user.nama || user.username}
              </h2>
              <p className="text-xs text-slate-500">
                Username: @{user.username}
              </p>
            </div>
          </div>

          {user.resident && (
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">NIK Terdaftar</span>
                <span className="font-mono font-semibold text-slate-800">
                  {maskNIK(user.resident.nik)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Peran Keluarga</span>
                <span className="font-semibold text-slate-800">
                  {RELATION_LABELS[user.resident.hubunganKeluarga] || user.resident.hubunganKeluarga}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Pekerjaan</span>
                <span className="font-semibold text-slate-800">
                  {user.resident.pekerjaan || "-"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">No. Telepon / WA</span>
                <span className="font-semibold text-slate-800">
                  {user.resident.noTelepon || "-"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Family Card Section */}
        {familyCard && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Kartu Keluarga Saya ({familyCard.members.length} Anggota)
              </h3>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Kepala Keluarga: {familyCard.kepalaKeluarga}
                </p>
                <p className="text-[11px] font-mono text-slate-500">
                  No. KK: {maskKK(familyCard.nomorKK)}
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  {familyCard.alamat}, RT {familyCard.rt} / RW {familyCard.rw}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">
                  Daftar Anggota Keluarga:
                </p>
                {familyCard.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <span className="font-medium text-slate-800">
                        {member.nama}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1.5">
                        ({RELATION_LABELS[member.hubunganKeluarga] || member.hubunganKeluarga})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {maskNIK(member.nik)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Change Password Card */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Keamanan Akun
          </h3>
          <ChangePasswordForm />
        </div>

        {/* Logout Action */}
        <div className="pt-2">
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"

              className="w-full text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Aplikasi</span>
            </Button>
          </form>
        </div>
      </div>

      <BottomNav role="WARGA" />
    </MobileFrame>
  );
}
