'use server';

import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { revalidatePath } from 'next/cache';
import { formatRupiah } from '@/lib/utils';
import { createDumpediaOrder, checkDumpediaOrderStatus } from '@/services/smmDumpedia';

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
    const idLayananStr = formData.get('id_layanan_provider') as string;
    const id_layanan_provider = idLayananStr && idLayananStr.trim() !== '' ? parseInt(idLayananStr, 10) : null;
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
        id_layanan_provider: id_layanan_provider && !isNaN(id_layanan_provider) ? id_layanan_provider : null,
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
    const idLayananStr = formData.get('id_layanan_provider') as string;
    const id_layanan_provider = idLayananStr && idLayananStr.trim() !== '' ? parseInt(idLayananStr, 10) : null;
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
        id_layanan_provider: id_layanan_provider && !isNaN(id_layanan_provider) ? id_layanan_provider : null,
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

/**
 * SERVER ACTION: Proses/Tembak Order ke Provider SMM Dumpedia.id
 */
export async function processDumpediaOrderAction(orderId: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { paket: true },
    });

    if (!order) {
      return { success: false, message: 'Order tidak ditemukan!' };
    }

    const serviceId = order.paket.id_layanan_provider || order.kode_paket;
    if (!serviceId) {
      return { success: false, message: 'Service ID / Kode Paket tidak valid untuk Dumpedia.' };
    }

    // Panggil Service API Dumpedia
    const result = await createDumpediaOrder({
      serviceId,
      targetLink: order.link_akun,
      quantity: order.jumlah || 1,
    });

    if (result.success && result.orderIdProvider) {
      // Update Database Lokal
      await prisma.order.update({
        where: { id: orderId },
        data: {
          id_order_provider: String(result.orderIdProvider),
          status_order: 'DIPROSES',
        },
      });

      // Kirim Notifikasi WA ke Pelanggan
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3001';
      const pesanWa =
        `🚀 *PESANAN SEDANG DIPROSES PROVIDER!*\n\n` +
        `No Invoice: *${order.no_invoice}*\n` +
        `ID Provider: #${result.orderIdProvider}\n` +
        `Paket: ${order.paket.nama_paket}\n` +
        `Target: ${order.link_akun}\n` +
        `Status: *DIPROSES*\n\n` +
        `Pesanan Anda telah diteruskan ke server provider SMM dan sedang dikerjakan. Terima kasih! 🙏`;

      try {
        await axios.post(`${gatewayUrl}/kirim-pesan`, {
          nomor: order.nomor_wa_pelanggan,
          pesan: pesanWa,
        });
      } catch (errWa: any) {
        console.warn('Peringatan: Gagal kirim WA Gateway:', errWa.message);
      }

      revalidatePath('/admin/order');
      revalidatePath('/admin/dashboard');
      return {
        success: true,
        message: `Berhasil dikirim ke Dumpedia! ID Order Provider: #${result.orderIdProvider}`,
      };
    } else {
      return {
        success: false,
        message: result.message || 'Gagal mengirim order ke Dumpedia.',
      };
    }
  } catch (error: any) {
    console.error('Error processDumpediaOrderAction:', error.message);
    return { success: false, message: 'Terjadi kesalahan internal saat menembak order ke Dumpedia.' };
  }
}

/**
 * SERVER ACTION: Cek Status Order Langsung dari Dumpedia.id
 */
export async function checkDumpediaOrderStatusAction(orderId: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.id_order_provider) {
      return { success: false, message: 'Order belum memiliki ID Ref Provider Dumpedia!' };
    }

    const result = await checkDumpediaOrderStatus(order.id_order_provider);

    if (result.success) {
      const statusDumpedia = result.data?.status || result.data?.status_order;
      let newStatusLokal = order.status_order;

      if (statusDumpedia) {
        const sUpper = String(statusDumpedia).toUpperCase();
        if (sUpper === 'SUCCESS' || sUpper === 'COMPLETED') {
          newStatusLokal = 'SELESAI';
        } else if (sUpper === 'ERROR' || sUpper === 'CANCELED' || sUpper === 'CANCELLED') {
          newStatusLokal = 'GAGAL';
        } else if (sUpper === 'PARTIAL') {
          newStatusLokal = 'REFUND';
        } else if (sUpper === 'PROCESSING' || sUpper === 'PENDING' || sUpper === 'IN PROGRESS') {
          newStatusLokal = 'DIPROSES';
        }

        if (newStatusLokal !== order.status_order) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status_order: newStatusLokal },
          });
          revalidatePath('/admin/order');
          revalidatePath('/admin/dashboard');
        }
      }

      return {
        success: true,
        statusData: result.data,
        message: `Status Dumpedia: ${statusDumpedia || 'OK'}`,
      };
    } else {
      return { success: false, message: result.message || 'Gagal mengecek status ke Dumpedia.' };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

