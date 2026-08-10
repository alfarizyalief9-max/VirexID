import fs from 'fs';
import path from 'path';

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

import { getDumpediaProfile } from '../services/smmDumpedia';

async function test() {
  console.log('🔄 Memeriksa Koneksi & Saldo API Dumpedia.id...');
  console.log('API ID:', process.env.DUMPEDIA_API_ID);
  console.log('API Key:', process.env.DUMPEDIA_API_KEY ? '*****' : 'BELUM DIISI');

  const result = await getDumpediaProfile();
  console.log('\n📊 HASIL KONEKSI DUMPEDIA:');
  console.dir(result, { depth: null });
}

test();
