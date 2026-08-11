import React from 'react';
import { prisma } from '@/lib/prisma';
import AdminLayout from '@/components/AdminLayout';
import AdminOrderTable from '@/components/AdminOrderTable';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kelola Order - Admin VirexID',
};

/**
 * Halaman Manajemen Order Admin (Server Component)
 */
export default async function AdminOrderPage() {
  const orders = await prisma.order.findMany({
    orderBy: { dibuatPada: 'desc' },
    include: { paket: true },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Manajemen Pesanan / Order</h1>
          <p className="text-xs text-slate-400">
            Kelola pesanan pelanggan, ubah status, dan kirim notifikasi otomatis ke WhatsApp pelanggan.
          </p>
        </div>

        <AdminOrderTable orders={orders} />
      </div>
    </AdminLayout>
  );
}
