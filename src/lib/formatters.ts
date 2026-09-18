export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function maskNIK(nik: string | null | undefined): string {
  if (!nik) return "-";
  if (nik.length <= 8) return nik;
  return nik.substring(0, 4) + "********" + nik.substring(nik.length - 4);
}

export function maskKK(kk: string | null | undefined): string {
  if (!kk) return "-";
  if (kk.length <= 8) return kk;
  return kk.substring(0, 4) + "********" + kk.substring(kk.length - 4);
}

export const CATEGORY_LABELS: Record<string, string> = {
  IURAN_WARGA: "Iuran Warga",
  DONASI: "Donasi / Sumbangan",
  OPERASIONAL: "Operasional & Gaji",
  KEGIATAN: "Kegiatan Lingkungan",
  PEMELIHARAAN: "Perbaikan & Fasilitas",
  LAINNYA: "Lainnya",
};

export const FREQUENCY_LABELS: Record<string, string> = {
  MONTHLY: "Bulanan",
  ONCE: "Sekali Bayar",
  YEARLY: "Tahunan",
  CUSTOM: "Kustom",
};

export const TARGET_TYPE_LABELS: Record<string, string> = {
  PER_KK: "Per Kartu Keluarga (KK)",
  PER_RESIDENT: "Per Jiwa / Warga",
};

export const RELATION_LABELS: Record<string, string> = {
  KEPALA_KELUARGA: "Kepala Keluarga",
  ISTRI: "Istri",
  ANAK: "Anak",
  ORANG_TUA: "Orang Tua / Mertua",
  FAMILI_LAIN: "Famili Lain",
};

export const HOUSE_STATUS_LABELS: Record<string, string> = {
  MILIK_SENDIRI: "Milik Sendiri",
  SEWA_KONTRAK: "Sewa / Kontrak",
  KOST: "Kost",
  LAINNYA: "Lainnya",
};
