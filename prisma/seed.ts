import 'dotenv/config'
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";



async function main() {
  console.log("🌱 Cleaning database...");
  await prisma.cashTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.duesBill.deleteMany();
  await prisma.duesPeriod.deleteMany();
  await prisma.duesType.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();
  await prisma.resident.deleteMany();
  await prisma.familyCard.deleteMany();

  console.log("🔑 Creating users and families...");
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const wargaPassword = await bcrypt.hash("warga123", salt);

  // 1. Admin User
  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // 2. Family Cards
  const kk1 = await prisma.familyCard.create({
    data: {
      nomorKK: "3276011203050001",
      kepalaKeluarga: "Budi Santoso",
      alamat: "Jl. Melati No. 12, RT 001/RW 005",
      rt: "001",
      rw: "005",
      kelurahan: "Sukamaju",
      kecamatan: "Cilodong",
      kota: "Depok",
      provinsi: "Jawa Barat",
      kodePos: "16415",
      statusRumah: "MILIK_SENDIRI",
      isActive: true,
    },
  });

  const kk2 = await prisma.familyCard.create({
    data: {
      nomorKK: "3276011203050002",
      kepalaKeluarga: "Joko Widodo",
      alamat: "Jl. Melati No. 14, RT 001/RW 005",
      rt: "001",
      rw: "005",
      kelurahan: "Sukamaju",
      kecamatan: "Cilodong",
      kota: "Depok",
      provinsi: "Jawa Barat",
      kodePos: "16415",
      statusRumah: "MILIK_SENDIRI",
      isActive: true,
    },
  });

  const kk3 = await prisma.familyCard.create({
    data: {
      nomorKK: "3276011203050003",
      kepalaKeluarga: "Hendra Gunawan",
      alamat: "Jl. Melati No. 15, RT 001/RW 005",
      rt: "001",
      rw: "005",
      kelurahan: "Sukamaju",
      kecamatan: "Cilodong",
      kota: "Depok",
      provinsi: "Jawa Barat",
      kodePos: "16415",
      statusRumah: "SEWA_KONTRAK",
      isActive: true,
    },
  });

  const kk4 = await prisma.familyCard.create({
    data: {
      nomorKK: "3276011203050004",
      kepalaKeluarga: "Agus Setiawan",
      alamat: "Jl. Mawar No. 03, RT 001/RW 005",
      rt: "001",
      rw: "005",
      kelurahan: "Sukamaju",
      kecamatan: "Cilodong",
      kota: "Depok",
      provinsi: "Jawa Barat",
      kodePos: "16415",
      statusRumah: "MILIK_SENDIRI",
      isActive: true,
    },
  });

  // 3. Residents
  // KK 1 Residents
  const budi = await prisma.resident.create({
    data: {
      nik: "3276011203850001",
      nama: "Budi Santoso",
      familyCardId: kk1.id,
      hubunganKeluarga: "KEPALA_KELUARGA",
      jenisKelamin: "LAKI-LAKI",
      tempatLahir: "Jakarta",
      tanggalLahir: new Date("1985-03-12"),
      agama: "ISLAM",
      statusPerkawinan: "KAWIN",
      pekerjaan: "Karyawan Swasta",
      noTelepon: "081234567890",
      statusWarga: "AKTIF",
      tanggalMasuk: new Date("2020-01-10"),
    },
  });

  const siti = await prisma.resident.create({
    data: {
      nik: "3276014506880002",
      nama: "Siti Aminah",
      familyCardId: kk1.id,
      hubunganKeluarga: "ISTRI",
      jenisKelamin: "PEREMPUAN",
      tempatLahir: "Bandung",
      tanggalLahir: new Date("1988-06-15"),
      agama: "ISLAM",
      statusPerkawinan: "KAWIN",
      pekerjaan: "Wiraswasta",
      noTelepon: "081234567891",
      statusWarga: "AKTIF",
      tanggalMasuk: new Date("2020-01-10"),
    },
  });

  const rizky = await prisma.resident.create({
    data: {
      nik: "3276012010150003",
      nama: "Rizky Santoso",
      familyCardId: kk1.id,
      hubunganKeluarga: "ANAK",
      jenisKelamin: "LAKI-LAKI",
      tempatLahir: "Depok",
      tanggalLahir: new Date("2015-10-20"),
      agama: "ISLAM",
      statusPerkawinan: "BELUM_KAWIN",
      pekerjaan: "Pelajar",
      statusWarga: "AKTIF",
      tanggalMasuk: new Date("2020-01-10"),
    },
  });

  // KK 2 Residents
  const joko = await prisma.resident.create({
    data: {
      nik: "3276011405800001",
      nama: "Joko Widodo",
      familyCardId: kk2.id,
      hubunganKeluarga: "KEPALA_KELUARGA",
      jenisKelamin: "LAKI-LAKI",
      tempatLahir: "Solo",
      tanggalLahir: new Date("1980-05-14"),
      agama: "ISLAM",
      statusPerkawinan: "KAWIN",
      pekerjaan: "PNS",
      noTelepon: "081398765432",
      statusWarga: "AKTIF",
      tanggalMasuk: new Date("2018-05-01"),
    },
  });

  const dewi = await prisma.resident.create({
    data: {
      nik: "3276015509820002",
      nama: "Dewi Sartika",
      familyCardId: kk2.id,
      hubunganKeluarga: "ISTRI",
      jenisKelamin: "PEREMPUAN",
      tempatLahir: "Bogor",
      tanggalLahir: new Date("1982-09-15"),
      agama: "ISLAM",
      statusPerkawinan: "KAWIN",
      pekerjaan: "Guru",
      noTelepon: "081398765433",
      statusWarga: "AKTIF",
      tanggalMasuk: new Date("2018-05-01"),
    },
  });

  // KK 3 & KK 4 Residents
  const hendra = await prisma.resident.create({
    data: {
      nik: "3276012208900001",
      nama: "Hendra Gunawan",
      familyCardId: kk3.id,
      hubunganKeluarga: "KEPALA_KELUARGA",
      jenisKelamin: "LAKI-LAKI",
      tempatLahir: "Semarang",
      tanggalLahir: new Date("1990-08-22"),
      agama: "KRISTEN",
      statusPerkawinan: "KAWIN",
      pekerjaan: "Arsitek",
      noTelepon: "081122334455",
      statusWarga: "AKTIF",
      tanggalMasuk: new Date("2022-03-01"),
    },
  });

  const agus = await prisma.resident.create({
    data: {
      nik: "3276011001750001",
      nama: "Agus Setiawan",
      familyCardId: kk4.id,
      hubunganKeluarga: "KEPALA_KELUARGA",
      jenisKelamin: "LAKI-LAKI",
      tempatLahir: "Surabaya",
      tanggalLahir: new Date("1975-01-10"),
      agama: "ISLAM",
      statusPerkawinan: "CERAI_MATI",
      pekerjaan: "Pensiunan",
      noTelepon: "081566778899",
      statusWarga: "AKTIF",
      tanggalMasuk: new Date("2015-01-01"),
    },
  });

  // Link Warga Users
  await prisma.user.create({
    data: {
      username: "budi",
      password: wargaPassword,
      role: "WARGA",
      residentId: budi.id,
    },
  });

  await prisma.user.create({
    data: {
      username: "siti",
      password: wargaPassword,
      role: "WARGA",
      residentId: siti.id,
    },
  });

  await prisma.user.create({
    data: {
      username: "joko",
      password: wargaPassword,
      role: "WARGA",
      residentId: joko.id,
    },
  });

  // 4. Dues Types
  console.log("💳 Creating Dues Types & Periods...");
  const typeKebersihan = await prisma.duesType.create({
    data: {
      name: "Iuran Kebersihan & Sampah",
      code: "KEBERSIHAN",
      description: "Pengangkutan sampah 3x seminggu & kebersihan saluran air warga",
      amount: 35000,
      frequency: "MONTHLY",
      targetType: "PER_KK",
      isActive: true,
    },
  });

  const typeKeamanan = await prisma.duesType.create({
    data: {
      name: "Iuran Keamanan & Satpam",
      code: "KEAMANAN",
      description: "Gaji 2 petugas satpam, portal malam, dan pemeliharaan CCTV pos ronda",
      amount: 50000,
      frequency: "MONTHLY",
      targetType: "PER_KK",
      isActive: true,
    },
  });

  const typeAgustusan = await prisma.duesType.create({
    data: {
      name: "Iuran Peringatan HUT RI 2026",
      code: "AGUSTUSAN_2026",
      description: "Sumbangan kegiatan lomba, panggung gembira, dan konsumsi 17 Agustus",
      amount: 100000,
      frequency: "ONCE",
      targetType: "PER_KK",
      isActive: true,
    },
  });

  // Periods
  // Jan 2026
  const periodJanKebersihan = await prisma.duesPeriod.create({
    data: {
      duesTypeId: typeKebersihan.id,
      periodName: "Januari 2026",
      billingMonth: 1,
      billingYear: 2026,
      dueDate: new Date("2026-01-20"),
      amount: 35000,
      isClosed: true,
    },
  });

  const periodJanKeamanan = await prisma.duesPeriod.create({
    data: {
      duesTypeId: typeKeamanan.id,
      periodName: "Januari 2026",
      billingMonth: 1,
      billingYear: 2026,
      dueDate: new Date("2026-01-20"),
      amount: 50000,
      isClosed: true,
    },
  });

  // Feb 2026
  const periodFebKebersihan = await prisma.duesPeriod.create({
    data: {
      duesTypeId: typeKebersihan.id,
      periodName: "Februari 2026",
      billingMonth: 2,
      billingYear: 2026,
      dueDate: new Date("2026-02-20"),
      amount: 35000,
      isClosed: true,
    },
  });

  const periodFebKeamanan = await prisma.duesPeriod.create({
    data: {
      duesTypeId: typeKeamanan.id,
      periodName: "Februari 2026",
      billingMonth: 2,
      billingYear: 2026,
      dueDate: new Date("2026-02-20"),
      amount: 50000,
      isClosed: true,
    },
  });

  // Mar 2026
  const periodMarKebersihan = await prisma.duesPeriod.create({
    data: {
      duesTypeId: typeKebersihan.id,
      periodName: "Maret 2026",
      billingMonth: 3,
      billingYear: 2026,
      dueDate: new Date("2026-03-20"),
      amount: 35000,
      isClosed: false,
    },
  });

  const periodMarKeamanan = await prisma.duesPeriod.create({
    data: {
      duesTypeId: typeKeamanan.id,
      periodName: "Maret 2026",
      billingMonth: 3,
      billingYear: 2026,
      dueDate: new Date("2026-03-20"),
      amount: 50000,
      isClosed: false,
    },
  });

  // 5. Generate Bills & Sample Payments
  console.log("📝 Generating Bills & Recording Payments...");
  const kks = [kk1, kk2, kk3, kk4];

  // Helper to create bill + payment + cash transaction
  async function createBillAndOptionalPayment(period: any, kk: any, isPaid: any, paymentDate: any, paymentMethod = "CASH") {
    const bill = await prisma.duesBill.create({
      data: {
        periodId: period.id,
        targetFamilyCardId: kk.id,
        amount: period.amount,
        status: isPaid ? "PAID" : "UNPAID",
        paidAt: isPaid ? paymentDate : null,
      },
    });

    if (isPaid) {
      const payment = await prisma.payment.create({
        data: {
          billId: bill.id,
          amountPaid: period.amount,
          paymentDate: paymentDate,
          paymentMethod: paymentMethod,
          notes: `Pelunasan iuran ${period.periodName} - ${kk.kepalaKeluarga}`,
          recordedById: adminUser.id,
        },
      });

      await prisma.cashTransaction.create({
        data: {
          type: "INCOME",
          category: "IURAN_WARGA",
          amount: period.amount,
          description: `Penerimaan ${period.periodName} (${period.duesTypeId === typeKebersihan.id ? "Kebersihan" : "Keamanan"}) - KK ${kk.kepalaKeluarga}`,
          transactionDate: paymentDate,
          createdById: adminUser.id,
          paymentId: payment.id,
        },
      });
    }

    return bill;
  }

  // Jan Payments (all paid)
  for (const kk of kks) {
    await createBillAndOptionalPayment(periodJanKebersihan, kk, true, new Date("2026-01-10"), "TRANSFER");
    await createBillAndOptionalPayment(periodJanKeamanan, kk, true, new Date("2026-01-10"), "TRANSFER");
  }

  // Feb Payments (budi & joko paid, hendra paid kebersihan only, agus unpaid)
  await createBillAndOptionalPayment(periodFebKebersihan, kk1, true, new Date("2026-02-12"), "TRANSFER");
  await createBillAndOptionalPayment(periodFebKeamanan, kk1, true, new Date("2026-02-12"), "TRANSFER");

  await createBillAndOptionalPayment(periodFebKebersihan, kk2, true, new Date("2026-02-14"), "CASH");
  await createBillAndOptionalPayment(periodFebKeamanan, kk2, true, new Date("2026-02-14"), "CASH");

  await createBillAndOptionalPayment(periodFebKebersihan, kk3, true, new Date("2026-02-18"), "CASH");
  await createBillAndOptionalPayment(periodFebKeamanan, kk3, false, null); // Unpaid

  await createBillAndOptionalPayment(periodFebKebersihan, kk4, false, null); // Unpaid
  await createBillAndOptionalPayment(periodFebKeamanan, kk4, false, null); // Unpaid

  // Mar Payments (active month: budi paid kebersihan, others pending)
  await createBillAndOptionalPayment(periodMarKebersihan, kk1, true, new Date("2026-03-05"), "TRANSFER");
  await createBillAndOptionalPayment(periodMarKeamanan, kk1, false, null);

  await createBillAndOptionalPayment(periodMarKebersihan, kk2, false, null);
  await createBillAndOptionalPayment(periodMarKeamanan, kk2, false, null);

  await createBillAndOptionalPayment(periodMarKebersihan, kk3, false, null);
  await createBillAndOptionalPayment(periodMarKeamanan, kk3, false, null);

  await createBillAndOptionalPayment(periodMarKebersihan, kk4, false, null);
  await createBillAndOptionalPayment(periodMarKeamanan, kk4, false, null);

  // 6. Additional Cash Transactions (Saldo Awal, Donasi, Pengeluaran Operasional)
  console.log("💰 Creating Cash Transactions...");
  await prisma.cashTransaction.create({
    data: {
      type: "INCOME",
      category: "DONASI",
      amount: 1500000,
      description: "Saldo kas awal periode 2026 dari kepengurusan sebelumnya",
      transactionDate: new Date("2026-01-01"),
      createdById: adminUser.id,
    },
  });

  await prisma.cashTransaction.create({
    data: {
      type: "INCOME",
      category: "DONASI",
      amount: 500000,
      description: "Donasi sukarela warga (Bpk. Joko Widodo) untuk penerangan jalan",
      transactionDate: new Date("2026-01-15"),
      createdById: adminUser.id,
    },
  });

  await prisma.cashTransaction.create({
    data: {
      type: "EXPENSE",
      category: "OPERASIONAL",
      amount: 300000,
      description: "Gaji 2 petugas satpam & Hansip (Bulan Januari)",
      transactionDate: new Date("2026-01-31"),
      createdById: adminUser.id,
    },
  });

  await prisma.cashTransaction.create({
    data: {
      type: "EXPENSE",
      category: "PEMELIHARAAN",
      amount: 175000,
      description: "Penggantian 3 buah lampu LED jalan gang Melati & fitting",
      transactionDate: new Date("2026-02-05"),
      createdById: adminUser.id,
    },
  });

  await prisma.cashTransaction.create({
    data: {
      type: "EXPENSE",
      category: "OPERASIONAL",
      amount: 300000,
      description: "Gaji 2 petugas satpam & Hansip (Bulan Februari)",
      transactionDate: new Date("2026-02-28"),
      createdById: adminUser.id,
    },
  });

  await prisma.cashTransaction.create({
    data: {
      type: "EXPENSE",
      category: "KEGIATAN",
      amount: 250000,
      description: "Konsumsi & snack kerja bakti kebersihan selokan RT 01",
      transactionDate: new Date("2026-03-01"),
      createdById: adminUser.id,
    },
  });

  // 7. Announcements
  console.log("📢 Creating Announcements...");
  await prisma.announcement.create({
    data: {
      title: "Kerja Bakti Bersama & Fogging Nyamuk DBD",
      content: "Diberitahukan kepada seluruh warga RT 001/RW 005 bahwa pada hari Minggu mendatang akan diadakan kerja bakti pembersihan selokan serentak dan pengasapan (fogging) antisipasi DBD. Mohon seluruh warga berpartisipasi dan menjaga kebersihan lingkungan rumah masing-masing.",
      priority: "IMPORTANT",
      status: "PUBLISHED",
      publishDate: new Date("2026-03-02"),
      authorId: adminUser.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Jadwal Pengangkutan Sampah Selama Bulan Ramadhan",
      content: "Pengangkutan sampah warga selama bulan suci Ramadhan akan dimajukan menjadi pukul 06.00 - 08.00 WIB setiap hari Senin, Rabu, dan Sabtu. Mohon kantong sampah diletakkan di depan pagar sebelum pukul 06.00 WIB.",
      priority: "NORMAL",
      status: "PUBLISHED",
      publishDate: new Date("2026-02-25"),
      authorId: adminUser.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Laporan Keuangan Kas Lingkungan Triwulan I Telah Diperbarui",
      content: "Pengurus RT 001 telah mempublikasikan pembukuan kas RT periode Januari - Februari 2026. Warga dapat melihat rincian kas transparan melalui menu Kas RT di aplikasi ini.",
      priority: "NORMAL",
      status: "PUBLISHED",
      publishDate: new Date("2026-03-01"),
      authorId: adminUser.id,
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
