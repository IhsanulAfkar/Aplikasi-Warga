import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAnnouncements } from "@/server/actions/announcements";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { BottomNav } from "@/components/mobile/BottomNav";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatShortDate } from "@/lib/formatters";
import { Megaphone, Calendar, ShieldCheck, AlertCircle } from "lucide-react";

export default async function WargaPengumumanPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const announcements = await getAnnouncements(true);

  return (
    <MobileFrame>
      <TopBar
        title="Pengumuman RT"
        subtitle="Kabar & Informasi Lingkungan"
        userRole="WARGA"
      />

      <div className="flex-1 pb-24 px-4 pt-3 space-y-3.5">
        {announcements.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="w-8 h-8 text-slate-400" />}
            title="Belum ada pengumuman"
            description="Pengurus RT belum mempublikasikan informasi atau pengumuman baru."
          />
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 bg-white rounded-3xl shadow-sm space-y-3 border transition-all ${
                ann.priority === "IMPORTANT"
                  ? "border-amber-300 ring-2 ring-amber-400/20"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ann.priority === "IMPORTANT" ? (
                    <Badge variant="danger" size="sm">
                      <AlertCircle className="w-3 h-3 mr-0.5" />
                      Penting
                    </Badge>
                  ) : (
                    <Badge variant="info" size="sm">
                      Informasi
                    </Badge>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  {formatShortDate(ann.publishDate)}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 whitespace-pre-line leading-relaxed">
                  {ann.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Pengurus RT 001</span>
                <span>Dibagikan ke seluruh warga</span>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav role="WARGA" />
    </MobileFrame>
  );
}
