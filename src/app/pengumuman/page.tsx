import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/permissions";
import { getAnnouncements, deleteAnnouncement } from "@/server/actions/announcements";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { BottomNav } from "@/components/mobile/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatShortDate } from "@/lib/formatters";
import { DeleteAnnouncementButton } from "./DeleteAnnouncementButton";
import {
  Megaphone,
  Plus,
  Calendar,
  AlertCircle,
  Clock,
  Trash2,
} from "lucide-react";

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  const announcements = await getAnnouncements(false);

  return (
    <MobileFrame>
      <TopBar
        title="Pengumuman RT"
        subtitle="Informasi & Berita Lingkungan"
        userRole="ADMIN"
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Daftar Pengumuman ({announcements.length})
            </h2>
          </div>

          <Link
            href="/pengumuman/new"
            className="h-9 px-3 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 active:scale-95 shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Pengumuman Baru</span>
          </Link>
        </div>

        <div className="space-y-3">
          {announcements.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="w-8 h-8 text-slate-400" />}
              title="Belum ada pengumuman"
              description="Buat pengumuman pertama untuk menyampaikan kabar atau kegiatan ke warga."
              action={
                <Link href="/pengumuman/new">
                  <span className="text-xs font-semibold text-blue-600 hover:underline">
                    + Buat Pengumuman
                  </span>
                </Link>
              }
            />
          ) : (
            announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2.5 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ann.priority === "IMPORTANT" ? (
                      <Badge variant="danger" size="sm">
                        Penting
                      </Badge>
                    ) : (
                      <Badge variant="info" size="sm">
                        Normal
                      </Badge>
                    )}

                    <Badge
                      variant={ann.status === "PUBLISHED" ? "success" : "secondary"}
                      size="sm"
                    >
                      {ann.status === "PUBLISHED" ? "Terbit" : "Draft"}
                    </Badge>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {formatShortDate(ann.publishDate)}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 whitespace-pre-line leading-relaxed">
                    {ann.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Dibuat oleh: @{ann.author.username}</span>

                  <DeleteAnnouncementButton announcementId={ann.id} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav role="ADMIN" />
    </MobileFrame>
  );
}
