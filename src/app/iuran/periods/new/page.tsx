import React from "react";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { NewPeriodForm } from "./NewPeriodForm";

export default async function NewPeriodPage() {
  await requireAdmin();

  const duesTypes = await prisma.duesType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <MobileFrame>
      <TopBar
        title="Buat Periode Tagihan"
        subtitle="Generate Tagihan Iuran Warga"
        showBack
        backHref="/iuran"
        userRole="ADMIN"
      />

      <div className="flex-1 pb-12 px-4 pt-3 space-y-4">
        <NewPeriodForm duesTypes={duesTypes} />
      </div>
    </MobileFrame>
  );
}
