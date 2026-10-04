import React from "react";
import { requireAdmin } from "@/lib/permissions";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { NewKKWizard } from "./NewKKWizard";

export default async function NewFamilyCardPage() {
  await requireAdmin();

  return (
    <MobileFrame>
      <TopBar
        title="Pendaftaran KK Baru"
        subtitle="Pindai OCR & Formulir KK"
        showBack
        backHref="/warga?tab=kk"
        userRole="ADMIN"
      />

      <div className="flex-1 pb-16 px-4 pt-3 space-y-4">
        <NewKKWizard />
      </div>
    </MobileFrame>
  );
}
