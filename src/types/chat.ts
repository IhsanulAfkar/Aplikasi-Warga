import { Announcement, CashTransaction, DuesBill, DuesPeriod, DuesType, FamilyCard, Payment, Resident } from "../../generated/prisma/browser"

export type AffectedModel = "announcement" | "cash_transaction" | "dues_bill" | "dues_type" | "dues_period" | "family_card" | "payment" | "resident"

export type TChatExecutionHistory = {
  "id": string,
  "chat_id": string,
  "method": string,
  "payload"?: any,
  "created_at": string,
  "chatExecutionHistoryItems": TChatExecutionHistoryItem[]
}
export type TChatExecutionHistoryItem = {
  "id": string,
  "chatExecutionHistoryId": string,
  "family_card_id": string | null,
  "resident_id": string | null,
  "dues_type_id": string | null,
  "dues_period_id": string | null,
  "dues_bill_id": string | null,
  "payment_id": string | null,
  "cash_transaction_id": string | null,
  "announcement_id": string | null,
  "announcement": Announcement | null,
  "cashTransaction": CashTransaction | null,
  "duesBill": DuesBill | null,
  "duesType": DuesType | null,
  "duesPeriod": DuesPeriod | null,
  "payment": Payment | null,
  "familyCard": FamilyCard | null,
  "resident": Resident | null
}