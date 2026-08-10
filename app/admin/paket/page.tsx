import React from 'react';
import { prisma } from '@/lib/prisma';
import AdminLayout from '@/components/AdminLayout';
import AdminPaketTable from '@/components/AdminPaketTable';

export const metadata = {
  title: 'Kelola Paket - Admin Suntik Sosmed ID',
};

/**
 * Halaman Manajemen Paket Etalase Admin (Server Component)
 */
export default async function AdminPaketPage() {
  const paketList = await prisma.paket.findMany({
    orderBy: [{ urutan: 'asc' }, { kode_paket: 'asc' }],
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Manajemen Paket Etalase</h1>
          <p className="text-xs text-slate-400">
            Tambah, edit, nonaktifkan, atau atur urutan paket sosial media. Perubahan langsung berpengaruh ke Website & WhatsApp Bot.
          </p>
        </div>

        <AdminPaketTable paketList={paketList} />
      </div>
    </AdminLayout>
  );
}
