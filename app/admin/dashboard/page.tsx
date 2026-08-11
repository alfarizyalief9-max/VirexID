import React from 'react';
import { prisma } from '@/lib/prisma';
import AdminLayout from '@/components/AdminLayout';
import { formatRupiah } from '@/lib/utils';
import { ShoppingCart, DollarSign, Clock, Users, ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';

type OrderWithPaket = Prisma.OrderGetPayload<{
  include: { paket: true };
}>;

export const metadata = {
  title: 'Dashboard Admin - VirexID',
};

/**
 * Halaman Utama Admin Dashboard (Server Component)
 */
export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Stat Order Hari Ini
  const totalOrderHariIni = await prisma.order.count({
    where: {
      dibuatPada: { gte: startOfDay },
    },
  });

  // 2. Stat Omzet Hari Ini (Order status SUDAH_BAYAR, DIPROSES, SELESAI)
  const omzetGroup = await prisma.order.aggregate({
    where: {
      dibuatPada: { gte: startOfDay },
      status_order: { in: ['SUDAH_BAYAR', 'DIPROSES', 'SELESAI'] },
    },
    _sum: { total_harga: true },
  });
  const omzetHariIni = omzetGroup._sum.total_harga || 0;

  // 3. Stat Order Pending
  const orderPendingCount = await prisma.order.count({
    where: {
      status_order: { in: ['BARU', 'MENUNGGU_BAYAR'] },
    },
  });

  // 4. Jumlah Total Pelanggan
  const totalPelangganCount = await prisma.pelanggan.count();

  // 5. Ambil 5 Order Terbaru
  const latestOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { dibuatPada: 'desc' },
    include: { paket: true },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Dashboard Ikhtisar</h1>
            <p className="text-xs text-slate-400">Ringkasan transaksi dan performa bisnis sosmed hari ini.</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>WA Gateway Auto Sync</span>
          </div>
        </div>

        {/* 4 STAT CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Order Hari Ini */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Order Hari Ini</span>
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-100">{totalOrderHariIni} Transaksi</p>
          </div>

          {/* Card 2: Omzet Hari Ini */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Omzet Hari Ini</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400">{formatRupiah(omzetHariIni)}</p>
          </div>

          {/* Card 3: Order Pending */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Order Menunggu Bayar</span>
              <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-400">{orderPendingCount} Pesanan</p>
          </div>

          {/* Card 4: Total Pelanggan */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Pelanggan</span>
              <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-blue-400">{totalPelangganCount} Pelanggan</p>
          </div>
        </div>

        {/* TABEL 5 ORDER TERBARU */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">5 Transaksi Order Terbaru</h2>
              <p className="text-xs text-slate-400">Pesanan yang baru saja dilakukan pelanggan.</p>
            </div>
            <Link
              href="/admin/order"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Kelola Semua Order</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nomor WA</th>
                  <th className="py-3 px-4">Paket</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {latestOrders.map((ord: OrderWithPaket) => (
                  <tr key={ord.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{ord.no_invoice}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(ord.dibuatPada).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">{ord.nomor_wa_pelanggan}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-bold text-purple-300">[{ord.kode_paket}]</span> {ord.paket.nama_paket}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{formatRupiah(ord.total_harga)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          ord.status_order === 'SUDAH_BAYAR'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : ord.status_order === 'SELESAI'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : ord.status_order === 'MENUNGGU_BAYAR'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {ord.status_order}
                      </span>
                    </td>
                  </tr>
                ))}
                {latestOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Belum ada transaksi order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
