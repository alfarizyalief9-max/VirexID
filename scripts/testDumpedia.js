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

async function testGet() {
  const apiId = process.env.DUMPEDIA_API_ID || process.env.SMM_API_ID;
  const apiKey = process.env.DUMPEDIA_API_KEY || process.env.SMM_API_KEY;

  console.log('🆔 API ID:', apiId);

  try {
    const url = `https://dumpedia.id/api/profile?api_id=${apiId}&api_key=${apiKey}`;
    console.log(`\n📡 GET Request: ${url}`);
    const response = await axios.get(url, { timeout: 5000 });
    console.log(`✅ Status GET: ${response.status}`);
    console.dir(response.data, { depth: null });
  } catch (err) {
    console.log(`❌ GET Error: ${err.message}`);
  }
}

testGet();
