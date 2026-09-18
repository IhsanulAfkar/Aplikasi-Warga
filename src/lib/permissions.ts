import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth";

export class UnauthorizedError extends Error {
  constructor(message = "Anda tidak memiliki izin untuk melakukan tindakan ini") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class UnauthenticatedError extends Error {
  constructor(message = "Sesi telah berakhir. Silakan login kembali.") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    redirect("/portal");
  }
  return user;
}

export async function requireWarga() {
  const user = await requireAuth();
  if (user.role !== "WARGA") {
    redirect("/");
  }
  return user;
}
