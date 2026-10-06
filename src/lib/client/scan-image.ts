import { toast } from "sonner"
import { GENDER_OPTIONS, STATUS_PERKAWINAN } from "../constant"

export type ScanAnggota = {
  "nama_lengkap": string | null,
  "nik": string | null,
  "jenis_kelamin": typeof GENDER_OPTIONS[number],
  "tempat_lahir": string | null,
  "tanggal_lahir": string | null,
  "agama": string | null,
  "pendidikan": string | null,
  "jenis_pekerjaan": string | null,
  "golongan_darah": string | null,
  "status_perkawinan": typeof STATUS_PERKAWINAN[number],
  "tanggal_perkawinan": string | null,
  "status_hubungan_dalam_keluarga": string | null,
  "kewarganegaraan": string | null,
  "paspor": string | null,
  "kitap": string | null,
  "ayah": string | null,
  "ibu": string | null,
  "no_telpon"?: string | null,
}
export type ScanResponse = {
  "no": string,
  "kepala_keluarga": string,
  "alamat": string,
  "rt": string | null,
  "rw": string | null,
  "kecamatan": string | null,
  "kabupaten_kota": string | null,
  "kode_pos": string | null,
  "provinsi": string | null,
  "anggota": ScanAnggota[]
}
export const scanImage = async (file: File) => {
  const formData = new FormData()
  formData.set('file', file)
  const res = await fetch('/api/image-scan', {
    method: "POST",
    body: formData
  })
  if (!res.ok) {
    toast.error('Gagal Scan image')
    console.log(res.text())
    return null
  }
  const json = await res.json() as {
    data: ScanResponse
  }
  return json.data
}