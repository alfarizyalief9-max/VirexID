'use server';

import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { revalidatePath } from 'next/cache';
import { formatRupiah } from '@/lib/utils';

/**
 * SERVER ACTION: Ubah Status Order + Otomatis Kirim Notifikasi WA ke Pelanggan
 */
export async function updateOrderStatusAction(orderId: number, statusBaru: string, catatanAdmin?: string) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status_order: statusBaru,
        catatan_admin: catatanAdmin !== undefined ? catatanAdmin : undefined,
      },
      include: { paket: true },
    });

    // Otomatis Kirim Pesan WA ke Pelanggan via WA Gateway Port 3001
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3001';
    const nomorWa = updatedOrder.nomor_wa_pelanggan;

    let pesanWa = '';
    if (statusBaru === 'SUDAH_BAYAR') {
      pesanWa =
        `✅ *PEMBAYARAN DITERIMA!*\n\n` +
        `No Invoice: *${updatedOrder.no_invoice}*\n` +
        `Paket: [${updatedOrder.kode_paket}] ${updatedOrder.paket.nama_paket}\n` +
        `Status: *SUDAH BAYAR*\n\n` +
        `Pembayaran Anda telah kami verifikasi dan akan segera diproses ke sistem! Terimakasih.`;
    } else if (statusBaru === 'DIPROSES') {
      pesanWa =
        `🚀 *PESANAN SEDANG DIPROSES!*\n\n` +
        `No Invoice: *${updatedOrder.no_invoice}*\n` +
        `Paket: [${updatedOrder.kode_paket}] ${updatedOrder.paket.nama_paket}\n` +
        `Target: ${updatedOrder.link_akun}\n` +
        `Status: *DIPROSES SYSTEM*\n\n` +
        `Pesanan Anda sedang berjalan. Mohon tidak mengubah username/link akun selama proses berjalan.`;
    } else if (statusBaru === 'SELESAI') {
      pesanWa =
        `🎉 *PESANAN SELESAI!*\n\n` +
        `No Invoice: *${updatedOrder.no_invoice}*\n` +
        `Paket: [${updatedOrder.kode_paket}] ${updatedOrder.paket.nama_paket}\n` +
        `Status: ✅ *SELESAI (SUCCESS)*\n\n` +
        `Layanan Anda telah berhasil masuk 100%. Layanan ini dilindungi Garansi Refill. Terima kasih telah order di toko kami! 🙏`;
    } else if (statusBaru === 'GAGAL') {
      pesanWa =
        `❌ *PESANAN GAGAL / DIBATALKAN*\n\n` +
        `No Invoice: *${updatedOrder.no_invoice}*\n` +
        `Catatan: ${catatanAdmin || 'Link tidak valid / akun privat'}\n\n` +
        `Silakan hubungi customer service admin untuk info refund / perbaikan data.`;
    } else if (statusBaru === 'REFUND') {
      pesanWa =
        `💰 *PESANAN DIREFUND*\n\n` +
        `No Invoice: *${updatedOrder.no_invoice}*\n` +
        `Dana order Anda telah direfund. Silakan cek admin untuk konfirmasi penerimaan.`;
    }

    if (pesanWa) {
      try {
        await axios.post(`${gatewayUrl}/kirim-pesan`, {
          nomor: nomorWa,
          pesan: pesanWa,
        });
      } catch (errAxios: any) {
        console.error('Peringatan: Gagal mengirim notif WA Gateway (service mungkin mati):', errAxios.message);
      }
    }

    revalidatePath('/admin/order');
    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Status order berhasil diperbarui & notifikasi WA dikirim!' };
  } catch (error: any) {
    console.error('Error updateOrderStatusAction:', error.message);
    return { success: false, message: 'Gagal memperbarui status order.' };
  }
}

/**
 * SERVER ACTION: Hapus Order
 */
export async function deleteOrderAction(orderId: number) {
  try {
    await prisma.order.delete({ where: { id: orderId } });
    revalidatePath('/admin/order');
    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Order berhasil dihapus.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * SERVER ACTION: Tambah Paket Baru (Kode Paket Wajib Angka Unik)
 */
export async function createPaketAction(formData: FormData) {
  try {
    const kode_paket = parseInt(formData.get('kode_paket') as string, 10);
    const platform = formData.get('platform') as string;
    const nama_paket = formData.get('nama_paket') as string;
    const harga = parseInt(formData.get('harga') as string, 10);
    const estimasi = formData.get('estimasi') as string;
    const garansi = formData.get('garansi') as string;
    const urutan = parseInt((formData.get('urutan') as string) || '0', 10);
    const status_aktif = formData.get('status_aktif') === 'true';

    if (isNaN(kode_paket)) {
      return { success: false, message: 'Kode paket HARUS berupa angka murni!' };
    }

    // Cek duplikasi kode_paket
    const existing = await prisma.paket.findUnique({ where: { kode_paket } });
    if (existing) {
      return { success: false, message: `Kode paket ${kode_paket} sudah digunakan!` };
    }

    await prisma.paket.create({
      data: {
        kode_paket,
        platform,
        nama_paket,
        harga,
        estimasi,
        garansi,
        urutan,
        status_aktif,
      },
    });

    revalidatePath('/admin/paket');
    revalidatePath('/');
    return { success: true, message: 'Paket baru berhasil ditambahkan!' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * SERVER ACTION: Update Paket Existing
 */
export async function updatePaketAction(paketId: number, formData: FormData) {
  try {
    const platform = formData.get('platform') as string;
    const nama_paket = formData.get('nama_paket') as string;
    const harga = parseInt(formData.get('harga') as string, 10);
    const estimasi = formData.get('estimasi') as string;
    const garansi = formData.get('garansi') as string;
    const urutan = parseInt((formData.get('urutan') as string) || '0', 10);
    const status_aktif = formData.get('status_aktif') === 'true';

    await prisma.paket.update({
      where: { id: paketId },
      data: {
        platform,
        nama_paket,
        harga,
        estimasi,
        garansi,
        urutan,
        status_aktif,
      },
    });

    revalidatePath('/admin/paket');
    revalidatePath('/');
    return { success: true, message: 'Paket berhasil diperbarui!' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * SERVER ACTION: Hapus Paket
 */
export async function deletePaketAction(paketId: number) {
  try {
    await prisma.paket.delete({ where: { id: paketId } });
    revalidatePath('/admin/paket');
    revalidatePath('/');
    return { success: true, message: 'Paket berhasil dihapus.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * SERVER ACTION: Update Pengaturan Toko
 */
export async function updatePengaturanAction(kunci: string, nilai: string) {
  try {
    await prisma.pengaturan.upsert({
      where: { kunci },
      update: { nilai },
      create: { kunci, nilai, keterangan: `Setting ${kunci}` },
    });

    revalidatePath('/admin/pengaturan');
    revalidatePath('/');
    return { success: true, message: `Pengaturan ${kunci} berhasil disimpan!` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
