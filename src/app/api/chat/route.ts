import { tool, streamText, generateText, stepCountIs, convertToModelMessages } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma'; // Your Prisma client path

import { createOllama } from 'ollama-ai-provider-v2';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { getSession } from '@/lib/auth';
import { AffectedModel } from '@/types/chat';
import { GENDER_OPTIONS } from '@/lib/constant';
import { createGetAnnouncemensTools, createGetCashSummary, createGetCashTransaction, createGetCashTransactionsByCategory, createGetImportantAnnouncements, createGetIuran, createGetLatestAnnouncements, createGetResident, createSearchResident, getCurrentDate, ToolsResult } from '@/lib/chat/tools';
import { Prisma } from '../../../../generated/prisma/client';

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
    const toolsResults: ToolsResult[] = []
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
        getCurrentDate,
        getResident: createGetResident(toolsResults),
        searchResident: createSearchResident(toolsResults),
        getIuran: createGetIuran(toolsResults),
        getCashTransactions: createGetCashTransaction(toolsResults),
        getCashSummary: createGetCashSummary(toolsResults),
        getCashTransactionsByCategory: createGetCashTransactionsByCategory(toolsResults),
        getAnnouncements: createGetAnnouncemensTools(toolsResults),
        getLatestAnnouncements: createGetLatestAnnouncements(toolsResults),
        getImportantAnnouncements: createGetImportantAnnouncements(toolsResults),
      },
      stopWhen: stepCountIs(7),
      onFinish: async (props) => {
        const { text, content: propsContent } = props
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
        if (aiChatId) {
          for (const toolsResult of toolsResults) {
            // save instruction
            const chatExec = await prisma.chatExecutionHistory.create({
              data: {
                chat_id: aiChatId,
                method: toolsResult.method,
                payload: toolsResult.payload,
              }
            })
            const modelFieldMap = {
              resident: 'resident_id',
              announcement: 'announcement_id',
              cash_transaction: 'cash_transaction_id',
              dues_bill: 'dues_bill_id',
              dues_period: 'dues_period_id',
              dues_type: 'dues_type_id',
              family_card: 'family_card_id',
              payment: 'payment_id',
            } as const

            const historyItems = toolsResult.model_affected.flatMap((affected) => {
              const field =
                modelFieldMap[affected.model as keyof typeof modelFieldMap]

              if (!field || !affected.id?.length) {
                return []
              }

              return affected.id.map((id) => ({
                chatExecutionHistoryId: chatExec.id,
                [field]: id,
              }))
            })

            if (historyItems.length > 0) {
              await prisma.chatExecutionHistoryItem.createMany({
                data: historyItems,
              })
            }
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