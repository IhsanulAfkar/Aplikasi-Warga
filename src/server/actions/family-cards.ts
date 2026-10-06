"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/permissions";
import { ScanResponse } from "@/lib/client/scan-image";
import { GENDER_OPTIONS, STATUS_PERKAWINAN } from "@/lib/constant";
import { Prisma } from "../../../generated/prisma/client";


const scanAnggotaSchema = z.object({
  nama_lengkap: z.string().nullable(),
  nik: z.string().nullable(),
  jenis_kelamin: z.enum(GENDER_OPTIONS),
  tempat_lahir: z.string().nullable(),
  tanggal_lahir: z.string().nullable(),
  agama: z.string().nullable(),
  pendidikan: z.string().nullable(),
  jenis_pekerjaan: z.string().nullable(),
  golongan_darah: z.string().nullable(),
  status_perkawinan: z.enum(STATUS_PERKAWINAN),
  tanggal_perkawinan: z.string().nullable(),
  status_hubungan_dalam_keluarga: z.string().nullable(),
  kewarganegaraan: z.string().nullable(),
  paspor: z.string().nullable(),
  kitap: z.string().nullable(),
  ayah: z.string().nullable(),
  ibu: z.string().nullable(),
  no_telpon: z.string().nullable().optional(),
})

const scanResponseSchema = z.object({
  no: z.string(),
  kepala_keluarga: z.string(),
  alamat: z.string(),
  rt: z.string().nullable(),
  rw: z.string().nullable(),
  kecamatan: z.string().nullable(),
  kabupaten_kota: z.string().nullable(),
  kode_pos: z.string().nullable(),
  provinsi: z.string().nullable(),
  anggota: z.array(scanAnggotaSchema),
})

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

export async function createFamilyCard(formData: ScanResponse) {
  await requireAdmin();


  const parsed = scanResponseSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  try {
    const existing = await prisma.familyCard.findUnique({
      where: { nomorKK: parsed.data.no },
    });

    if (existing) {
      return { error: `Nomor KK ${parsed.data.no} sudah terdaftar di sistem` };
    }

    const newKK = await prisma.familyCard.create({
      data: {
        nomorKK: parsed.data.no,
        alamat: parsed.data.alamat,
        kepalaKeluarga: parsed.data.kepala_keluarga,
        kecamatan: parsed.data.kecamatan ?? undefined,
        kodePos: parsed.data.kode_pos,
        kota: parsed.data.kabupaten_kota ?? undefined,
        provinsi: parsed.data.provinsi ?? undefined,
        rt: parsed.data.rt ?? undefined,
        rw: parsed.data.rw ?? undefined,
      },
    });
    // create the residents
    const filteredAnggota = parsed.data.anggota.filter(
      (a): a is typeof a & { nik: string } => a.nik != null
    )
    let createdAnggota = 0;
    let updatedAnggota = 0;

    for (const anggota of filteredAnggota) {
      // check
      const isExist = await prisma.resident.findFirst({
        where: {
          familyCardId: newKK.id,
          nik: anggota.nik,
        }
      })

      if (isExist) {
        // update instead
        await prisma.resident.update({
          where: {
            id: isExist.id,
          },
          data: {
            agama: anggota.agama,
            hubunganKeluarga: anggota.status_hubungan_dalam_keluarga ?? undefined,
            jenisKelamin: anggota.jenis_kelamin ?? undefined,
            pekerjaan: anggota.jenis_pekerjaan ?? undefined,
            noTelepon: anggota.no_telpon,
            statusPerkawinan: anggota.status_perkawinan,
            tanggalLahir: anggota.tanggal_lahir ?? undefined,
            tempatLahir: anggota.tempat_lahir ?? undefined,
            nama: anggota.nama_lengkap ?? undefined,
          }
        })
        updatedAnggota += 1
      }
      await prisma.resident.create({
        data: {
          familyCardId: newKK.id,
          nik: anggota.nik,
          tanggalMasuk: new Date(),
          agama: anggota.agama,
          hubunganKeluarga: anggota.status_hubungan_dalam_keluarga ?? undefined,
          jenisKelamin: anggota.jenis_kelamin ?? undefined,
          pekerjaan: anggota.jenis_pekerjaan ?? undefined,
          noTelepon: anggota.no_telpon,
          statusPerkawinan: anggota.status_perkawinan,
          tanggalLahir: anggota.tanggal_lahir ?? "",
          tempatLahir: anggota.tempat_lahir ?? "",
          nama: anggota.nama_lengkap ?? "",
        }
      })
      createdAnggota += 1
    }
    revalidatePath("/warga");
    return { success: `Kartu Keluarga berhasil didaftarkan. ${updatedAnggota > 0 || createdAnggota > 0 ? `${createdAnggota > 0 && `\n${createdAnggota} data anggota telah dibuat`} ${updatedAnggota > 0 && `\n${updatedAnggota} data anggota telah diperbarui`}` : ''}`, id: newKK.id };
  } catch (err: any) {
    console.error("Create KK error:", err);
    return { error: "Gagal menyimpan Kartu Keluarga. Silakan coba lagi." };
  }
}

// export async function updateFamilyCard(id: string, prevState: any, formData: FormData) {
//   await requireAdmin();

//   const rawData:ScanResponse = {
//     no: formData.get("nomorKK") as string,
//     kepala_keluarga: formData.get("kepalaKeluarga") as string,
//     alamat: formData.get("alamat") as string,
//     rt: (formData.get("rt") as string) || "001",
//     rw: (formData.get("rw") as string) || "005",
//     kecamatan: (formData.get("kecamatan") as string) || "Cilodong",
//     provinsi: (formData.get("provinsi") as string) || "Jawa Barat",
//     kabupaten_kota: (formData.get("kota") as string) || "Jawa Barat",
//     kode_pos: (formData.get("kodePos") as string) || null,
//     statusRumah: (formData.get("statusRumah") as string) || "MILIK_SENDIRI",
//   };

//   const parsed = scanResponseSchema.safeParse(rawData);
//   if (!parsed.success) {
//     return { error: parsed.error.errors[0]?.message };
//   }

//   try {
//     const existing = await prisma.familyCard.findFirst({
//       where: {
//         nomorKK: parsed.data.nomorKK,
//         NOT: { id },
//       },
//     });

//     if (existing) {
//       return { error: `Nomor KK ${parsed.data.nomorKK} telah digunakan oleh KK lain.` };
//     }

//     await prisma.familyCard.update({
//       where: { id },
//       data: parsed.data,
//     });

//     revalidatePath("/warga");
//     revalidatePath(`/warga/kk/${id}`);
//     return { success: "Data Kartu Keluarga berhasil diperbarui" };
//   } catch (err: any) {
//     console.error("Update KK error:", err);
//     return { error: "Gagal memperbarui Kartu Keluarga." };
//   }
// }

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
