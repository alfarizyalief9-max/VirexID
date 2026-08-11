import React from 'react';
import { prisma } from '@/lib/prisma';
import AdminLayout from '@/components/AdminLayout';
import AdminPengaturanForm from '@/components/AdminPengaturanForm';

export const metadata = {
  title: 'Pengaturan Toko - Admin VirexID',
};

/**
 * Halaman Pengaturan Toko Admin (Server Component)
 */
export default async function AdminPengaturanPage() {
  const pengaturanList = await prisma.pengaturan.findMany();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Pengaturan Toko & WhatsApp Bot</h1>
          <p className="text-xs text-slate-400">
            Ubah nama toko, info rekening pembayaran, nomor WA admin penerima notifikasi order, serta teks jawaban otomatis bot.
          </p>
        </div>

        <AdminPengaturanForm pengaturanList={pengaturanList} />
      </div>
    </AdminLayout>
  );
}
