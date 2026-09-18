"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/permissions";

const cashTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.enum([
    "IURAN_WARGA",
    "DONASI",
    "OPERASIONAL",
    "KEGIATAN",
    "PEMELIHARAAN",
    "LAINNYA",
  ]),
  amount: z.coerce.number().min(100, "Nominal minimal Rp 100"),
  description: z.string().min(3, "Keterangan transaksi wajib diisi"),
  transactionDate: z.string().min(1, "Tanggal transaksi wajib diisi"),
});

export async function getCashSummary() {
  await requireAuth();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Total All-Time Income
  const incomeAgg = await prisma.cashTransaction.aggregate({
    _sum: { amount: true },
    where: { type: "INCOME", isReversed: false },
  });

  // Total All-Time Expense
  const expenseAgg = await prisma.cashTransaction.aggregate({
    _sum: { amount: true },
    where: { type: "EXPENSE", isReversed: false },
  });

  const totalIncome = incomeAgg._sum.amount || 0;
  const totalExpense = expenseAgg._sum.amount || 0;
  const currentBalance = totalIncome - totalExpense;

  // This Month Income & Expense
  const thisMonthIncome = await prisma.cashTransaction.aggregate({
    _sum: { amount: true },
    where: {
      type: "INCOME",
      isReversed: false,
      transactionDate: { gte: startOfMonth },
    },
  });

  const thisMonthExpense = await prisma.cashTransaction.aggregate({
    _sum: { amount: true },
    where: {
      type: "EXPENSE",
      isReversed: false,
      transactionDate: { gte: startOfMonth },
    },
  });

  return {
    totalIncome,
    totalExpense,
    currentBalance,
    thisMonthIncome: thisMonthIncome._sum.amount || 0,
    thisMonthExpense: thisMonthExpense._sum.amount || 0,
  };
}

export async function getCashTransactions(
  filterType?: string,
  filterCategory?: string,
  searchQuery?: string
) {
  await requireAuth();

  const whereClause: any = {};

  if (filterType && filterType !== "ALL") {
    whereClause.type = filterType;
  }

  if (filterCategory && filterCategory !== "ALL") {
    whereClause.category = filterCategory;
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    whereClause.description = { contains: searchQuery.trim() };
  }

  return prisma.cashTransaction.findMany({
    where: whereClause,
    include: {
      createdBy: {
        select: { username: true },
      },
      payment: {
        include: {
          bill: {
            include: {
              period: { include: { duesType: true } },
              familyCard: { select: { kepalaKeluarga: true } },
              resident: { select: { nama: true } },
            },
          },
        },
      },
    },
    orderBy: { transactionDate: "desc" },
  });
}

export async function recordCashTransaction(prevState: any, formData: FormData) {
  const admin = await requireAdmin();

  const rawData = {
    type: formData.get("type") as any,
    category: formData.get("category") as any,
    amount: formData.get("amount"),
    description: formData.get("description") as string,
    transactionDate: formData.get("transactionDate") as string,
  };

  const parsed = cashTransactionSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  try {
    await prisma.cashTransaction.create({
      data: {
        type: parsed.data.type,
        category: parsed.data.category,
        amount: parsed.data.amount,
        description: parsed.data.description,
        transactionDate: new Date(parsed.data.transactionDate),
        createdById: admin.id,
      },
    });

    revalidatePath("/kas");
    revalidatePath("/portal/kas");
    revalidatePath("/");
    revalidatePath("/portal");
    return {
      success: `Transaksi ${parsed.data.type === "INCOME" ? "Pemasukan" : "Pengeluaran"} sebesar Rp ${parsed.data.amount.toLocaleString("id-ID")} berhasil dicatat!`,
    };
  } catch (err: any) {
    console.error("Record Cash error:", err);
    return { error: "Gagal mencatat transaksi kas." };
  }
}

export async function reverseCashTransaction(id: string, reason: string) {
  await requireAdmin();

  if (!reason || reason.trim().length < 3) {
    throw new Error("Alasan pembatalan/koreksi transaksi wajib dicantumkan.");
  }

  const tx = await prisma.cashTransaction.findUnique({
    where: { id },
  });

  if (!tx) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  if (tx.isReversed) {
    throw new Error("Transaksi ini sudah dibatalkan sebelumnya.");
  }

  await prisma.cashTransaction.update({
    where: { id },
    data: {
      isReversed: true,
      reversalReason: reason.trim(),
    },
  });

  revalidatePath("/kas");
  revalidatePath("/portal/kas");
  revalidatePath("/");
  return { success: "Transaksi kas berhasil dibatalkan / dikoreksi." };
}
