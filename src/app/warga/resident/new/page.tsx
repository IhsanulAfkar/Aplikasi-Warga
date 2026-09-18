import React from "react";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { MobileFrame } from "@/components/mobile/MobileFrame";
import { TopBar } from "@/components/mobile/TopBar";
import { NewResidentForm } from "./NewResidentForm";

interface NewResidentPageProps {
  searchParams: Promise<{ familyCardId?: string }>;
}

export default async function NewResidentPage({ searchParams }: NewResidentPageProps) {
  await requireAdmin();
  const { familyCardId } = await searchParams;

  const familyCards = await prisma.familyCard.findMany({
    where: { isActive: true },
    select: { id: true, nomorKK: true, kepalaKeluarga: true },
    orderBy: { kepalaKeluarga: "asc" },
  });

  return (
    <MobileFrame>
      <TopBar
        title="Tambah Data Warga"
        subtitle="Formulir Warga / NIK Baru"
        showBack
        backHref="/warga?tab=resident"
      />

      <div className="flex-1 pb-12 px-4 pt-3 space-y-4">
        <NewResidentForm
          familyCards={familyCards}
          defaultFamilyCardId={familyCardId}
        />
      </div>
    </MobileFrame>
  );
}
