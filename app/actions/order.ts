'use server';

import { prisma } from '@/lib/prisma';

/**
 * Server Action: Cek Status Order berdasarkan No Invoice
 */
export async function getOrderStatusAction(noInvoiceInput: string) {
  try {
    if (!noInvoiceInput || noInvoiceInput.trim() === '') {
      return { success: false, message: 'Nomor Invoice wajib diisi!' };
    }

    const cleanInvoice = noInvoiceInput.trim().toUpperCase();

    const orderData = await prisma.order.findUnique({
      where: { no_invoice: cleanInvoice },
      include: { paket: true },
    });

    if (!orderData) {
      return { success: false, message: `Nomor Invoice ${cleanInvoice} tidak ditemukan.` };
    }

    return {
      success: true,
      data: {
        id: orderData.id,
        no_invoice: orderData.no_invoice,
        kode_paket: orderData.kode_paket,
        nama_paket: orderData.paket.nama_paket,
        platform: orderData.paket.platform,
        nomor_wa_pelanggan: orderData.nomor_wa_pelanggan,
        link_akun: orderData.link_akun,
        total_harga: orderData.total_harga,
        status_order: orderData.status_order,
        bukti_bayar_url: orderData.bukti_bayar_url,
        catatan_admin: orderData.catatan_admin,
        dibuatPada: orderData.dibuatPada,
        diupdatePada: orderData.diupdatePada,
      },
    };
  } catch (error: any) {
    console.error('Error getOrderStatusAction:', error.message);
    return { success: false, message: 'Terjadi kesalahan sistem saat mengecek invoice.' };
  }
}

/**
 * Helper: Generate Invoice Number
 */
function generateInvoiceNumber() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const randomDigits = Math.floor(100 + Math.random() * 900);
  return `INV${day}${month}${randomDigits}`;
}

/**
 * Server Action: Buat Transaksi Order Langsung dari Client Web
 */
export async function createWebOrderAction(formData: FormData) {
  try {
    const kode_paket = parseInt(formData.get('kode_paket') as string, 10);
    const nomor_wa = (formData.get('nomor_wa') as string || '').trim();
    const link_akun = (formData.get('link_akun') as string || '').trim();
    const jumlah = parseInt((formData.get('jumlah') as string) || '1', 10);

    if (isNaN(kode_paket) || !nomor_wa || !link_akun) {
      return { success: false, message: 'Harap isi semua bidang formulir dengan benar!' };
    }

    let cleanWa = nomor_wa.replace(/\D/g, '');
    if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);

    const paket = await prisma.paket.findUnique({
      where: { kode_paket },
    });

    if (!paket || !paket.status_aktif) {
      return { success: false, message: 'Paket tidak ditemukan atau sedang tidak aktif.' };
    }

    let pelanggan = await prisma.pelanggan.findUnique({
      where: { nomor_wa: cleanWa },
    });

    if (!pelanggan) {
      pelanggan = await prisma.pelanggan.create({
        data: {
          nomor_wa: cleanWa,
          total_order: 1,
        },
      });
    } else {
      await prisma.pelanggan.update({
        where: { id: pelanggan.id },
        data: { total_order: pelanggan.total_order + 1 },
      });
    }

    const no_invoice = generateInvoiceNumber();
    const total_harga = paket.harga * jumlah;

    const newOrder = await prisma.order.create({
      data: {
        no_invoice,
        kode_paket: paket.kode_paket,
        paket_id: paket.id,
        pelanggan_id: pelanggan.id,
        nomor_wa_pelanggan: cleanWa,
        link_akun,
        jumlah,
        total_harga,
        status_order: 'MENUNGGU_BAYAR',
      },
    });

    return {
      success: true,
      no_invoice: newOrder.no_invoice,
      total_harga,
      nama_paket: paket.nama_paket,
      message: 'Order berhasil dibuat!',
    };
  } catch (error: any) {
    console.error('Error createWebOrderAction:', error.message);
    return { success: false, message: 'Gagal membuat order: ' + error.message };
  }
}
