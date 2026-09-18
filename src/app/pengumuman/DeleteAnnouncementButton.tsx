"use client";

import React, { useState } from "react";
import { deleteAnnouncement } from "@/server/actions/announcements";
import { Trash2 } from "lucide-react";

interface DeleteAnnouncementButtonProps {
  announcementId: string;
}

export function DeleteAnnouncementButton({
  announcementId,
}: DeleteAnnouncementButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) {
      try {
        setIsDeleting(true);
        await deleteAnnouncement(announcementId);
      } catch (err: any) {
        alert(err.message || "Gagal menghapus pengumuman");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 text-[11px]"
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span>Hapus</span>
    </button>
  );
}
