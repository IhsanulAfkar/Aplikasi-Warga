"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/permissions";

const familyCardSchema = z.object({
  nomorKK: z
    .string()
    .length(16, "Nomor KK harus tepat 16 digit angka")
    .regex(/^\d+$/, "Nomor KK hanya boleh berisi angka"),
  kepalaKeluarga: z.string().min(2, "Nama Kepala Keluarga wajib diisi"),
  alamat: z.string().min(3, "Alamat wajib diisi"),
  rt: z.string().default("001"),
  rw: z.string().default("005"),
  kelurahan: z.string().default("Sukamaju"),
  kecamatan: z.string().default("Cilodong"),
  kota: z.string().default("Depok"),
  provinsi: z.string().default("Jawa Barat"),
  kodePos: z.string().optional().nullable(),
  statusRumah: z.string().default("MILIK_SENDIRI"),
});

export async function getFamilyCards(searchQuery?: string, statusFilter?: string) {
  await requireAdmin();

  const whereClause: any = {};

  if (statusFilter === "active") {
    whereClause.isActive = true;
  } else if (statusFilter === "inactive") {
    whereClause.isActive = false;
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.trim();
    whereClause.OR = [
      { nomorKK: { contains: q } },
      { kepalaKeluarga: { contains: q } },
      { alamat: { contains: q } },
    ];
  }

  return prisma.familyCard.findMany({
    where: whereClause,
    include: {
      members: {
        where: { statusWarga: "AKTIF" },
        select: { id: true, nama: true, hubunganKeluarga: true, jenisKelamin: true },
      },
      _count: {
        select: { members: true, duesBills: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFamilyCardById(id: string) {
  const user = await requireAuth();

  const kk = await prisma.familyCard.findUnique({
    where: { id },
    include: {
      members: {
        orderBy: [
          { hubunganKeluarga: "asc" },
          { tanggalLahir: "asc" },
        ],
        include: {
          user: {
            select: { id: true, username: true },
          },
        },
      },
      duesBills: {
        include: {
          period: {
            include: { duesType: true },
          },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!kk) return null;

  // Authorization check: Admin can view any KK; Warga can only view their own KK
  if (user.role === "WARGA") {
    if (user.familyCardId !== kk.id) {
      throw new Error("Akses ditolak: Anda hanya dapat melihat data KK keluarga Anda.");
    }
  }

  return kk;
}

export async function createFamilyCard(prevState: any, formData: FormData) {
  await requireAdmin();

  const rawData = {
    nomorKK: formData.get("nomorKK") as string,
    kepalaKeluarga: formData.get("kepalaKeluarga") as string,
    alamat: formData.get("alamat") as string,
    rt: (formData.get("rt") as string) || "001",
    rw: (formData.get("rw") as string) || "005",
    kelurahan: (formData.get("kelurahan") as string) || "Sukamaju",
    kecamatan: (formData.get("kecamatan") as string) || "Cilodong",
    kota: (formData.get("kota") as string) || "Depok",
    provinsi: (formData.get("provinsi") as string) || "Jawa Barat",
    kodePos: (formData.get("kodePos") as string) || null,
    statusRumah: (formData.get("statusRumah") as string) || "MILIK_SENDIRI",
  };

  const parsed = familyCardSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  try {
    const existing = await prisma.familyCard.findUnique({
      where: { nomorKK: parsed.data.nomorKK },
    });

    if (existing) {
      return { error: `Nomor KK ${parsed.data.nomorKK} sudah terdaftar di sistem` };
    }

    const newKK = await prisma.familyCard.create({
      data: parsed.data,
    });

    revalidatePath("/warga");
    return { success: "Kartu Keluarga berhasil didaftarkan", id: newKK.id };
  } catch (err: any) {
    console.error("Create KK error:", err);
    return { error: "Gagal menyimpan Kartu Keluarga. Silakan coba lagi." };
  }
}

export async function updateFamilyCard(id: string, prevState: any, formData: FormData) {
  await requireAdmin();

  const rawData = {
    nomorKK: formData.get("nomorKK") as string,
    kepalaKeluarga: formData.get("kepalaKeluarga") as string,
    alamat: formData.get("alamat") as string,
    rt: (formData.get("rt") as string) || "001",
    rw: (formData.get("rw") as string) || "005",
    kelurahan: (formData.get("kelurahan") as string) || "Sukamaju",
    kecamatan: (formData.get("kecamatan") as string) || "Cilodong",
    kota: (formData.get("kota") as string) || "Depok",
    provinsi: (formData.get("provinsi") as string) || "Jawa Barat",
    kodePos: (formData.get("kodePos") as string) || null,
    statusRumah: (formData.get("statusRumah") as string) || "MILIK_SENDIRI",
  };

  const parsed = familyCardSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  try {
    const existing = await prisma.familyCard.findFirst({
      where: {
        nomorKK: parsed.data.nomorKK,
        NOT: { id },
      },
    });

    if (existing) {
      return { error: `Nomor KK ${parsed.data.nomorKK} telah digunakan oleh KK lain.` };
    }

    await prisma.familyCard.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/warga");
    revalidatePath(`/warga/kk/${id}`);
    return { success: "Data Kartu Keluarga berhasil diperbarui" };
  } catch (err: any) {
    console.error("Update KK error:", err);
    return { error: "Gagal memperbarui Kartu Keluarga." };
  }
}

export async function toggleFamilyCardStatus(id: string) {
  await requireAdmin();

  const kk = await prisma.familyCard.findUnique({ where: { id } });
  if (!kk) throw new Error("Data KK tidak ditemukan");

  const newStatus = !kk.isActive;
  await prisma.familyCard.update({
    where: { id },
    data: { isActive: newStatus },
  });

  revalidatePath("/warga");
  revalidatePath(`/warga/kk/${id}`);
  return { success: `Status KK berhasil diubah menjadi ${newStatus ? "Aktif" : "Nonaktif"}` };
}
