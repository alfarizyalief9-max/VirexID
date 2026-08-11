/**
 * WA GATEWAY SERVICE & BOT AUTOMATION SUNTIK SOSMED ID
 * Stack: @whiskeysockets/baileys + Express.js + Prisma ORM + SQLite
 * Port Service: 3001
 */

const express = require('express');
const cors = require('cors');
const qrcodeTerminal = require('qrcode-terminal');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
} = require('@whiskeysockets/baileys');
const { PrismaClient } = require('@prisma/client');

// Inisialisasi Prisma Client untuk koneksi DB SQLite
const prisma = new PrismaClient();

// Inisialisasi Express App
const app = express();
const PORT = process.env.PORT_GATEWAY || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Variabel Status Koneksi & QR Code
let sock = null;
let qrCodeText = null;
let connectionStatus = 'DISCONNECTED'; // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
let botUserNomor = '';

// Logger Pino mode silent agar terminal tetap bersih
const logger = pino({ level: 'silent' });

/**
 * HELPER: Format Nomor WA ke format standar Indonesia (628xxx@s.whatsapp.net)
 */
function formatWAJid(nomor) {
  if (!nomor) return '';
  let bersih = nomor.replace(/\D/g, '');
  if (bersih.startsWith('0')) {
    bersih = '62' + bersih.substring(1);
  }
  if (!bersih.endsWith('@s.whatsapp.net')) {
    bersih = bersih + '@s.whatsapp.net';
  }
  return bersih;
}

/**
 * HELPER: Format Nomor WA hanya Angka murni (contoh: 6281234567890)
 */
function cleanWA(nomor) {
  if (!nomor) return '';
  let bersih = nomor.replace(/\D/g, '');
  if (bersih.startsWith('0')) {
    bersih = '62' + bersih.substring(1);
  }
  return bersih;
}

/**
 * HELPER: Format Angka Nominal ke Mata Uang Rupiah
 */
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(angka);
}

/**
 * HELPER: Generate Nomor Invoice Unik (INV + DDMM + 3-digit acak/urut)
 */
function generateInvoiceNumber() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const randomDigits = Math.floor(100 + Math.random() * 900);
  return `INV${day}${month}${randomDigits}`;
}

/**
 * HELPER: Ambil Nilai Pengaturan dari Database SQLite
 */
async function getPengaturan(kunci, fallback = '') {
  try {
    const data = await prisma.pengaturan.findUnique({
      where: { kunci },
    });
    return data ? data.nilai : fallback;
  } catch (error) {
    console.error(`Error mengambil pengaturan ${kunci}:`, error.message);
    return fallback;
  }
}

/**
 * HELPER: Kirim Notifikasi ke Nomor Admin WA
 */
async function notifyAdmin(pesanTeks) {
  try {
    const nomorAdmin = await getPengaturan('NOMOR_ADMIN_WA', process.env.NOMOR_ADMIN_WA || '6281234567890');
    if (sock && connectionStatus === 'CONNECTED' && nomorAdmin) {
      const jid = formatWAJid(nomorAdmin);
      await sock.sendMessage(jid, { text: `🚨 *[NOTIFIKASI SYSTEM ADMIN]*\n\n${pesanTeks}` });
    }
  } catch (err) {
    console.error('Gagal kirim notif admin:', err.message);
  }
}

/**
 * FUNGSI UTAMA KONEKSI BAILEYS WA GATEWAY
 */
