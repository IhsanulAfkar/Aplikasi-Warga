
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { Agent, setGlobalDispatcher } from 'undici';
import { GENDER_OPTIONS, STATUS_PERKAWINAN } from "@/lib/constant";
import { kkScanSchema } from "@/lib/schema/image";
setGlobalDispatcher(
  new Agent({
    headersTimeout: 0,
    bodyTimeout: 0,
  }),
);

function nullIfEmpty(value: any) {
  if (value === undefined || value === null) return null;

  const str = String(value).trim();

  return str === '' || str.toLowerCase() === 'null'
    ? null
    : str;
}

function normalizeGender(value: any) {
  const normalized = nullIfEmpty(value)?.toUpperCase();

  if (!normalized) return null;

  if (
    normalized === 'L' ||
    normalized === 'LAKI' ||
    normalized === 'LAKI-LAKI' ||
    normalized === 'LAKI LAKI'
  ) {
    return 'LAKI-LAKI';
  }

  if (
    normalized === 'P' ||
    normalized === 'PEREMPUAN'
  ) {
    return 'PEREMPUAN';
  }

  return null;
}

function normalizeStatusPerkawinan(value: any) {
  const normalized = nullIfEmpty(value)?.toUpperCase();

  if (!normalized) return null;

  const mappings: Record<string, typeof STATUS_PERKAWINAN[number]> = {
    'KAWIN': 'KAWIN TERCATAT',
    'KAWIN TERCATAT': 'KAWIN TERCATAT',
    'KAWIN BELUM TERCATAT': 'KAWIN BELUM TERCATAT',
    'BELUM KAWIN': 'BELUM KAWIN',
    'CERAI': 'CERAI TERCATAT',
    'CERAI TERCATAT': 'CERAI TERCATAT',
    'CERAI BELUM TERCATAT': 'CERAI BELUM TERCATAT',
    'CERAI MATI': 'CERAI MATI',
  };

  return mappings[normalized] ?? null;
}

function normalizeNik(value: any) {
  const normalized = nullIfEmpty(value);

  if (!normalized) return null;

  // Keep only digits for OCR mistakes such as spaces or hyphens.
  const digits = normalized.replace(/\D/g, '');

  return digits.length === 16 ? digits : normalized;
}

function fixLLMOutput(data: any) {
  const anggota = Array.isArray(data?.anggota)
    ? data.anggota
    : [];

  return {
    no: normalizeNik(data?.no),
    kepala_keluarga: nullIfEmpty(data?.kepala_keluarga) ?? '',
    alamat: nullIfEmpty(data?.alamat) ?? '',
    rt: nullIfEmpty(data?.rt),
    rw: nullIfEmpty(data?.rw),
    kecamatan: nullIfEmpty(data?.kecamatan),
    kabupaten_kota: nullIfEmpty(data?.kabupaten_kota),
    kode_pos: nullIfEmpty(data?.kode_pos),
    provinsi: nullIfEmpty(data?.provinsi),
    anggota: anggota.map((item: any) => ({
      nama_lengkap: nullIfEmpty(item?.nama_lengkap),
      nik: normalizeNik(item?.nik),
      jenis_kelamin: normalizeGender(item?.jenis_kelamin),
      tempat_lahir: nullIfEmpty(item?.tempat_lahir),
      tanggal_lahir: nullIfEmpty(item?.tanggal_lahir),
      agama: nullIfEmpty(item?.agama),
      pendidikan: nullIfEmpty(item?.pendidikan),
      jenis_pekerjaan: nullIfEmpty(item?.jenis_pekerjaan),
      golongan_darah: nullIfEmpty(item?.golongan_darah),
      status_perkawinan: normalizeStatusPerkawinan(
        item?.status_perkawinan
      ),
      tanggal_perkawinan: nullIfEmpty(item?.tanggal_perkawinan),
      status_hubungan_dalam_keluarga: nullIfEmpty(
        item?.status_hubungan_dalam_keluarga
      ),
      kewarganegaraan: nullIfEmpty(item?.kewarganegaraan),
      paspor: nullIfEmpty(item?.paspor),
      kitap: nullIfEmpty(item?.kitap),
      ayah: nullIfEmpty(item?.ayah),
      ibu: nullIfEmpty(item?.ibu),
    })),
  };
}

