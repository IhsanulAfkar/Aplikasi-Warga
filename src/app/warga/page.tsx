import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/permissions";
import { getFamilyCards } from "@/server/actions/family-cards";
import { getResidents } from "@/server/actions/residents";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { BottomNav } from "@/components/mobile/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatShortDate, RELATION_LABELS, HOUSE_STATUS_LABELS } from "@/lib/formatters";
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  UserPlus,
  Home,
  User,
  Shield,
} from "lucide-react";

interface WargaPageProps {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    status?: string;
  }>;
}

export default async function WargaManagementPage({ searchParams }: WargaPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const activeTab = params.tab || "kk";
  const query = params.q || "";
  const status = params.status || "ALL";

  const [familyCards, residents] = await Promise.all([
    activeTab === "kk" ? getFamilyCards(query, status) : Promise.resolve([]),
    activeTab === "resident" ? getResidents(query, status) : Promise.resolve([]),
  ]);

  return (
    <MobileFrame>
      <TopBar
        title="Pendataan Warga"
        subtitle="Data KK & KTP Lingkungan RT 001"
        userRole="ADMIN"
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-3">
        {/* Tab Switcher */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl">
          <Link
            href="/warga?tab=kk"
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === "kk"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Kartu Keluarga (KK)</span>
          </Link>

          <Link
            href="/warga?tab=resident"
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === "resident"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Data Warga (NIK)</span>
          </Link>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-2">
          <form method="GET" className="flex-1 relative">
            <input type="hidden" name="tab" value={activeTab} />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder={
                activeTab === "kk"
                  ? "Cari No. KK, Kepala Keluarga, Alamat..."
                  : "Cari NIK, Nama, No. KK..."
              }
              className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </form>

          <Link
            href={activeTab === "kk" ? "/warga/kk/new" : "/warga/resident/new"}
            className="h-10 px-3.5 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 active:scale-95 shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === "kk" ? "Tambah KK" : "Tambah Warga"}</span>
          </Link>
        </div>

        {/* Tab 1: Kartu Keluarga List */}
        {activeTab === "kk" && (
          <div className="space-y-2.5">
            {familyCards.length === 0 ? (
              <EmptyState
                icon={<Home className="w-8 h-8 text-slate-400" />}
                title="Belum ada data Kartu Keluarga"
                description={
                  query
                    ? "Tidak ditemukan data yang sesuai dengan pencarian."
                    : "Mulai daftarkan Kartu Keluarga pertama di lingkungan RT 001."
                }
              />
            ) : (
              familyCards.map((kk) => (
                <Link key={kk.id} href={`/warga/kk/${kk.id}`} className="block">
                  <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 active:scale-[0.99] transition-all space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-900">
                            {kk.kepalaKeluarga}
                          </h3>
                          {!kk.isActive && (
                            <Badge variant="danger" size="sm">
                              Nonaktif
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                          No. KK: {kk.nomorKK}
                        </p>
                      </div>
                      <Badge variant="info" size="sm">
                        {kk._count.members} Anggota
                      </Badge>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                      <p className="truncate">{kk.alamat}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>
                          Status: {HOUSE_STATUS_LABELS[kk.statusRumah || ""] || kk.statusRumah || "-"}
                        </span>
                        <span className="flex items-center text-blue-600 font-medium">
                          Lihat Detail <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Resident List */}
        {activeTab === "resident" && (
          <div className="space-y-2.5">
            {residents.length === 0 ? (
              <EmptyState
                icon={<User className="w-8 h-8 text-slate-400" />}
                title="Belum ada data Warga"
                description="Mulai daftarkan data warga atau NIK penduduk RT 001."
              />
            ) : (
              residents.map((r) => (
                <Link key={r.id} href={`/warga/resident/${r.id}`} className="block">
                  <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 active:scale-[0.99] transition-all space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-slate-900">
                            {r.nama}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${r.jenisKelamin === "LAKI-LAKI"
                                ? "bg-sky-100 text-sky-700"
                                : "bg-pink-100 text-pink-700"
                              }`}
                          >
                            {r.jenisKelamin}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                          NIK: {r.nik}
                        </p>
                      </div>

                      <Badge
                        variant={
                          r.statusWarga === "AKTIF"
                            ? "success"
                            : r.statusWarga === "PINDAH"
                              ? "warning"
                              : "danger"
                        }
                        size="sm"
                      >
                        {r.statusWarga}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
                      <div>
                        <span className="font-medium text-slate-700">
                          {RELATION_LABELS[r.hubunganKeluarga] || r.hubunganKeluarga}
                        </span>
                        <span className="text-slate-400 text-[10px] block">
                          KK: {r.familyCard.kepalaKeluarga}
                        </span>
                      </div>

                      <span className="flex items-center text-blue-600 font-medium text-[10px]">
                        Detail <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNav role="ADMIN" />
    </MobileFrame>
  );
}
