"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { requireAuth } from "@/lib/permissions";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function loginAction(prevState: any, formData: FormData) {
  const rawData = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Input tidak valid",
    };
  }

  const { username, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
      include: {
        resident: {
          include: {
            familyCard: true,
          },
        },
      },
    });

    if (!user) {
      return { error: "Username atau password salah" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: "Username atau password salah" };
    }

    await setSessionCookie({
      id: user.id,
      username: user.username,
      role: user.role as "ADMIN" | "WARGA",
      residentId: user.residentId,
      nama: user.resident?.nama,
      familyCardId: user.resident?.familyCardId,
      nomorKK: user.resident?.familyCard?.nomorKK,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return { error: "Terjadi kesalahan pada server. Coba lagi." };
  }

  // Redirect based on role
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") {
    redirect("/");
  } else {
    redirect("/portal");
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function changePasswordAction(prevState: any, formData: FormData) {
  const user = await requireAuth();

  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return { error: "Semua kolom password wajib diisi" };
  }

  if (newPassword.length < 6) {
    return { error: "Password baru minimal 6 karakter" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password baru tidak cocok" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return { error: "Pengguna tidak ditemukan" };
  }

  const isMatch = await bcrypt.compare(oldPassword, dbUser.password);
  if (!isMatch) {
    return { error: "Password lama salah" };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  revalidatePath("/profil");
  revalidatePath("/portal/profil");
  return { success: "Password berhasil diperbarui" };
}
