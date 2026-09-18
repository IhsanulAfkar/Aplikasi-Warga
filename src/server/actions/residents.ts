"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/permissions";

const residentSchema = z.object({
  nik: z
    .string()
    .length(16, "NIK harus tepat 16 digit angka")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka"),
  nama: z.string().min(2, "Nama lengkap wajib diisi"),
  familyCardId: z.string().min(1, "Kartu Keluarga wajib dipilih"),
  hubunganKeluarga: z.string().default("KEPALA_KELUARGA"),
  jenisKelamin: z.enum(["L", "P"], { required_error: "Jenis kelamin wajib dipilih" }),
  tempatLahir: z.string().min(2, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  agama: z.string().default("ISLAM"),
  statusPerkawinan: z.string().default("BELUM_KAWIN"),
  pekerjaan: z.string().optional().nullable(),
  noTelepon: z.string().optional().nullable(),
  statusWarga: z.string().default("AKTIF"),
});

export async function getResidents(searchQuery?: string, statusFilter?: string, familyCardId?: string) {
  await requireAdmin();

  const whereClause: any = {};

  if (familyCardId) {
    whereClause.familyCardId = familyCardId;
  }

  if (statusFilter && statusFilter !== "ALL") {
    whereClause.statusWarga = statusFilter;
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.trim();
    whereClause.OR = [
      { nik: { contains: q } },
      { nama: { contains: q } },
      { pekerjaan: { contains: q } },
      { familyCard: { nomorKK: { contains: q } } },
      { familyCard: { kepalaKeluarga: { contains: q } } },
    ];
  }

  return prisma.resident.findMany({
    where: whereClause,
    include: {
      familyCard: {
        select: { id: true, nomorKK: true, kepalaKeluarga: true, alamat: true },
      },
      user: {
        select: { id: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getResidentById(id: string) {
  const user = await requireAuth();

  const resident = await prisma.resident.findUnique({
    where: { id },
    include: {
      familyCard: {
        include: {
          members: true,
        },
      },
      user: {
        select: { id: true, username: true, role: true },
      },
      duesBills: {
        include: {
          period: {
            include: { duesType: true },
          },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!resident) return null;

  // Authorization check: Admin can view anyone. Warga can only view members of their own FamilyCard
  if (user.role === "WARGA") {
    if (user.familyCardId !== resident.familyCardId && user.residentId !== resident.id) {
      throw new Error("Akses ditolak: Anda hanya dapat melihat data anggota keluarga Anda.");
    }
  }

  return resident;
}

export async function createResident(prevState: any, formData: FormData) {
  await requireAdmin();

  const rawData = {
    nik: formData.get("nik") as string,
    nama: formData.get("nama") as string,
    familyCardId: formData.get("familyCardId") as string,
    hubunganKeluarga: (formData.get("hubunganKeluarga") as string) || "KEPALA_KELUARGA",
    jenisKelamin: (formData.get("jenisKelamin") as any) || "L",
    tempatLahir: formData.get("tempatLahir") as string,
    tanggalLahir: formData.get("tanggalLahir") as string,
    agama: (formData.get("agama") as string) || "ISLAM",
    statusPerkawinan: (formData.get("statusPerkawinan") as string) || "BELUM_KAWIN",
    pekerjaan: (formData.get("pekerjaan") as string) || null,
    noTelepon: (formData.get("noTelepon") as string) || null,
    statusWarga: (formData.get("statusWarga") as string) || "AKTIF",
  };

  const parsed = residentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  try {
    const existing = await prisma.resident.findUnique({
      where: { nik: parsed.data.nik },
    });

    if (existing) {
      return { error: `NIK ${parsed.data.nik} sudah terdaftar di sistem` };
    }

    const newResident = await prisma.resident.create({
      data: {
        ...parsed.data,
        tanggalLahir: new Date(parsed.data.tanggalLahir),
      },
    });

    revalidatePath("/warga");
    revalidatePath(`/warga/kk/${parsed.data.familyCardId}`);
    return { success: "Data Warga berhasil ditambahkan", id: newResident.id };
  } catch (err: any) {
    console.error("Create Resident error:", err);
    return { error: "Gagal menyimpan data warga." };
  }
}

export async function updateResident(id: string, prevState: any, formData: FormData) {
  await requireAdmin();

  const rawData = {
    nik: formData.get("nik") as string,
    nama: formData.get("nama") as string,
    familyCardId: formData.get("familyCardId") as string,
    hubunganKeluarga: (formData.get("hubunganKeluarga") as string) || "KEPALA_KELUARGA",
    jenisKelamin: (formData.get("jenisKelamin") as any) || "L",
    tempatLahir: formData.get("tempatLahir") as string,
    tanggalLahir: formData.get("tanggalLahir") as string,
    agama: (formData.get("agama") as string) || "ISLAM",
    statusPerkawinan: (formData.get("statusPerkawinan") as string) || "BELUM_KAWIN",
    pekerjaan: (formData.get("pekerjaan") as string) || null,
    noTelepon: (formData.get("noTelepon") as string) || null,
    statusWarga: (formData.get("statusWarga") as string) || "AKTIF",
  };

  const parsed = residentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  try {
    const existing = await prisma.resident.findFirst({
      where: {
        nik: parsed.data.nik,
        NOT: { id },
      },
    });

    if (existing) {
      return { error: `NIK ${parsed.data.nik} sudah digunakan oleh warga lain.` };
    }

    await prisma.resident.update({
      where: { id },
      data: {
        ...parsed.data,
        tanggalLahir: new Date(parsed.data.tanggalLahir),
      },
    });

    revalidatePath("/warga");
    revalidatePath(`/warga/resident/${id}`);
    revalidatePath(`/warga/kk/${parsed.data.familyCardId}`);
    return { success: "Data Warga berhasil diperbarui" };
  } catch (err: any) {
    console.error("Update Resident error:", err);
    return { error: "Gagal memperbarui data warga." };
  }
}

export async function createWargaAccountAction(prevState: any, formData: FormData) {
  await requireAdmin();

  const residentId = formData.get("residentId") as string;
  const username = (formData.get("username") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!residentId || !username || !password) {
    return { error: "Semua kolom akun warga wajib diisi" };
  }

  if (username.length < 3) {
    return { error: "Username minimal 3 karakter" };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { error: "Username sudah digunakan. Silakan pilih username lain." };
    }

    const existingResidentUser = await prisma.user.findUnique({
      where: { residentId },
    });

    if (existingResidentUser) {
      return { error: "Warga ini sudah memiliki akun login." };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "WARGA",
        residentId,
      },
    });

    revalidatePath(`/warga/resident/${residentId}`);
    return { success: "Akun login warga berhasil dibuat!" };
  } catch (err: any) {
    console.error("Create warga account error:", err);
    return { error: "Gagal membuat akun login warga." };
  }
}
