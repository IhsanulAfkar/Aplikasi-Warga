import { AffectedModel } from '@/types/chat'
import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '../prisma'
import { GENDER_OPTIONS } from '../constant'
import { Prisma } from '../../../generated/prisma/client'
export type ToolsResult = {
  method: string, model_affected: {
    model: AffectedModel,
    id: string[]
  }[], payload: any
}
export const getCurrentDate = tool({
  description:
    `Mengembalikan tanggal dan waktu saat ini.

WAJIB gunakan tool ini sebelum melakukan pencarian yang membutuhkan
interpretasi tanggal relatif seperti:
- hari ini
- kemarin
- besok
- minggu ini
- bulan ini
- bulan lalu
- tahun ini
- last month
- this month
- today
- yesterday

Gunakan tanggal dari hasil tool ini sebagai acuan untuk menghitung
startDate dan endDate pada tool lain.`,

  inputSchema: z.object({}),

  execute: async () => {
    const now = new Date()

    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    return {
      timezone: 'Asia/Jakarta',
      iso: now.toISOString(),
      date: formatter.format(now),
    }
  },
})
export const createGetAnnouncemensTools = (toolsResult: ToolsResult) => {
  return tool({
    description: `Gunakan tool ini untuk mengambil daftar pengumuman warga.

Gunakan ketika pengguna meminta:
- daftar pengumuman
- pengumuman warga
- semua pengumuman
- pengumuman yang sedang berlaku
- informasi pengumuman
- berita atau pemberitahuan dari pengurus

Pengumuman memiliki:
- title: judul pengumuman
- content: isi pengumuman
- priority: NORMAL atau IMPORTANT
- status: DRAFT, PUBLISHED, atau ARCHIVED
- publishDate: tanggal publikasi
- expiryDate: tanggal berakhirnya pengumuman

Filter yang tersedia:
- startDate: tanggal mulai berdasarkan publishDate, format YYYY-MM-DD
- endDate: tanggal akhir berdasarkan publishDate, format YYYY-MM-DD
- priority: NORMAL atau IMPORTANT

Semua filter bersifat opsional.

Untuk pengguna umum, prioritaskan pengumuman dengan status PUBLISHED
dan yang masih berlaku.

Jika pengguna menggunakan tanggal relatif seperti "hari ini", "bulan lalu",
atau "minggu ini", gunakan getCurrentDate terlebih dahulu untuk menentukan
startDate dan endDate.`,
    inputSchema: z.object({
      startDate: z
        .string()
        .optional()
        .describe(
          'Tanggal mulai publikasi berdasarkan publishDate, format YYYY-MM-DD'
        ),

      endDate: z
        .string()
        .optional()
        .describe(
          'Tanggal akhir publikasi berdasarkan publishDate, format YYYY-MM-DD'
        ),

      priority: z
        .enum(['NORMAL', 'IMPORTANT'])
        .optional()
        .describe('Prioritas pengumuman'),
    }),
    execute: async ({
      startDate,
      endDate,
      priority,
    }) => {
      const announcements = await prisma.announcement.findMany({
        where: {
          status: 'PUBLISHED',

          ...(priority
            ? {
              priority,
            }
            : {}),

          ...(startDate || endDate
            ? {
              publishDate: {
                ...(startDate
                  ? {
                    gte: new Date(`${startDate}T00:00:00.000`),
                  }
                  : {}),
                ...(endDate
                  ? {
                    lte: new Date(`${endDate}T23:59:59.999`),
                  }
                  : {}),
              },
            }
            : {}),

          OR: [
            {
              expiryDate: null,
            },
            {
              expiryDate: {
                gte: new Date(),
              },
            },
          ],
        },

        orderBy: [
          {
            priority: 'desc',
          },
          {
            publishDate: 'desc',
          },
        ],
      });

      toolsResult.method = 'GET_ANNOUNCEMENTS';

      toolsResult.model_affected.push({
        id: announcements.map((t) => t.id),
        model: 'announcement',
      });

      toolsResult.payload = {
        startDate,
        endDate,
        priority,
      };

      return announcements;
    },
  })
}
export const createGetResident = (toolsResult: ToolsResult) => {
  return tool({
    description: `Gunakan tool ini untuk mengambil data:
  - warga
  - kartu keluarga atau kk
  - orang`,
    inputSchema: z.object({}),
    execute: async ({ }) => {
      const kk = await prisma.familyCard.findMany({
        include: {
          members: true
        }
      })
      toolsResult.method = "GET_FAMILY_CARD";
      toolsResult.model_affected.push({
        id: kk.map(t => t.id),
        model: "family_card"
      })
      toolsResult.payload = {};

      return kk;
    },
  })
}
export const createSearchResident = (toolsResult: ToolsResult) => {
  return tool({
    description: `Mencari orang atau keluarga dari:
- nama
- gender`,
    inputSchema: z.object({
      name: z.string().optional(),
      gender: z.enum(GENDER_OPTIONS).optional(),
    }),
    execute: async ({ name, gender }) => {
      const residents = await prisma.resident.findMany({
        where: {
          ...(name && {
            OR: [
              { nama: { contains: name, mode: "insensitive" } },
            ],
          }),
          ...(gender && {
            jenisKelamin: gender
          })
        },
      });
      toolsResult.method = "SEARCH_RESIDENT";
      toolsResult.model_affected.push({
        id: residents.map(t => t.id),
        model: "resident"
      })
      toolsResult.payload = { name, gender };

      return residents;
    },
  })
}
export const createGetIuran = (toolsResult: ToolsResult) => {
  return tool({
    description:
      "Mencari daftar iuran warga. Bisa mencari transaksi, warga yang sudah/belum bayar, berdasarkan tanggal, nominal, status, nama warga, nama KK, atau periode. Semua filter bersifat opsional. Secara default hanya mengambil data terbatas. Gunakan getAll=true jika memang membutuhkan seluruh data iuran.",

    inputSchema: z.object({
      startDate: z
        .string()
        .optional()
        .describe("Tanggal mulai, format YYYY-MM-DD"),

      endDate: z
        .string()
        .optional()
        .describe("Tanggal akhir, format YYYY-MM-DD"),

      minAmount: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe("Nominal iuran minimum dalam IDR"),

      maxAmount: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe("Nominal iuran maksimum dalam IDR"),

      status: z
        .enum(["UNPAID", "PAID", "OVERDUE"])
        .optional()
        .describe("Status pembayaran"),

      residentName: z
        .string()
        .optional()
        .describe("Nama warga, pencarian sebagian/tidak harus persis"),

      familyCardName: z
        .string()
        .optional()
        .describe("Nama kepala keluarga/KK, pencarian sebagian"),

      period: z
        .string()
        .optional()
        .describe("Nama periode iuran, misalnya Januari 2026"),

      getAll: z
        .boolean()
        .default(false)
        .describe(
          "Jika true, mengambil seluruh data iuran tanpa batas pagination. Gunakan hanya jika memang diperlukan."
        ),

      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50)
        .describe("Jumlah maksimum hasil yang dikembalikan"),
    }),

    execute: async ({
      startDate,
      endDate,
      minAmount,
      maxAmount,
      status,
      residentName,
      familyCardName,
      period,
      getAll,
      limit,
    }) => {
      const where: Prisma.DuesBillWhereInput = {
        ...(minAmount !== undefined || maxAmount !== undefined
          ? {
            amount: {
              ...(minAmount !== undefined ? { gte: minAmount } : {}),
              ...(maxAmount !== undefined ? { lte: maxAmount } : {}),
            },
          }
          : {}),

        ...(status ? { status } : {}),

        ...(startDate || endDate
          ? {
            createdAt: {
              ...(startDate
                ? { gte: new Date(`${startDate}T00:00:00.000`) }
                : {}),
              ...(endDate
                ? { lte: new Date(`${endDate}T23:59:59.999`) }
                : {}),
            },
          }
          : {}),

        ...(residentName
          ? {
            resident: {
              nama: {
                contains: residentName,
                mode: "insensitive",
              },
            },
          }
          : {}),

        ...(familyCardName
          ? {
            familyCard: {
              kepalaKeluarga: {
                contains: familyCardName,
                mode: "insensitive",
              },
            },
          }
          : {}),

        ...(period
          ? {
            period: {
              periodName: {
                contains: period,
                mode: "insensitive",
              },
            },
          }
          : {}),
      };

      const bills = await prisma.duesBill.findMany({
        where,
        include: {
          period: {
            include: {
              duesType: true,
            },
          },
          familyCard: true,
          resident: true,
          payment: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        ...(getAll ? {} : { take: limit }),
      });
      console.log(startDate, endDate, bills)
      toolsResult.method = "GET_DUES";

      toolsResult.model_affected.push({
        id: bills.map((bill) => bill.id),
        model: "dues_bill",
      });

      toolsResult.payload = {
        startDate,
        endDate,
        minAmount,
        maxAmount,
        status,
        residentName,
        familyCardName,
        period,
        getAll,
        limit: getAll ? undefined : limit,
      };

      return bills;
    },
  })
}
export const createGetCashTransaction = (toolsResult: ToolsResult) => {
  return tool({
    description: `Gunakan tool ini untuk mengambil data transaksi kas warga.

Gunakan tool ini ketika pengguna meminta:
- daftar transaksi kas
- transaksi pemasukan
- transaksi pengeluaran
- riwayat transaksi
- transaksi berdasarkan kategori
- transaksi berdasarkan tanggal
- detail pemasukan atau pengeluaran

Data transaksi memiliki:
- type: INCOME atau EXPENSE
- category: IURAN_WARGA, DONASI, OPERASIONAL, KEGIATAN, PEMELIHARAAN, atau LAINNYA
- amount: nominal transaksi
- description: keterangan transaksi
- transactionDate: tanggal transaksi
- isReversed: apakah transaksi sudah dibatalkan/direversal

Filter yang tersedia:
- startDate: tanggal mulai transaksi
- endDate: tanggal akhir transaksi
- minAmount: nominal minimum
- maxAmount: nominal maksimum

Semua filter bersifat opsional.

Untuk tanggal relatif seperti "hari ini", "bulan lalu", atau "minggu ini",
gunakan tool getCurrentDate terlebih dahulu untuk menentukan startDate dan endDate.

Jangan gunakan tool ini hanya untuk menghitung total jika pengguna hanya meminta
jumlah pemasukan atau pengeluaran. Gunakan tool summary yang sesuai.`,
    inputSchema: z.object({
      startDate: z
        .string()
        .optional()
        .describe("Tanggal mulai transaksi, format YYYY-MM-DD"),

      endDate: z
        .string()
        .optional()
        .describe("Tanggal akhir transaksi, format YYYY-MM-DD"),

      minAmount: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe("Nominal transaksi minimum dalam IDR"),

      maxAmount: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe("Nominal transaksi maksimum dalam IDR"),
    }),

    execute: async ({
      startDate,
      endDate,
      minAmount,
      maxAmount,
    }) => {
      const transactions = await prisma.cashTransaction.findMany({
        where: {
          isReversed: false,

          ...(startDate || endDate
            ? {
              transactionDate: {
                ...(startDate
                  ? {
                    gte: new Date(`${startDate}T00:00:00.000`),
                  }
                  : {}),
                ...(endDate
                  ? {
                    lte: new Date(`${endDate}T23:59:59.999`),
                  }
                  : {}),
              },
            }
            : {}),

          ...(minAmount !== undefined || maxAmount !== undefined
            ? {
              amount: {
                ...(minAmount !== undefined
                  ? { gte: minAmount }
                  : {}),
                ...(maxAmount !== undefined
                  ? { lte: maxAmount }
                  : {}),
              },
            }
            : {}),
        },

        orderBy: {
          transactionDate: "desc",
        },
      });

      toolsResult.method = "GET_CASH_TRANSACTIONS";

      toolsResult.model_affected.push({
        id: transactions.map((t) => t.id),
        model: "cash_transaction",
      });

      toolsResult.payload = {
        startDate,
        endDate,
        minAmount,
        maxAmount,
      };

      return transactions;
    },
  })
}
export const createGetCashSummary = (toolsResult: ToolsResult) => {
  return tool({
    description: `Gunakan tool ini untuk mendapatkan ringkasan keuangan kas warga.
  
  Gunakan tool ini ketika pengguna bertanya:
  - berapa total pemasukan
  - berapa total pengeluaran
  - berapa saldo kas
  - berapa pemasukan dan pengeluaran
  - bagaimana kondisi kas
  - ringkasan keuangan kas
  
  Tool ini memberikan total pemasukan, total pengeluaran, dan saldo kas.
  Transaksi yang sudah direversal tidak dihitung.`,
    inputSchema: z.object({}),
    execute: async () => {
      const result = await prisma.cashTransaction.groupBy({
        by: ['type'],
        where: {
          isReversed: false,
        },
        _sum: {
          amount: true,
        },
      });

      const income =
        result.find(t => t.type === 'INCOME')?._sum.amount ?? 0;

      const expense =
        result.find(t => t.type === 'EXPENSE')?._sum.amount ?? 0;

      const balance = income - expense;

      toolsResult.method = "GET_CASH_SUMMARY";
      toolsResult.model_affected.push({
        id: [],
        model: "cash_transaction",
      });
      toolsResult.payload = {};

      return {
        income,
        expense,
        balance,
      };
    },
  })
}
export const createGetCashTransactionsByCategory = (toolsResult: ToolsResult) => {
  return tool({
    description: `Gunakan tool ini untuk mendapatkan ringkasan transaksi kas berdasarkan kategori.
  
  Kategori yang tersedia:
  - IURAN_WARGA
  - DONASI
  - OPERASIONAL
  - KEGIATAN
  - PEMELIHARAAN
  - LAINNYA
  
  Gunakan ketika pengguna bertanya:
  - berapa pemasukan dari iuran warga
  - berapa pengeluaran untuk kegiatan
  - berapa uang yang digunakan untuk operasional
  - total donasi
  - total pemeliharaan
  - transaksi berdasarkan kategori
  
  Filter tambahan yang tersedia:
  - startDate: tanggal mulai transaksi, format YYYY-MM-DD
  - endDate: tanggal akhir transaksi, format YYYY-MM-DD
  - minAmount: nominal transaksi minimum
  - maxAmount: nominal transaksi maksimum
  
  Semua filter tambahan bersifat opsional.
  
  Jika pengguna menggunakan tanggal relatif seperti "hari ini", "bulan lalu",
  atau "minggu ini", gunakan getCurrentDate terlebih dahulu untuk menentukan
  startDate dan endDate.`,

    inputSchema: z.object({
      category: z.enum([
        'IURAN_WARGA',
        'DONASI',
        'OPERASIONAL',
        'KEGIATAN',
        'PEMELIHARAAN',
        'LAINNYA',
      ]),

      startDate: z
        .string()
        .optional()
        .describe('Tanggal mulai transaksi, format YYYY-MM-DD'),

      endDate: z
        .string()
        .optional()
        .describe('Tanggal akhir transaksi, format YYYY-MM-DD'),

      minAmount: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe('Nominal transaksi minimum dalam IDR'),

      maxAmount: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe('Nominal transaksi maksimum dalam IDR'),
    }),

    execute: async ({
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    }) => {
      const result = await prisma.cashTransaction.groupBy({
        by: ['type'],

        where: {
          category,
          isReversed: false,

          ...(startDate || endDate
            ? {
              transactionDate: {
                ...(startDate
                  ? {
                    gte: new Date(`${startDate}T00:00:00.000`),
                  }
                  : {}),
                ...(endDate
                  ? {
                    lte: new Date(`${endDate}T23:59:59.999`),
                  }
                  : {}),
              },
            }
            : {}),

          ...(minAmount !== undefined || maxAmount !== undefined
            ? {
              amount: {
                ...(minAmount !== undefined
                  ? { gte: minAmount }
                  : {}),
                ...(maxAmount !== undefined
                  ? { lte: maxAmount }
                  : {}),
              },
            }
            : {}),
        },

        _sum: {
          amount: true,
        },
      });

      const income =
        result.find(t => t.type === 'INCOME')?._sum.amount ?? 0;

      const expense =
        result.find(t => t.type === 'EXPENSE')?._sum.amount ?? 0;

      toolsResult.method = 'GET_CASH_BY_CATEGORY';

      toolsResult.model_affected.push({
        id: [],
        model: 'cash_transaction',
      });

      toolsResult.payload = {
        category,
        startDate,
        endDate,
        minAmount,
        maxAmount,
      };

      return {
        category,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        income,
        expense,
        balance: income - expense,
      };
    },
  })
}
export const createGetImportantAnnouncements = (toolsResult: ToolsResult) => {
  return tool({
    description: `Gunakan tool ini untuk mengambil pengumuman penting dari pengurus warga.
  
  Gunakan ketika pengguna bertanya:
  - "ada pengumuman penting?"
  - "apa informasi penting?"
  - "pengumuman penting apa?"
  - "apa yang harus saya ketahui?"
  - atau pengguna meminta informasi penting dari pengurus.
  
  Hanya gunakan pengumuman dengan priority IMPORTANT,
  status PUBLISHED, dan yang masih berlaku.`,
    inputSchema: z.object({}),
    execute: async () => {
      const announcements = await prisma.announcement.findMany({
        where: {
          priority: 'IMPORTANT',
          status: 'PUBLISHED',
          publishDate: {
            lte: new Date(),
          },
          OR: [
            {
              expiryDate: null,
            },
            {
              expiryDate: {
                gte: new Date(),
              },
            },
          ],
        },
        orderBy: {
          publishDate: 'desc',
        },
      });

      toolsResult.method = "GET_IMPORTANT_ANNOUNCEMENTS";
      toolsResult.model_affected.push({
        id: announcements.map(t => t.id),
        model: "announcement",
      });
      toolsResult.payload = {};

      return announcements;
    },
  })
}
export const createGetLatestAnnouncements = (toolsResult: ToolsResult) => {
  return tool({
    description: `Gunakan tool ini untuk mengambil pengumuman terbaru yang masih berlaku.
  
  Gunakan ketika pengguna bertanya:
  - "ada pengumuman terbaru?"
  - "apa pengumuman terbaru?"
  - "ada info terbaru?"
  - "apa kabar terbaru dari warga?"
  - "pengumuman hari ini apa?"
  - "ada pemberitahuan baru?"
  
  Hanya tampilkan pengumuman yang sudah dipublikasikan dan masih berlaku.`,
    inputSchema: z.object({}),
    execute: async () => {
      const announcements = await prisma.announcement.findMany({
        where: {
          status: 'PUBLISHED',
          publishDate: {
            lte: new Date(),
          },
          OR: [
            {
              expiryDate: null,
            },
            {
              expiryDate: {
                gte: new Date(),
              },
            },
          ],
        },
        orderBy: {
          publishDate: 'desc',
        },
        take: 5,
      });

      toolsResult.method = "GET_LATEST_ANNOUNCEMENTS";
      toolsResult.model_affected.push({
        id: announcements.map(t => t.id),
        model: "announcement",
      });
      toolsResult.payload = {};

      return announcements;
    },
  })
}