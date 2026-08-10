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
