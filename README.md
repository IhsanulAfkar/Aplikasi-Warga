# Aplikasi Warga RT/RW (Mobile-First Web App)

Aplikasi web modern berbasis mobile untuk pengelolaan administrasi RT/RW (Rukun Tetangga / Rukun Warga) yang mencakup pendataan penduduk & kartu keluarga, pengelolaan iuran dinamis, kas lingkungan transparan, dan pengumuman digital.

---

## 📱 Tech Stack & Arsitektur

- **Framework:** Next.js 15 (App Router, Server Components & Server Actions)
- **Language:** TypeScript
- **Database:** SQLite (Demo) via Prisma ORM
- **Styling:** Tailwind CSS + Radix/shadcn design system
- **Icons:** Lucide React
- **Auth & Session:** Signed Cookie JWT (`jose`) + Password Hashing (`bcryptjs`)
- **Design:** Mobile-First Viewport Shell (375px - 430px) dengan Frame Mockup pada Desktop

---

## 🔑 Akun Demo Siap Pakai

| Peran (Role) | Username | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin RT** | `admin` | `admin123` | Akses penuh: Kelola KK/Warga, Iuran, Kas, Pengumuman |
| **Warga (Kepala Keluarga)** | `budi` | `warga123` | Akses Warga: Lihat tagihan saya, profil KK, kas publik |
| **Warga (Istri / Anggota)** | `siti` | `warga123` | Akses Warga: Profil anggota keluarga KK Budi Santoso |
| **Warga (Lainnya)** | `joko` | `warga123` | Akses Warga: KK Joko Widodo |

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat
- Node.js 18+ / 20+
- npm atau pnpm

### 2. Instalasi Dependencies
```bash
npm install
# atau
pnpm install
```

### 3. Setup Database & Seed Data
```bash
# Push schema ke database SQLite lokal
npx prisma db push

# Jalankan seeding data awal (Akun demo, KK, Warga, Iuran, Kas, Pengumuman)
node prisma/seed.js
```

### 4. Menjalankan Server Development
```bash
npm run dev
# atau
pnpm dev
```
Buka browser di: **`http://localhost:3000`**

---

## 🌟 Fitur Utama

### 1. Pendataan Warga & Kartu Keluarga (KK)
- Manajemen Kartu Keluarga (Nomor KK 16 digit, Kepala Keluarga, Alamat, Status Rumah).
- Manajemen Warga (NIK 16 digit, Hubungan Keluarga, Pekerjaan, No HP, Agama, Status Warga).
- Perlindungan privasi (Masking NIK & KK untuk akun warga: `3276********0001`).
- Pembuatan akun login instan untuk warga terdaftar oleh Admin.

### 2. Manajemen Iuran Dinamis
- Pembuatan Tipe Iuran dinamis (Kebersihan, Keamanan, Agustusan, Dana Sosial, dll).
- Siklus penagihan terpisah: Tipe Iuran $\rightarrow$ Periode Tagihan $\rightarrow$ Tagihan Warga.
- Otomatisasi generate tagihan massal ke seluruh KK / Warga aktif.
- Pencatatan pembayaran manual oleh Admin (Tunai / Transfer).
- Pelunasan iuran otomatis terhubung ke pembukuan Kas RT sebagai Pemasukan.

### 3. Manajemen Kas RT/RW Transparan
- Pembukuan Pemasukan (`INCOME`) dan Pengeluaran (`EXPENSE`).
- Saldo kas real-time dihitung secara dinamis (`Saldo = Total Pemasukan - Total Pengeluaran`).
- Mekanisme pembatalan / koreksi transaksi yang aman (`Reversal Transaction`).
- Portal transparansi kas untuk warga (grafik mutasi & histori publik).

### 4. Pengumuman Digital Lingkungan
- Siaran informasi RT dengan penanda prioritas **Penting** vs **Normal**.
- Status publikasi (Draft & Langsung Terbit).
- Feed pengumuman mobile yang ramah dibaca seluruh warga.

---

## 🔒 Keamanan & Role-Based Access Control (RBAC)

- Validasi role dilakukan secara **ketat di sisi server** (`requireAdmin`, `requireAuth`).
- Proteksi IDOR: Warga hanya diizinkan melihat data KK dan tagihan miliknya sendiri.
- Password di-hash menggunakan algoritma `bcryptjs` (salt 10 rounds).
- Token sesi disimpan dalam cookie `httpOnly` dan `sameSite: lax`.
