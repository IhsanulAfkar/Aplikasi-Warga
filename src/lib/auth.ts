import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "warga_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "aplikasi-warga-rt-rw-secret-key-2026-super-secure"
);

export interface SessionUser {
  id: string;
  username: string;
  role: "ADMIN" | "WARGA";
  residentId?: string | null;
  nama?: string;
  familyCardId?: string | null;
  nomorKK?: string | null;
}

export async function createSessionToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      resident: {
        include: {
          familyCard: true,
        },
      },
    },
  });

  if (!dbUser) return null;

  return {
    id: dbUser.id,
    username: dbUser.username,
    role: dbUser.role as "ADMIN" | "WARGA",
    residentId: dbUser.residentId,
    nama: dbUser.resident?.nama || (dbUser.role === "ADMIN" ? "Pengurus RT 001" : dbUser.username),
    familyCardId: dbUser.resident?.familyCardId,
    nomorKK: dbUser.resident?.familyCard?.nomorKK,
    resident: dbUser.resident,
  };
}
