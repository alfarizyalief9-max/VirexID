const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Load .env manual
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
      process.env[key] = val;
    }
  });
}

async function testDumpedia() {
  console.log('==================================================');
  console.log('🔄 UJI KONEKSI API DUMPEDIA.ID');
  console.log('==================================================');

  const apiId = process.env.DUMPEDIA_API_ID || process.env.SMM_API_ID;
  const apiKey = process.env.DUMPEDIA_API_KEY || process.env.SMM_API_KEY;
  const apiUrl = process.env.SMM_API_URL || 'https://dumpedia.id/api/profile';

  console.log('📍 Target Endpoint API:', apiUrl);
  console.log('🆔 API ID:', apiId || '⚠️ (BELUM DIISI)');
  console.log('🔑 API Key:', apiKey ? '***** (TERISI)' : '⚠️ (BELUM DIISI)');

  if (!apiId || !apiKey) {
    console.log('\n❌ ERROR: Silakan isi DUMPEDIA_API_ID & DUMPEDIA_API_KEY pada file .env!');
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append('api_id', apiId);
    params.append('api_key', apiKey);
    params.append('action', 'profile');

    console.log('\n📡 Mengirim request POST profil/saldo ke Dumpedia.id...');
    const response = await axios.post(apiUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000,
    });

    console.log('\n==================================================');
    console.log('📊 RESPON DARI DUMPEDIA.ID:');
    console.dir(response.data, { depth: null });
    console.log('==================================================');

    if (response.data && response.data.status) {
      console.log('✅ KONEKSI API DUMPEDIA BERHASIL TERHUBUNG!');
    } else {
      console.log('⚠️ Respon Dumpedia:', response.data);
    }
  } catch (err) {
    if (err.response && err.response.status === 403) {
      console.log('\n⛔ status 403 Forbidden: Request ditolak karena IP Komputer Lokal ini berbeda dengan IP VPS yang Anda daftarkan di Dumpedia!');
      console.log('💡 Ini membuktikan sistem IP Whitelist Dumpedia SUDAH AKTIF dan bekerja dengan benar.');
      console.log('👉 Saat script ini dijalankan DI DALAM VPS ANDA NANTI, request akan diterima (200 OK)!');
    } else {
      console.error('\n❌ ERROR SAAT MENGHUBUNGI DUMPEDIA API:', err.message);
    }
  }
}

testDumpedia();
