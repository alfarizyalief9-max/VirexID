import axios from 'axios';

/**
 * SERVICE INTEGRASI API DUMPEDIA SMM PANEL (dumpedia.id)
 * Dokumentasi API Dumpedia.id
 */

const DUMPEDIA_API_URL = process.env.SMM_API_URL || 'https://dumpedia.id/api/v1';

/**
 * HELPER: Mendapatkan Konfigurasi API ID & API Key Dumpedia dari Env / Pengaturan
 */
function getCredentials() {
  const apiId = process.env.DUMPEDIA_API_ID || process.env.SMM_API_ID || '';
  const apiKey = process.env.DUMPEDIA_API_KEY || process.env.SMM_API_KEY || '';
  return { apiId, apiKey };
}

/**
 * 1. CEK SALDO AKUN DUMPEDIA.ID
 */
export async function getDumpediaProfile() {
  try {
    const { apiId, apiKey } = getCredentials();
    if (!apiId || !apiKey) {
      return { success: false, message: 'DUMPEDIA_API_ID atau DUMPEDIA_API_KEY belum diisi di .env' };
    }

    const params = new URLSearchParams();
    params.append('api_id', apiId);
    params.append('api_key', apiKey);
    params.append('action', 'profile');

    const response = await axios.post(`${DUMPEDIA_API_URL}`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (response.data && response.data.status) {
      return {
        success: true,
        data: response.data.data, // Biasanya berisi saldo, nama akun, dll
      };
    } else {
      return {
        success: false,
        message: response.data?.data?.msg || response.data?.message || 'Gagal mengambil profil Dumpedia',
      };
    }
  } catch (error: any) {
    console.error('Error getDumpediaProfile:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * 2. TEMBAK ORDER BARU KE DUMPEDIA.ID
 */
export async function createDumpediaOrder({
  serviceId,
  targetLink,
  quantity,
}: {
  serviceId: string | number;
  targetLink: string;
  quantity: number;
}) {
  try {
    const { apiId, apiKey } = getCredentials();
    if (!apiId || !apiKey) {
      return { success: false, message: 'API ID / API Key Dumpedia belum dikonfigurasi di .env!' };
    }

    const params = new URLSearchParams();
    params.append('api_id', apiId);
    params.append('api_key', apiKey);
    params.append('action', 'add');
    params.append('service', String(serviceId));
    params.append('target', targetLink);
    params.append('quantity', String(quantity));

    const response = await axios.post(`${DUMPEDIA_API_URL}`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (response.data && response.data.status) {
      // Order Berhasil di Dumpedia
      const orderIdProvider = response.data.data?.id || response.data.data?.order_id || response.data.order_id;
      return {
        success: true,
        orderIdProvider: String(orderIdProvider),
        startCount: response.data.data?.start_count || 0,
        message: 'Berhasil membuat order di Dumpedia.id!',
      };
    } else {
      return {
        success: false,
        message: response.data?.data?.msg || response.data?.message || 'Order ditolak oleh Dumpedia',
      };
    }
  } catch (error: any) {
    console.error('Error createDumpediaOrder:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * 3. CEK STATUS ORDER DI DUMPEDIA.ID
 */
export async function checkDumpediaOrderStatus(orderIdProvider: string | number) {
  try {
    const { apiId, apiKey } = getCredentials();
    if (!apiId || !apiKey) {
      return { success: false, message: 'API Credentials Dumpedia belum diisi' };
    }

    const params = new URLSearchParams();
    params.append('api_id', apiId);
    params.append('api_key', apiKey);
    params.append('action', 'status');
    params.append('id', String(orderIdProvider));

    const response = await axios.post(`${DUMPEDIA_API_URL}`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (response.data && response.data.status) {
      return {
        success: true,
        data: response.data.data, // Status: Pending, Processing, Success, Error, Partial
      };
    } else {
      return {
        success: false,
        message: response.data?.data?.msg || 'Gagal mengecek status order Dumpedia',
      };
    }
  } catch (error: any) {
    console.error('Error checkDumpediaOrderStatus:', error.message);
    return { success: false, message: error.message };
  }
}
