"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/permissions";

const announcementSchema = z.object({
  title: z.string().min(3, "Judul pengumuman wajib diisi"),
  content: z.string().min(5, "Isi pengumuman wajib diisi"),
  priority: z.enum(["NORMAL", "IMPORTANT"]).default("NORMAL"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  publishDate: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
});

export async function getAnnouncements(onlyPublished = false) {
  await requireAuth();

  const whereClause: any = {};
  if (onlyPublished) {
    whereClause.status = "PUBLISHED";
  }

  return prisma.announcement.findMany({
    where: whereClause,
    include: {
      author: {
        select: { username: true },
      },
    },
    orderBy: [
      { priority: "desc" },
      { publishDate: "desc" },
    ],
  });
}

export async function getAnnouncementById(id: string) {
  await requireAuth();
  return prisma.announcement.findUnique({
    where: { id },
    include: {
      author: {
        select: { username: true },
      },
    },
  });
}

export async function createAnnouncement(prevState: any, formData: FormData) {
  const admin = await requireAdmin();

  const rawData = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    priority: (formData.get("priority") as any) || "NORMAL",
    status: (formData.get("status") as any) || "PUBLISHED",
    publishDate: (formData.get("publishDate") as string) || undefined,
    expiryDate: (formData.get("expiryDate") as string) || null,
  };

  const parsed = announcementSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  try {
    await prisma.announcement.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        priority: parsed.data.priority,
        status: parsed.data.status,
        publishDate: parsed.data.publishDate ? new Date(parsed.data.publishDate) : new Date(),
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
        authorId: admin.id,
      },
    });

    revalidatePath("/pengumuman");
    revalidatePath("/portal/pengumuman");
    revalidatePath("/");
    revalidatePath("/portal");
    return { success: "Pengumuman berhasil dipublikasikan!" };
  } catch (err: any) {
    console.error("Create announcement error:", err);
    return { error: "Gagal membuat pengumuman." };
  }
}

export async function updateAnnouncement(id: string, prevState: any, formData: FormData) {
  await requireAdmin();

  const rawData = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    priority: (formData.get("priority") as any) || "NORMAL",
    status: (formData.get("status") as any) || "PUBLISHED",
    publishDate: (formData.get("publishDate") as string) || undefined,
    expiryDate: (formData.get("expiryDate") as string) || null,
  };

  const parsed = announcementSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  try {
    await prisma.announcement.update({
      where: { id },
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        priority: parsed.data.priority,
        status: parsed.data.status,
        publishDate: parsed.data.publishDate ? new Date(parsed.data.publishDate) : undefined,
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
      },
    });

    revalidatePath("/pengumuman");
    revalidatePath("/portal/pengumuman");
    return { success: "Pengumuman berhasil diperbarui!" };
  } catch (err: any) {
    console.error("Update announcement error:", err);
    return { error: "Gagal memperbarui pengumuman." };
  }
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin();

  await prisma.announcement.delete({
    where: { id },
  });

  revalidatePath("/pengumuman");
  revalidatePath("/portal/pengumuman");
  return { success: "Pengumuman berhasil dihapus." };
}
