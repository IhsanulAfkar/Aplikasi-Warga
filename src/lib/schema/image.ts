import z from "zod";
import { GENDER_OPTIONS, STATUS_PERKAWINAN } from "../constant";

export const kkScanSchema = z.object({
  no: z.string().length(16, "must exactly 16 chars"),
  kepala_keluarga: z.string(),
  alamat: z.string(),
  rt: z.string().nullish(),
  rw: z.string().nullish(),
  kecamatan: z.string().nullish(),
  kabupaten_kota: z.string().nullish(),
  kode_pos: z.string().nullish(),
  provinsi: z.string().nullish(),
  anggota: z.array(z.object({
    nama_lengkap: z.string().nullish(),
    nik: z.string().nullish(),
    jenis_kelamin: z.enum(GENDER_OPTIONS).nullable(),
    tempat_lahir: z.string().nullish(),
    tanggal_lahir: z.string().nullish(),
    agama: z.string().nullish(),
    pendidikan: z.string().nullish(),
    jenis_pekerjaan: z.string().nullish(),
    golongan_darah: z.string().nullish(),
    status_perkawinan: z.enum(STATUS_PERKAWINAN).nullable(),
    tanggal_perkawinan: z.string().nullish(),
    status_hubungan_dalam_keluarga: z.string().nullish(),
    kewarganegaraan: z.string().nullish(),
    paspor: z.string().nullish(),
    kitap: z.string().nullish(),
    ayah: z.string().nullish(),
    ibu: z.string().nullish(),
  })).optional(),
});