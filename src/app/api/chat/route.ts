import { tool, streamText, generateText, stepCountIs, convertToModelMessages } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma'; // Your Prisma client path

import { createOllama } from 'ollama-ai-provider-v2';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { getSession } from '@/lib/auth';
import { AffectedModel } from '@/types/chat';
import { GENDER_OPTIONS } from '@/lib/constant';

const ollama = createOllama({
  // optional settings, e.g.
  baseURL: process.env.OLLAMA_URL || 'http://localhost:11434/api',
});
export const GET = withAuth(async (req, auth) => {
  try {
    const userId = auth.user.id
    const histories = await prisma.chatHistory.findMany({
      where: {
        user_id: userId
      },
      include: {
        chatExecutionHistories: {
          include: {
            chatExecutionHistoryItems: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 20
    })
    const familyCardIds = new Set<string>()
    const residentIds = new Set<string>()
    const duesTypeIds = new Set<string>()
    const duesPeriodIds = new Set<string>()
    const duesBillIds = new Set<string>()
    const paymentIds = new Set<string>()
    const cashTransactionIds = new Set<string>()
    const announcementIds = new Set<string>()

    histories
      .flatMap(h => h.chatExecutionHistories)
      .forEach((chatHistory) => {
        chatHistory.chatExecutionHistoryItems.forEach((i) => {
          if (i.announcement_id) announcementIds.add(i.announcement_id)
          if (i.cash_transaction_id) cashTransactionIds.add(i.cash_transaction_id)
          if (i.dues_bill_id) duesBillIds.add(i.dues_bill_id)
          if (i.dues_period_id) duesPeriodIds.add(i.dues_period_id)
          if (i.dues_type_id) duesTypeIds.add(i.dues_type_id)
          if (i.family_card_id) familyCardIds.add(i.family_card_id)
          if (i.payment_id) paymentIds.add(i.payment_id)
          if (i.resident_id) residentIds.add(i.resident_id)
        })
      })

    const [announcements, cashTransactions, duesBills, duesTypes, duesPeriods, familyCards, payments, residents] = await Promise.all([
      prisma.announcement.findMany({
        where: {
          id: { in: [...announcementIds] },

        },
      }),
      prisma.cashTransaction.findMany({
        where: {
          id: { in: [...cashTransactionIds] },
        },
      }),
      prisma.duesBill.findMany({
        where: {
          id: { in: [...duesBillIds] },

        },
      }),
      prisma.duesType.findMany({
        where: {
          id: { in: [...duesTypeIds] },

        },
      }),
      prisma.duesPeriod.findMany({
        where: {
          id: { in: [...duesPeriodIds] },

        },
      }),
      prisma.familyCard.findMany({
        where: {
          id: { in: [...familyCardIds] },

        },
      }),
      prisma.payment.findMany({
        where: {
          id: { in: [...paymentIds] },

        },
      }),
      prisma.resident.findMany({
        where: {
          id: { in: [...residentIds] },

        },
      }),
    ])
    const announcementsMap = new Map(announcements.map(a => [a.id, a]))
    const cashTransactionsMap = new Map(cashTransactions.map(a => [a.id, a]))
    const duesBillsMap = new Map(duesBills.map(a => [a.id, a]))
    const duesTypesMap = new Map(duesTypes.map(a => [a.id, a]))
    const duesPeriodsMap = new Map(duesPeriods.map(a => [a.id, a]))
    const paymentsMap = new Map(payments.map(a => [a.id, a]))
    const familyCardsMap = new Map(familyCards.map(a => [a.id, a]))
    const residentsMap = new Map(residents.map(a => [a.id, a]))
    const formatted = histories
      .slice()
      .reverse()
      .map(history => ({
        ...history,
        chatExecutionHistories: history.chatExecutionHistories.map(exec => ({
          ...exec,
          chatExecutionHistoryItems: exec.chatExecutionHistoryItems.map(item => ({
            ...item,
            announcement: item.announcement_id ? announcementsMap.get(item.announcement_id) : null,
            cashTransaction: item.cash_transaction_id ? cashTransactionsMap.get(item.cash_transaction_id) : null,
            duesBill: item.dues_bill_id ? duesBillsMap.get(item.dues_bill_id) : null,
            duesType: item.dues_type_id ? duesTypesMap.get(item.dues_type_id) : null,
            duesPeriod: item.dues_period_id ? duesPeriodsMap.get(item.dues_period_id) : null,
            payment: item.payment_id ? paymentsMap.get(item.payment_id) : null,
            familyCard: item.family_card_id ? familyCardsMap.get(item.family_card_id) : null,
            resident: item.resident_id ? residentsMap.get(item.resident_id) : null,
          })),
        })),
      }))

    return NextResponse.json({
      message: "Success",
      data: formatted,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Server Error" }, { status: 500 })
  }
})
export const DELETE = withAuth(async (req, auth) => {
  try {
    const userId = auth.user.id
    await prisma.chatHistory.deleteMany({
      where: {
        user_id: userId
      }
    })
    return NextResponse.json({ message: "success" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Server Error" }, { status: 500 })
  }
})
export async function POST(req: Request) {
  try {
    const { text: prompt, messages } = await req.json();
    const user = await getSession()
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const userId = user.id
    // 1. Save the User's Message immediately
    await prisma.chatHistory.create({
      data: {
        user_id: userId,
        role: 'user',
        content: prompt,
      },
    });
    let aiChatId: string | null = null
    const toolsResult: {
      method: string, model_affected: {
        model: AffectedModel,
        id: string[]
      }[], payload: any
    } = {
      method: '',
      model_affected: [],
      payload: {}
    }
    const result = await streamText({
      model: ollama(process.env.OLLAMA_MODEL!),
      providerOptions: {
        ollama: {
          think: true
        }
      },
      system: `
You are an Aplikasi Warga assistant.

Rules:

Always respond in Bahasa Indonesia.
Use tools whenever needed.
Do NOT explain before calling a tool.
Call the tool directly.
After receiving tool results, summarize them clearly for the user.
Keep responses concise, friendly, and easy to understand.
If multiple results or options match, list them clearly.
If the user's request is unclear, ask a concise clarification question.
Do not make up information. If the information is unavailable, say so clearly.
`,
      messages: await convertToModelMessages(messages.slice(-20)),
      tools: {
        getResident: tool({
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
        }),
        searchResident: tool({
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
        }),
        getIuran: tool({
          description: "Mencari daftar iuran warga. seperti transaksi, daftar warga yang sudah bayar ataupun belum.",
          inputSchema: z.object({}),
          execute: async ({ }) => {

            const duesTypes = await prisma.duesType.findMany({
              include: {
                periods: {
                  include: {
                    bills: {
                      include: {
                        familyCard: true,
                        resident: true,
                        payment: true
                      }
                    }
                  }
                }
              }
            })
            toolsResult.method = "GET_DUES";
            toolsResult.model_affected.push({
              id: duesTypes.map(t => t.id),
              model: "dues_type"
            })
            toolsResult.payload = {};

            return duesTypes;
          },
        }),
        getCashTransactions: tool({
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

Jangan gunakan tool ini hanya untuk menghitung total jika pengguna hanya meminta jumlah pemasukan atau pengeluaran. Gunakan tool summary yang sesuai.`,
          inputSchema: z.object({}),
          execute: async () => {
            const transactions = await prisma.cashTransaction.findMany({
              where: {
                isReversed: false,

              },
              orderBy: {
                transactionDate: 'desc',
              },
            });

            toolsResult.method = "GET_CASH_TRANSACTIONS";
            toolsResult.model_affected.push({
              id: transactions.map(t => t.id),
              model: "cash_transaction",
            });
            toolsResult.payload = {};

            return transactions;
          },
        }),

        getCashSummary: tool({
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
        }),

        getCashTransactionsByCategory: tool({
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
- transaksi berdasarkan kategori`,
          inputSchema: z.object({
            category: z.enum([
              'IURAN_WARGA',
              'DONASI',
              'OPERASIONAL',
              'KEGIATAN',
              'PEMELIHARAAN',
              'LAINNYA',
            ]),
          }),
          execute: async ({ category }) => {
            const result = await prisma.cashTransaction.groupBy({
              by: ['type'],
              where: {
                category,
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

            toolsResult.method = "GET_CASH_BY_CATEGORY";
            toolsResult.model_affected.push({
              id: [],
              model: "cash_transaction",
            });
            toolsResult.payload = {
              category,
            };

            return {
              category,
              income,
              expense,
              balance: income - expense,
            };
          },
        }),
        getAnnouncements: tool({
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

Untuk pengguna umum, prioritaskan pengumuman dengan status PUBLISHED
dan yang masih berlaku.`,
          inputSchema: z.object({}),
          execute: async () => {
            const announcements = await prisma.announcement.findMany({
              where: {
                status: 'PUBLISHED',
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
                publishDate: {
                  lte: new Date(),
                },
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

            toolsResult.method = "GET_ANNOUNCEMENTS";
            toolsResult.model_affected.push({
              id: announcements.map(t => t.id),
              model: "announcement",
            });
            toolsResult.payload = {};

            return announcements;
          },
        }),

        getLatestAnnouncements: tool({
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
        }),

        getImportantAnnouncements: tool({
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
        }),
      },
      stopWhen: stepCountIs(7),
      onFinish: async (props) => {
        const { text, responseMessages, content: propsContent, output } = props
        const reasoning = propsContent
          .filter((message) => message.type === 'reasoning')
          .map((message) => message.text)
          .join('');

        const chat = await prisma.chatHistory.create({
          data: {
            user_id: userId,
            role: 'assistant',
            content: text,
            reasoning
          },
        });
        aiChatId = chat.id
        if (aiChatId && toolsResult.method) {
          // save instruction
          const chatExec = await prisma.chatExecutionHistory.create({
            data: {
              chat_id: aiChatId,
              method: toolsResult.method,
              payload: toolsResult.payload,
            }
          })
          const residentExec = toolsResult.model_affected.find(m => m.model === 'resident')
          if (residentExec) {
            residentExec.id.forEach(async (resId) => {
              await prisma.chatExecutionHistoryItem.create({
                data: {
                  chatExecutionHistoryId: chatExec.id,
                  resident_id: resId
                }
              })
            })
          }
        }
      }
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Server Error" }, { status: 500 })
  }
}