async function callLLM(images: string[], extraPrompt?: string) {
  const res = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',

    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL_VISION!,
      messages: [
        {
          role: 'user',
          content: `
You are an OCR/document extraction system specialized in Indonesian Kartu Keluarga (KK).

Analyze the provided image of an Indonesian Kartu Keluarga and extract ALL information that is visible.

Return ONLY valid JSON.
Do NOT use markdown.
Do NOT add explanations.
Do NOT add fields that are not in the schema.

The JSON MUST follow this exact structure:

{
  "no": string,
  "kepala_keluarga": string,
  "alamat": string,
  "rt": string | null,
  "rw": string | null,
  "kecamatan": string | null,
  "kabupaten_kota": string | null,
  "kode_pos": string | null,
  "provinsi": string | null,
  "anggota": [
    {
      "nama_lengkap": string | null,
      "nik": string | null,
      "jenis_kelamin": "LAKI-LAKI" | "PEREMPUAN",
      "tempat_lahir": string | null,
      "tanggal_lahir": string | null,
      "agama": string | null,
      "pendidikan": string | null,
      "jenis_pekerjaan": string | null,
      "golongan_darah": string | null,
      "status_perkawinan": "KAWIN TERCATAT" | "KAWIN BELUM TERCATAT" | "CERAI TERCATAT" | "CERAI BELUM TERCATAT" | "CERAI MATI" | "BELUM KAWIN",
      "tanggal_perkawinan": string | null,
      "status_hubungan_dalam_keluarga": string | null,
      "kewarganegaraan": string | null,
      "paspor": string | null,
      "kitap": string | null,
      "ayah": string | null,
      "ibu": string | null
    }
  ]
}

## DOCUMENT

The document is an Indonesian Kartu Keluarga.

The KK normally contains:

HEADER INFORMATION:
- Nomor Kartu Keluarga
- Nama Kepala Keluarga
- Alamat
- RT
- RW
- Desa/Kelurahan
- Kecamatan
- Kabupaten/Kota
- Provinsi

MEMBER TABLE:
Each row represents ONE family member.

The member table can contain columns such as:
- Nama Lengkap
- NIK
- Jenis Kelamin
- Tempat Lahir
- Tanggal Lahir
- Agama
- Pendidikan
- Jenis Pekerjaan
- Golongan Darah
- Status Perkawinan
- Tanggal Perkawinan
- Status Hubungan Dalam Keluarga
- Kewarganegaraan
- Dokumen Imigrasi / Paspor
- Nama Ayah
- Nama Ibu

## EXTRACTION RULES

1. Extract the data from the image exactly as written whenever possible.

2. DO NOT invent, infer, or hallucinate values.

3. If a value is not visible, unreadable, or does not exist, return null.

4. Preserve Indonesian names exactly as they appear.

5. Do NOT confuse the NIK with the Nomor Kartu Keluarga.
   - "no" = Nomor Kartu Keluarga.
   - "nik" = NIK of the individual family member.
   - Both normally contain exactly 16 digits.

6. Preserve leading zeroes in "no" and "nik".
   They MUST be returned as strings, never numbers.

7. "kepala_keluarga" is the value from the "Nama Kepala Keluarga" field in the KK header.
   Do not infer it from the first family member.

8. "alamat" should contain the address from the KK header.
   Do not combine unrelated administrative fields into the address.

9. Extract RT and RW separately.
   Example:
   RT: 003
   RW: 007

10. For "anggota", create exactly ONE object for EACH visible family member row.

11. Preserve the order of family members as they appear in the document.

12. Do not skip a family member just because some fields are unreadable.
    Include the member and set unreadable fields to null.

13. For "jenis_kelamin", normalize the value:
    - L / LAKI-LAKI / LAKI LAKI → "LAKI-LAKI"
    - P / PEREMPUAN → "PEREMPUAN"

14. For "status_perkawinan", normalize only to one of these exact values:
    - "KAWIN TERCATAT"
    - "KAWIN BELUM TERCATAT"
    - "CERAI TERCATAT"
    - "CERAI BELUM TERCATAT"
    - "CERAI MATI"
    - "BELUM KAWIN"

    If the document contains a value that clearly corresponds to one of these, normalize it.
    If it cannot be determined reliably, return null.

15. Dates:
    - Extract dates exactly when possible.
    - Convert dates to ISO 8601 format:
      YYYY-MM-DDT00:00:00.000Z
    - Example:
      "15-04-1990" → "1990-04-15T00:00:00.000Z"
    - If a date contains a time, preserve the time when reliably readable.
    - If the date cannot be determined, return null.

16. "tanggal_perkawinan" refers specifically to the marriage date.
    Do NOT use the person's birth date.

17. "tempat_lahir" and "tanggal_lahir" are separate fields.
    Example:
    "SURABAYA, 15-04-1990"
    becomes:
    "tempat_lahir": "SURABAYA"
    "tanggal_lahir": "1990-04-15T00:00:00.000Z"

18. "status_hubungan_dalam_keluarga" should contain values such as:
    - KEPALA KELUARGA
    - ISTRI
    - ANAK
    - MENANTU
    - CUCU
    - ORANG TUA
    - MERTUA
    - FAMILI LAIN
    Preserve the document's wording when possible.

19. "kewarganegaraan" should contain the citizenship value, for example:
    - WNI
    - WNA

20. "paspor" should contain the passport number if present.
    Otherwise null.

21. "kitap" should contain the KITAP number if present.
    Otherwise null.

22. "ayah" and "ibu" must contain the names from the "Nama Ayah" and "Nama Ibu" columns.
    Do NOT infer parents from the family relationship.

23. Be extremely careful with OCR of digits.
    For NIK and KK number, distinguish:
    - 0 vs O
    - 1 vs I
    - 5 vs S
    - 8 vs B
    - 6 vs G

24. Never convert an NIK or KK number to a numeric JSON value.
    Always return it as a string.

25. If the image contains multiple pages of the same KK, extract all visible family members across the pages.

26. Ignore unrelated text, logos, government slogans, document metadata, QR codes, signatures, and decorative elements unless they correspond to one of the requested fields.

## IMPORTANT

The most important requirement is accuracy.

Do not guess missing information.
Do not create fake values.
Do not summarize the document.
Do not return OCR text outside the requested JSON structure.

Return ONLY the JSON object.
`,
          images,
        },
      ],
      stream: false,

    }),

  });
  const json = await res.json();
  return json.message?.content
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ message: 'File is required' }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    let images: string[];

    if (file.type.startsWith('image/')) {
      images = [
        buffer.toString('base64'),
      ];
    } else {
      return NextResponse.json(
        {
          message: `Unsupported file type: ${file.type}`,
        },
        { status: 400 },
      );
    }
    // 1️⃣ First LLM call
    let text = await callLLM(images);
    text = text.replace(/^\s*```json\s*/i, '')
      .replace(/\s*```\s*$/i, '')
    console.log(text)
    let parsed: any;

    // 2️⃣ Try parse JSON
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON from LLM');
    }

    // 3️⃣ Validate with Zod
    let result = kkScanSchema.safeParse(parsed);
    console.log(result.error?.flatten())
    // 4️⃣ If fail → fix locally
    if (!result.success) {
      parsed = fixLLMOutput(parsed);
      result = kkScanSchema.safeParse(parsed);
    }

    // 5️⃣ If still fail → retry LLM with error feedback
    if (!result.success) {
      const retryText = await callLLM(
        images,
        `
Fix this JSON to match schema. Return ONLY JSON.

Invalid JSON:
${JSON.stringify(parsed)}

Errors:
${JSON.stringify(result.error.flatten())}
        `
      );

      try {
        parsed = JSON.parse(retryText);
      } catch {
        throw new Error('Retry JSON parse failed');
      }

      parsed = kkScanSchema.parse(parsed);
    }

    return NextResponse.json({ data: parsed });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error processing receipt' }, { status: 500 });
  }
}