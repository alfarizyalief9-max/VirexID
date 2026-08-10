import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script Seeder Awal untuk Mengisi Data Paket Sosial Media dan Pengaturan Toko
 */
async function main() {
  console.log('🌱 Memulai seeding data awal...');

  // 1. Data Paket Instagram (Kode 101 - 105)
  const paketInstagram = [
    {
      kode_paket: 101,
      platform: 'Instagram',
      nama_paket: 'Followers Instagram 1K (High Quality)',
      harga: 15000,
      estimasi: '1-15 Menit',
      garansi: '30 Hari Refill',
      butuh_password: false,
      status_aktif: true,
      urutan: 1,
    },
    {
      kode_paket: 102,
      platform: 'Instagram',
      nama_paket: 'Followers Instagram 5K (High Quality)',
      harga: 60000,
      estimasi: '1-30 Menit',
      garansi: '30 Hari Refill',
      butuh_password: false,
      status_aktif: true,
      urutan: 2,
    },
    {
      kode_paket: 103,
      platform: 'Instagram',
      nama_paket: 'Followers Instagram 10K (Sultan Pack)',
      harga: 110000,
      estimasi: '1-60 Menit',
      garansi: '30 Hari Refill',
      butuh_password: false,
      status_aktif: true,
      urutan: 3,
    },
    {
      kode_paket: 104,
      platform: 'Instagram',
      nama_paket: 'Likes Post Instagram 1K',
      harga: 8000,
      estimasi: '1-5 Menit',
      garansi: 'Garansi Permanen',
      butuh_password: false,
      status_aktif: true,
      urutan: 4,
    },
    {
      kode_paket: 105,
      platform: 'Instagram',
      nama_paket: 'Views Reels/Video 10K',
      harga: 10000,
      estimasi: 'Instant (1-3 Menit)',
      garansi: 'Garansi Permanen',
      butuh_password: false,
      status_aktif: true,
      urutan: 5,
    },
  ];

  // 2. Data Paket TikTok (Kode 201 - 204)
  const paketTikTok = [
    {
      kode_paket: 201,
      platform: 'TikTok',
      nama_paket: 'Followers TikTok 1K (Aktif Indo)',
      harga: 12000,
      estimasi: '5-15 Menit',
      garansi: '30 Hari Refill',
      butuh_password: false,
      status_aktif: true,
      urutan: 10,
    },
    {
      kode_paket: 202,
      platform: 'TikTok',
      nama_paket: 'Followers TikTok 5K (Super Cepat)',
      harga: 50000,
      estimasi: '10-30 Menit',
      garansi: '30 Hari Refill',
      butuh_password: false,
      status_aktif: true,
      urutan: 11,
    },
    {
      kode_paket: 203,
      platform: 'TikTok',
      nama_paket: 'Views Video TikTok 10K',
      harga: 7000,
      estimasi: 'Instant',
      garansi: 'No Drop',
      butuh_password: false,
      status_aktif: true,
      urutan: 12,
    },
    {
      kode_paket: 204,
      platform: 'TikTok',
      nama_paket: 'Views Video TikTok 100K (Viral Pack)',
      harga: 45000,
      estimasi: '1-10 Menit',
      garansi: 'No Drop',
      butuh_password: false,
      status_aktif: true,
      urutan: 13,
    },
  ];

  // 3. Data Paket YouTube (Kode 301 - 303)
  const paketYouTube = [
    {
      kode_paket: 301,
      platform: 'YouTube',
      nama_paket: 'Views Video YouTube 10K',
      harga: 18000,
      estimasi: '15-60 Menit',
      garansi: 'Garansi Lifetime',
      butuh_password: false,
      status_aktif: true,
      urutan: 20,
    },
    {
      kode_paket: 302,
      platform: 'YouTube',
      nama_paket: 'Subscribers YouTube 1K',
      harga: 45000,
      estimasi: '1-6 Jam',
      garansi: '30 Hari Refill',
      butuh_password: false,
      status_aktif: true,
      urutan: 21,
    },
    {
      kode_paket: 303,
      platform: 'YouTube',
      nama_paket: 'Likes Video YouTube 1K',
      harga: 12000,
      estimasi: '5-15 Menit',
      garansi: 'Permanen',
      butuh_password: false,
      status_aktif: true,
      urutan: 22,
    },
  ];

  // Upsert Paket ke Database
  const semuaPaket = [...paketInstagram, ...paketTikTok, ...paketYouTube];
  for (const item of semuaPaket) {
    await prisma.paket.upsert({
      where: { kode_paket: item.kode_paket },
      update: item,
      create: item,
    });
  }

  console.log(`✅ Berhasil seeding ${semuaPaket.length} data paket sosmed!`);

  // 4. Data Pengaturan Toko Awal
  const pengaturanAwal = [
    {
      kunci: 'NAMA_TOKO',
      nilai: 'SUNTIK SOSMED ID',
      keterangan: 'Nama Toko / Branding Utama',
    },
    {
      kunci: 'NOMOR_ADMIN_WA',
      nilai: '6281234567890',
      keterangan: 'Nomor WA Admin penerima forward notifikasi order',
    },
    {
      kunci: 'REKENING_BCA',
      nilai: 'BCA: 1234567890 a/n Admin Suntik Sosmed',
      keterangan: 'Info Rekening Bank BCA',
    },
    {
      kunci: 'REKENING_DANA',
      nilai: 'DANA/OVO/ShopeePay: 081234567890 a/n Admin Suntik Sosmed',
      keterangan: 'Info E-Wallet DANA / OVO / ShopeePay',
    },
    {
      kunci: 'CARA_ORDER',
      nilai:
        '1️⃣ Pilih Paket & Catat Kode Angka (contoh: 101)\n2️⃣ Kirim format chat ke WA ini:\n   ORDER <KODE> - <LINK_AKUN>\n   Contoh: ORDER 101 - instagram.com/username\n3️⃣ Lakukan pembayaran sesuai total invoice\n4️⃣ Kirim foto bukti pembayaran ke chat ini',
      keterangan: 'Panduan Cara Order untuk Balasan Bot Menu 2',
    },
    {
      kunci: 'GARANSI_INFO',
      nilai:
        '🛡️ *GARANSI RESMI SUNTIK SOSMED ID*\n\n- Layanan Followers & Subscribers dilengkapi Garansi Refill 30 Hari.\n- Jika terjadi penurunan (drop), cukup hubungi admin dengan melampirkan No Invoice.\n- Proses refill maksimal 1x24 jam tanpa biaya tambahan.',
      keterangan: 'Penjelasan Garansi untuk Balasan Bot Menu 4',
    },
  ];

  for (const p of pengaturanAwal) {
    await prisma.pengaturan.upsert({
      where: { kunci: p.kunci },
      update: p,
      create: p,
    });
  }

  console.log('✅ Berhasil seeding pengaturan awal toko!');
  console.log('🎉 Seeding selesai dengan sukses!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error Seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
