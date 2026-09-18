"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth, requireWarga } from "@/lib/permissions";

const duesTypeSchema = z.object({
  name: z.string().min(3, "Nama iuran wajib diisi"),
  code: z.string().min(2, "Kode unik iuran wajib diisi").toUpperCase(),
  description: z.string().optional().nullable(),
  amount: z.coerce.number().min(1000, "Nominal minimal Rp 1.000"),
  frequency: z.enum(["MONTHLY", "ONCE", "YEARLY", "CUSTOM"]).default("MONTHLY"),
  targetType: z.enum(["PER_KK", "PER_RESIDENT"]).default("PER_KK"),
});

const duesPeriodSchema = z.object({
  duesTypeId: z.string().min(1, "Tipe iuran wajib dipilih"),
  periodName: z.string().min(2, "Nama periode tagihan wajib diisi"),
  billingMonth: z.coerce.number().min(1).max(12).optional().nullable(),
  billingYear: z.coerce.number().min(2020).max(2050),
  dueDate: z.string().min(1, "Batas tanggal pembayaran (jatuh tempo) wajib diisi"),
  amount: z.coerce.number().min(1000, "Nominal tagihan minimal Rp 1.000"),
});

export async function getDuesTypes() {
  await requireAdmin();
  return prisma.duesType.findMany({
    include: {
      _count: {
        select: { periods: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDuesType(prevState: any, formData: FormData) {
  await requireAdmin();

  const rawData = {
    name: formData.get("name") as string,
    code: (formData.get("code") as string)?.toUpperCase().trim(),
    description: (formData.get("description") as string) || null,
    amount: formData.get("amount"),
    frequency: (formData.get("frequency") as any) || "MONTHLY",
    targetType: (formData.get("targetType") as any) || "PER_KK",
  };

  const parsed = duesTypeSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  try {
    const existing = await prisma.duesType.findUnique({
      where: { code: parsed.data.code },
    });

    if (existing) {
      return { error: `Kode iuran '${parsed.data.code}' sudah digunakan.` };
    }

    await prisma.duesType.create({
      data: parsed.data,
    });

    revalidatePath("/iuran");
    return { success: "Tipe iuran berhasil ditambahkan!" };
  } catch (err: any) {
    console.error("Create Dues Type error:", err);
    return { error: "Gagal membuat tipe iuran." };
  }
}

export async function getDuesPeriods(duesTypeId?: string) {
  await requireAdmin();

  const whereClause: any = {};
  if (duesTypeId) {
    whereClause.duesTypeId = duesTypeId;
  }

  return prisma.duesPeriod.findMany({
    where: whereClause,
    include: {
      duesType: true,
      bills: {
        select: {
          id: true,
          amount: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDuesPeriodAndBills(prevState: any, formData: FormData) {
  const admin = await requireAdmin();

  const rawData = {
    duesTypeId: formData.get("duesTypeId") as string,
    periodName: formData.get("periodName") as string,
    billingMonth: formData.get("billingMonth") ? Number(formData.get("billingMonth")) : null,
    billingYear: Number(formData.get("billingYear") || new Date().getFullYear()),
    dueDate: formData.get("dueDate") as string,
    amount: Number(formData.get("amount")),
  };

  const parsed = duesPeriodSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  try {
    const duesType = await prisma.duesType.findUnique({
      where: { id: parsed.data.duesTypeId },
    });

    if (!duesType) {
      return { error: "Tipe iuran tidak ditemukan." };
    }

    // Use Prisma transaction to create Period and generate Bills
    const result = await prisma.$transaction(async (tx) => {
      const period = await tx.duesPeriod.create({
        data: {
          duesTypeId: parsed.data.duesTypeId,
          periodName: parsed.data.periodName,
          billingMonth: parsed.data.billingMonth,
          billingYear: parsed.data.billingYear,
          dueDate: new Date(parsed.data.dueDate),
          amount: parsed.data.amount,
        },
      });

      if (duesType.targetType === "PER_KK") {
        // Target: All active FamilyCards
        const activeKKs = await tx.familyCard.findMany({
          where: { isActive: true },
          select: { id: true },
        });

        if (activeKKs.length > 0) {
          const billsData = activeKKs.map((kk) => ({
            periodId: period.id,
            targetFamilyCardId: kk.id,
            amount: parsed.data.amount,
            status: "UNPAID",
          }));

          await tx.duesBill.createMany({
            data: billsData,
          });
        }
      } else {
        // Target: All active Residents
        const activeResidents = await tx.resident.findMany({
          where: { statusWarga: "AKTIF" },
          select: { id: true },
        });

        if (activeResidents.length > 0) {
          const billsData = activeResidents.map((r) => ({
            periodId: period.id,
            targetResidentId: r.id,
            amount: parsed.data.amount,
            status: "UNPAID",
          }));

          await tx.duesBill.createMany({
            data: billsData,
          });
        }
      }

      return period;
    });

    revalidatePath("/iuran");
    return { success: `Periode tagihan '${parsed.data.periodName}' dan seluruh tagihan warga berhasil dibuat!` };
  } catch (err: any) {
    console.error("Create Dues Period error:", err);
    return { error: "Gagal membuat periode tagihan iuran." };
  }
}

export async function getPeriodDetailWithBills(periodId: string, statusFilter?: string) {
  await requireAdmin();

  const period = await prisma.duesPeriod.findUnique({
    where: { id: periodId },
    include: {
      duesType: true,
      bills: {
        where: statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : undefined,
        include: {
          familyCard: {
            select: { id: true, nomorKK: true, kepalaKeluarga: true, alamat: true, rt: true, rw: true },
          },
          resident: {
            select: { id: true, nik: true, nama: true },
          },
          payment: {
            include: {
              recordedBy: {
                select: { username: true },
              },
            },
          },
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  return period;
}

export async function recordManualPayment(prevState: any, formData: FormData) {
  const admin = await requireAdmin();

  const billId = formData.get("billId") as string;
  const paymentMethod = (formData.get("paymentMethod") as string) || "CASH";
  const notes = (formData.get("notes") as string) || null;

  if (!billId) {
    return { error: "ID Tagihan tidak ditemukan." };
  }

  try {
    const bill = await prisma.duesBill.findUnique({
      where: { id: billId },
      include: {
        period: {
          include: { duesType: true },
        },
        familyCard: true,
        resident: true,
        payment: true,
      },
    });

    if (!bill) {
      return { error: "Tagihan tidak ditemukan." };
    }

    if (bill.status === "PAID" || bill.payment) {
      return { error: "Tagihan ini sudah lunas sebelumnya." };
    }

    const payerName = bill.familyCard
      ? `KK ${bill.familyCard.kepalaKeluarga}`
      : `Warga ${bill.resident?.nama}`;

    const now = new Date();

    // Execute atomically: create Payment, update Bill, create CashTransaction (INCOME)
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          billId: bill.id,
          amountPaid: bill.amount,
          paymentDate: now,
          paymentMethod: paymentMethod,
          notes: notes || `Pembayaran iuran ${bill.period.periodName} oleh ${payerName}`,
          recordedById: admin.id,
        },
      });

      await tx.duesBill.update({
        where: { id: bill.id },
        data: {
          status: "PAID",
          paidAt: now,
        },
      });

      await tx.cashTransaction.create({
        data: {
          type: "INCOME",
          category: "IURAN_WARGA",
          amount: bill.amount,
          description: `Penerimaan Iuran ${bill.period.periodName} (${bill.period.duesType.name}) - ${payerName}`,
          transactionDate: now,
          createdById: admin.id,
          paymentId: payment.id,
        },
      });
    });

    revalidatePath("/iuran");
    revalidatePath(`/iuran/periods/${bill.periodId}`);
    revalidatePath("/kas");
    revalidatePath("/portal/iuran");
    revalidatePath("/portal/kas");
    return { success: `Pembayaran ${payerName} sejumlah Rp ${bill.amount.toLocaleString("id-ID")} berhasil dicatat!` };
  } catch (err: any) {
    console.error("Record payment error:", err);
    return { error: "Gagal mencatat pembayaran iuran." };
  }
}

export async function getMyDuesBills() {
  const user = await requireAuth();

  const whereCondition: any = {
    OR: [],
  };

  if (user.familyCardId) {
    whereCondition.OR.push({ targetFamilyCardId: user.familyCardId });
  }

  if (user.residentId) {
    whereCondition.OR.push({ targetResidentId: user.residentId });
  }

  if (whereCondition.OR.length === 0) {
    return {
      bills: [],
      unpaidBills: [],
      paidBills: [],
      totalUnpaidAmount: 0,
      totalPaidAmount: 0,
    };
  }

  const bills = await prisma.duesBill.findMany({
    where: whereCondition,
    include: {
      period: {
        include: { duesType: true },
      },
      payment: true,
    },
    orderBy: [{ status: "asc" }, { period: { dueDate: "desc" } }],
  });

  const unpaidBills = bills.filter((b) => b.status !== "PAID");
  const paidBills = bills.filter((b) => b.status === "PAID");

  const totalUnpaidAmount = unpaidBills.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaidAmount = paidBills.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    bills,
    unpaidBills,
    paidBills,
    totalUnpaidAmount,
    totalPaidAmount,
  };
}

export async function getDuesSummaryStats() {
  await requireAdmin();

  const totalBills = await prisma.duesBill.count();
  const paidBillsCount = await prisma.duesBill.count({ where: { status: "PAID" } });
  const unpaidBillsCount = await prisma.duesBill.count({ where: { status: "UNPAID" } });

  const sumPaid = await prisma.duesBill.aggregate({
    _sum: { amount: true },
    where: { status: "PAID" },
  });

  const sumUnpaid = await prisma.duesBill.aggregate({
    _sum: { amount: true },
    where: { status: "UNPAID" },
  });

  const totalCollected = sumPaid._sum.amount || 0;
  const totalOutstanding = sumUnpaid._sum.amount || 0;
  const percentage = totalBills > 0 ? Math.round((paidBillsCount / totalBills) * 100) : 0;

  return {
    totalBills,
    paidBillsCount,
    unpaidBillsCount,
    totalCollected,
    totalOutstanding,
    percentage,
  };
}