async function connectToWhatsApp() {
  connectionStatus = 'CONNECTING';

  // Folder tempat menyimpan sesi login Baileys
  const authFolder = path.join(__dirname, 'auth_wa');
  if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    browser: ['VirexID-Gateway', 'Chrome', '1.0.0'],
    syncFullHistory: false,
  });

  // Event handler pembaruan kredensial sesi
  sock.ev.on('creds.update', saveCreds);

  // Event handler perubahan status koneksi
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodeText = qr;
      console.log('\n========================================');
      console.log('📱 SCAN QR CODE DENGAN WHATSAPP ANDA:');
      console.log('========================================\n');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'close') {
      connectionStatus = 'DISCONNECTED';
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(`❌ WA Gateway Terputus (Status Code: ${statusCode}). Mencoba reconnect...`);

      if (shouldReconnect) {
        // Reconnect otomatis dengan delay 3 detik
        setTimeout(() => {
          connectToWhatsApp();
        }, 3000);
      } else {
        console.log('⚠️ Sesi WA telah Logged Out. Hapus folder gateway/auth_wa dan scan ulang.');
      }
    } else if (connection === 'open') {
      connectionStatus = 'CONNECTED';
      qrCodeText = null;
      botUserNomor = cleanWA(sock.user?.id || '');
      console.log(`\n✅ WA GATEWAY BERHASIL TERKONEKSI! Nomor Bot: ${botUserNomor}\n`);

      // Kirim Notifikasi ke Admin bahwa WA Gateway siap
      await notifyAdmin(`🟢 WA Gateway Berhasil Nyala dan Terkoneksi!\nNomor Bot: ${botUserNomor}`);
    }
  });

  // Event handler pesan masuk
  sock.ev.on('messages.upsert', async (m) => {
    try {
      if (m.type !== 'notify') return;

      for (const msg of m.messages) {
        // Abaikan pesan yang dikirim dari bot sendiri & abaikan pesan grup WA
        if (msg.key.fromMe) continue;
        const remoteJid = msg.key.remoteJid;
        if (!remoteJid || remoteJid.endsWith('@g.us')) continue; // Abaikan Grup!

        const nomorPengirim = cleanWA(remoteJid);
        const namaPengirim = msg.pushName || 'Pelanggan';

        // Deteksi jenis konten pesan (Teks / Gambar)
        const textMessage =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.imageMessage?.caption ||
          '';

        const hasImage = !!msg.message?.imageMessage;

        // 1. Simpan Log Pesan Masuk ke Database Prisma
        await prisma.logPesanWa.create({
          data: {
            nomor_pengirim: nomorPengirim,
            nomor_tujuan: botUserNomor || 'GATEWAY',
            isi_pesan: textMessage || (hasImage ? '[FOTO/BUKTI BAYAR]' : '[MEDIA]'),
            tipe: 'MASUK',
            sudah_diproses: true,
          },
        });

        // 2. Buat / Ambil Data Pelanggan
        let pelanggan = await prisma.pelanggan.findUnique({
          where: { nomor_wa: nomorPengirim },
        });

        if (!pelanggan) {
          pelanggan = await prisma.pelanggan.create({
            data: {
              nomor_wa: nomorPengirim,
              nama: namaPengirim,
              total_order: 0,
            },
          });
        }

        // 3. LOGIKA BOT AUTO REPLY AUTOMATION

        // A. JIKA PELANGGAN MENGIRIM GAMBAR (BUKTI PEMBAYARAN)
        if (hasImage) {
          try {
            // Folder simpan bukti bayar
            const uploadDir = path.join(__dirname, '../public/uploads');
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileName = `bukti_${nomorPengirim}_${Date.now()}.jpg`;
            const filePath = path.join(uploadDir, fileName);

            // Download media dari Baileys
            const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger });
            fs.writeFileSync(filePath, buffer);

            const fileUrl = `/uploads/${fileName}`;

            // Cari order TERAKHIR milik pelanggan yang berstatus MENUNGGU_BAYAR / BARU
            const lastOrder = await prisma.order.findFirst({
              where: {
                nomor_wa_pelanggan: nomorPengirim,
                status_order: { in: ['MENUNGGU_BAYAR', 'BARU'] },
              },
              orderBy: { dibuatPada: 'desc' },
              include: { paket: true },
            });

            if (lastOrder) {
              // Update status order menjadi SUDAH_BAYAR dan simpan URL bukti bayar
              await prisma.order.update({
                where: { id: lastOrder.id },
                data: {
                  bukti_bayar_url: fileUrl,
                  status_order: 'SUDAH_BAYAR',
                },
              });

              // Balas ke Pelanggan
              const pesanBalasan =
                `✅ *BUKTI PEMBAYARAN DITERIMA!*\n\n` +
                `No Invoice: *${lastOrder.no_invoice}*\n` +
                `Paket: ${lastOrder.paket.nama_paket}\n` +
                `Total: ${formatRupiah(lastOrder.total_harga)}\n` +
                `Status: *SUDAH BAYAR (Menunggu Proses Admin)*\n\n` +
                `Pesanan Anda sedang diverifikasi admin dan akan segera diproses. Terima kasih! 🙏`;

              await sock.sendMessage(remoteJid, { text: pesanBalasan });

              // Forward Bukti Bayar & Detail Order ke ADMIN WA
              const nomorAdmin = await getPengaturan('NOMOR_ADMIN_WA', '6281234567890');
              const adminJid = formatWAJid(nomorAdmin);
              const pesanAdmin =
                `📥 *[BUKTI BAYAR MASUK]*\n\n` +
                `Invoice: *${lastOrder.no_invoice}*\n` +
                `Pelanggan: ${namaPengirim} (${nomorPengirim})\n` +
                `Paket: [Kode ${lastOrder.kode_paket}] ${lastOrder.paket.nama_paket}\n` +
                `Link Target: ${lastOrder.link_akun}\n` +
                `Total: ${formatRupiah(lastOrder.total_harga)}\n\n` +
                `Silakan cek admin dashboard untuk memproses order ini!`;

              await sock.sendMessage(adminJid, {
                image: buffer,
                caption: pesanAdmin,
              });
            } else {
              await sock.sendMessage(remoteJid, {
                text: '📷 Bukti bayar diterima, namun tidak ditemukan order aktif yang menunggu pembayaran. Silakan ketik *3* untuk cek invoice Anda atau hubungi admin.',
              });
            }
          } catch (errImg) {
            console.error('Error proses gambar bukti bayar:', errImg.message);
            await sock.sendMessage(remoteJid, {
              text: '❌ Gagal memproses gambar bukti pembayaran. Silakan coba kirim ulang.',
            });
          }
          continue;
        }

        // B. PEMROSESAN PESAN TEKS
        const pesanLower = textMessage.trim().toLowerCase();
        const namaToko = await getPengaturan('NAMA_TOKO', 'VirexID');

        // B1. DETEKSI FORMAT ORDER KODE ANGKA (contoh: ORDER 101 - instagram.com/user ATAU 101 - link ATAU kode 101 link)
        const orderMatch =
          pesanLower.match(/^(?:order\s+)?(\d{3})\s*[-:]?\s*(https?:\/\/\S+|\S+\.\S+)/i) ||
          pesanLower.match(/^kode\s+(\d{3})\s+(https?:\/\/\S+|\S+\.\S+)/i);

        if (orderMatch) {
          const kodePaketInput = parseInt(orderMatch[1], 10);
          const targetLink = orderMatch[2];

          // 1. Validasi Kode Paket ada di database SQLite
          const paketDB = await prisma.paket.findUnique({
            where: { kode_paket: kodePaketInput },
          });

          if (!paketDB || !paketDB.status_aktif) {
            await sock.sendMessage(remoteJid, {
              text: `❌ Paket dengan Kode *${kodePaketInput}* tidak ditemukan atau sedang tidak aktif.\n\nKetik *1* untuk melihat daftar paket aktif.`,
            });
            continue;
          }

          // 2. Buat Data Order Baru di database
          const newInvoice = generateInvoiceNumber();
          const newOrder = await prisma.order.create({
            data: {
              no_invoice: newInvoice,
              kode_paket: paketDB.kode_paket,
              paket_id: paketDB.id,
              pelanggan_id: pelanggan.id,
              nomor_wa_pelanggan: nomorPengirim,
              link_akun: targetLink,
              jumlah: 1,
              total_harga: paketDB.harga,
              status_order: 'MENUNGGU_BAYAR',
            },
          });

          // 3. Update total order pelanggan (+1)
          await prisma.pelanggan.update({
            where: { id: pelanggan.id },
            data: { total_order: { increment: 1 } },
          });

          // 4. Ambil Info Rekening dari Pengaturan
          const rekBCA = await getPengaturan('REKENING_BCA', 'BCA: 1234567890 a/n Admin');
          const rekDana = await getPengaturan('REKENING_DANA', 'DANA: 081234567890 a/n Admin');

          // 5. Balas Ke Pelanggan
          const balasanPelanggan =
            `🎉 *ORDER BERHASIL DIBUAT!*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📋 No Invoice: *${newInvoice}*\n` +
            `📦 Paket: [${paketDB.kode_paket}] ${paketDB.nama_paket}\n` +
            `⚡ Estimasi: ${paketDB.estimasi}\n` +
            `🔗 Link Target: ${targetLink}\n` +
            `💰 Total Harga: *${formatRupiah(paketDB.harga)}*\n` +
            `Status: ⌛ *MENUNGGU PEMBAYARAN*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `💳 *METODE PEMBAYARAN:*\n` +
            `1. ${rekBCA}\n` +
            `2. ${rekDana}\n\n` +
            `📌 *PETUNJUK:* Transfer sesuai nominal di atas, lalu kirim *FOTO BUKTI PEMBAYARAN* ke chat WhatsApp ini.`;

          await sock.sendMessage(remoteJid, { text: balasanPelanggan });

          // 6. FORWARD NOTIFIKASI ORDER BARU KE WA ADMIN
          const nomorAdmin = await getPengaturan('NOMOR_ADMIN_WA', '6281234567890');
          const adminJid = formatWAJid(nomorAdmin);
          const pesanForAdmin =
            `🛒 *[ORDERAN BARU MASUK]*\n\n` +
            `Invoice: *${newInvoice}*\n` +
            `Pelanggan: ${namaPengirim} (${nomorPengirim})\n` +
            `Paket: [Kode ${paketDB.kode_paket}] ${paketDB.nama_paket}\n` +
            `Target Link: ${targetLink}\n` +
            `Total: *${formatRupiah(paketDB.harga)}*\n` +
            `Status: MENUNGGU BAYAR`;

          await sock.sendMessage(adminJid, { text: pesanForAdmin });
          continue;
        }

        // B2. RESPON KATA KUNCI TERSTRUKTUR (MENU 1 - 5)

        // Menu 1: Daftar Paket dari DB
        if (pesanLower === '1' || pesanLower === 'paket' || pesanLower === 'daftar paket') {
          const daftarPaket = await prisma.paket.findMany({
            where: { status_aktif: true },
            orderBy: [{ urutan: 'asc' }, { kode_paket: 'asc' }],
          });

          let menuPaketText = `📱 *DAFTAR PAKET ${namaToko}*\n` + `━━━━━━━━━━━━━━━━━━━━\n\n`;

          let currentPlatform = '';
          for (const item of daftarPaket) {
            if (item.platform !== currentPlatform) {
              currentPlatform = item.platform;
              menuPaketText += `🔹 *PLATFORM: ${currentPlatform.toUpperCase()}*\n`;
            }
            menuPaketText +=
              `👉 Kode: *${item.kode_paket}* | ${item.nama_paket}\n` +
              `   Harga: *${formatRupiah(item.harga)}* | Est: ${item.estimasi}\n\n`;
          }

          menuPaketText +=
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📝 *CARA ORDER CEPAT:*\n` +
            `Balas dengan format:\n` +
            `*ORDER <KODE> - <LINK_AKUN>*\n\n` +
            `Contoh:\n` +
            `*ORDER 101 - instagram.com/username*`;

          await sock.sendMessage(remoteJid, { text: menuPaketText });
          continue;
        }

        // Menu 2: Cara Order & Data Rekening
        if (pesanLower === '2' || pesanLower === 'bayar' || pesanLower === 'rekening') {
          const caraOrder = await getPengaturan('CARA_ORDER', 'Pilih paket lalu order');
          const rekBCA = await getPengaturan('REKENING_BCA', 'BCA: 1234567890');
          const rekDana = await getPengaturan('REKENING_DANA', 'DANA: 081234567890');

          const textMenu2 =
            `💳 *CARA ORDER & METODE PEMBAYARAN*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `📌 *LANGKAH ORDER:*\n${caraOrder}\n\n` +
            `🏦 *REKENING PEMBAYARAN:*\n` +
            `• ${rekBCA}\n` +
            `• ${rekDana}\n\n` +
            `Setelah transfer, silakan kirim foto bukti transfer ke chat ini!`;

          await sock.sendMessage(remoteJid, { text: textMenu2 });
          continue;
        }

        // Menu 3: Cek Status Order Invoice
        if (pesanLower === '3' || pesanLower.startsWith('inv') || pesanLower.startsWith('cek status')) {
          // Jika pesan menyertakan nomor invoice (misal: INV1008001)
          const invMatch = textMessage.match(/INV\d+/i);
          if (invMatch) {
            const invoiceTarget = invMatch[0].toUpperCase();
            const orderDB = await prisma.order.findUnique({
              where: { no_invoice: invoiceTarget },
              include: { paket: true },
            });

            if (orderDB) {
              const statusText =
                `🔍 *DETAIL STATUS ORDER*\n` +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `Invoice: *${orderDB.no_invoice}*\n` +
                `Paket: [${orderDB.kode_paket}] ${orderDB.paket.nama_paket}\n` +
                `Target: ${orderDB.link_akun}\n` +
                `Total: ${formatRupiah(orderDB.total_harga)}\n` +
                `Status: *[${orderDB.status_order}]*\n` +
                `Tgl Order: ${new Date(orderDB.dibuatPada).toLocaleString('id-ID')}\n` +
                `━━━━━━━━━━━━━━━━━━━━`;
              await sock.sendMessage(remoteJid, { text: statusText });
            } else {
              await sock.sendMessage(remoteJid, {
                text: `❌ Nomor Invoice *${invoiceTarget}* tidak ditemukan di sistem kami.`,
              });
            }
          } else {
            await sock.sendMessage(remoteJid, {
              text: '🔍 Untuk mengecek status pesanan, silakan kirimkan *No Invoice* Anda (contoh: *INV1008001*).',
            });
          }
          continue;
        }

        // Menu 4: Info Garansi
        if (pesanLower === '4' || pesanLower === 'garansi') {
          const garansiInfo = await getPengaturan('GARANSI_INFO', 'Garansi refill 30 hari.');
          await sock.sendMessage(remoteJid, { text: garansiInfo });
          continue;
        }

        // Menu 5: Kontak Admin
        if (pesanLower === '5' || pesanLower === 'admin' || pesanLower === 'cs') {
          const nomorAdmin = await getPengaturan('NOMOR_ADMIN_WA', '6281234567890');
          const textAdmin =
            `👨‍💻 *HUBUNGI ADMIN CS ${namaToko}*\n\n` +
            `Jika mengalami kendala atau butuh bantuan khusus, hubungi admin kami via WA:\n` +
            `https://wa.me/${nomorAdmin}?text=Halo%20Admin,%20saya%20butuh%20bantuan`;
          await sock.sendMessage(remoteJid, { text: textAdmin });
          continue;
        }

        // MENU UTAMA (Sapaan default)
        const textMenuUtama =
          `🤖 *SELAMAT DATANG DI ${namaToko.toUpperCase()}*\n` +
          `Layanan Suntik Sosmed Otomatis 24 Jam Fast Process!\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `Silakan balas angka menu di bawah ini:\n\n` +
          `1️⃣ *Daftar Paket & Harga* (Kode Angka)\n` +
          `2️⃣ *Cara Order & Info Rekening*\n` +
          `3️⃣ *Cek Status Pesanan (No Invoice)*\n` +
          `4️⃣ *Informasi Garansi Layanan*\n` +
          `5️⃣ *Hubungi Customer Service / Admin*\n\n` +
          `⚡ *ORDER LANGSUNG:* Balas dengan format:\n` +
          `*ORDER <KODE_ANGKA> - <LINK_AKUN>*\n` +
          `Contoh: *ORDER 101 - instagram.com/username*`;

        await sock.sendMessage(remoteJid, { text: textMenuUtama });
      }
    } catch (errUpsert) {
      console.error('Error pemrosesan pesan WA:', errUpsert.message);
    }
  });
}

// INTI API ENDPOINTS EXPRESS HTTP FOR FRONTEND & ADMIN DASHBOARD

/**
 * GET /status -> Cek Status WA Gateway
 */
app.get('/status', (req, res) => {
  return res.json({
    status: connectionStatus,
    number: botUserNomor,
    qrAvailable: !!qrCodeText,
  });
});

/**
 * GET /qr -> Dapatkan QR Code Text
 */
app.get('/qr', (req, res) => {
  if (connectionStatus === 'CONNECTED') {
    return res.json({ status: 'CONNECTED', message: 'WA Gateway sudah terhubung!' });
  }
  return res.json({ status: connectionStatus, qr: qrCodeText });
});

/**
 * POST /kirim-pesan -> API Kirim Pesan WA (Dipanggil Admin / System)
 */
app.post('/kirim-pesan', async (req, res) => {
  try {
    const { nomor, pesan } = req.body;

    if (!nomor || !pesan) {
      return res.status(400).json({ success: false, message: 'Nomor dan pesan wajib diisi!' });
    }

    if (connectionStatus !== 'CONNECTED' || !sock) {
      return res.status(503).json({ success: false, message: 'WA Gateway belum terhubung!' });
    }

    const jid = formatWAJid(nomor);
    await sock.sendMessage(jid, { text: pesan });

    // Simpan ke Log Pesan WA (KELUAR)
    await prisma.logPesanWa.create({
      data: {
        nomor_pengirim: botUserNomor || 'SERVER',
        nomor_tujuan: cleanWA(nomor),
        isi_pesan: pesan,
        tipe: 'KELUAR',
        sudah_diproses: true,
      },
    });

    return res.json({ success: true, message: 'Pesan WA berhasil dikirim!' });
  } catch (error) {
    console.error('Error API /kirim-pesan:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /kirim-gambar -> API Kirim Gambar WA dengan Caption
 */
app.post('/kirim-gambar', async (req, res) => {
  try {
    const { nomor, url, caption } = req.body;

    if (!nomor || !url) {
      return res.status(400).json({ success: false, message: 'Nomor dan URL gambar wajib diisi!' });
    }

    if (connectionStatus !== 'CONNECTED' || !sock) {
      return res.status(503).json({ success: false, message: 'WA Gateway belum terhubung!' });
    }

    const jid = formatWAJid(nomor);
    await sock.sendMessage(jid, {
      image: { url },
      caption: caption || '',
    });

    return res.json({ success: true, message: 'Gambar berhasil dikirim!' });
  } catch (error) {
    console.error('Error API /kirim-gambar:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Jalankan Server Express HTTP Port 3001
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 WA GATEWAY API SERVER JALAN DI PORT ${PORT}`);
  console.log(`http://localhost:${PORT}/status`);
  console.log(`========================================\n`);

  // Jalankan Baileys Connection
  connectToWhatsApp();
});
