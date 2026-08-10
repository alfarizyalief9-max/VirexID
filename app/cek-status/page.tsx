'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getOrderStatusAction } from '@/app/actions/order';
import { formatRupiah } from '@/lib/utils';
import { Search, PackageCheck, Clock, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

/**
 * Halaman Pencarian Status Order berdasarkan No Invoice
 */
export default function CekStatusPage() {
  const [invoiceInput, setInvoiceInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setOrderResult(null);

    const res = await getOrderStatusAction(invoiceInput);
    setLoading(false);

    if (res.success && res.data) {
      setOrderResult(res.data);
    } else {
      setErrorMsg(res.message || 'Invoice tidak ditemukan');
    }
  };

  // Helper Warna Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MENUNGGU_BAYAR':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'SUDAH_BAYAR':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'DIPROSES':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'SELESAI':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'GAGAL':
      case 'REFUND':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full bg-blue-950 border border-blue-700/50 text-blue-300 text-xs font-bold">
            🔍 Realtime Tracking
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">Cek Status Pesanan</h1>
          <p className="text-sm text-slate-300">
            Masukkan Nomor Invoice Anda (contoh: <strong className="text-amber-400">INV1008001</strong>)
          </p>
        </div>

        {/* Form Search Invoice */}
        <form onSubmit={handleSearch} className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={invoiceInput}
              onChange={(e) => setInvoiceInput(e.target.value)}
              placeholder="Masukkan No Invoice (misal: INV1008001)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? 'Mencari...' : 'Cek Status'}</span>
          </button>
        </form>

        {/* Error Message Alert */}
        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-4 rounded-2xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Detail Result Card */}
        {orderResult && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-purple-500/40 shadow-2xl animate-fade-in">
            {/* Top Status Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">NOMOR INVOICE</span>
                <h2 className="text-2xl font-black font-mono text-amber-400 tracking-wider">
                  {orderResult.no_invoice}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold border ${getStatusBadge(
                    orderResult.status_order
                  )}`}
                >
                  {orderResult.status_order}
                </span>
              </div>
            </div>

            {/* Rincian Info Paket */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Platform & Kode Paket</span>
                <p className="font-bold text-slate-200">
                  {orderResult.platform} • [Kode {orderResult.kode_paket}]
                </p>
                <p className="text-xs text-purple-300">{orderResult.nama_paket}</p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Total Pembayaran</span>
                <p className="font-black text-xl text-emerald-400">
                  {formatRupiah(orderResult.total_harga)}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2">
                <span className="text-xs text-slate-400">Target Link Akun</span>
                <p className="font-mono text-xs text-slate-200 break-all flex items-center gap-2">
                  <span>{orderResult.link_akun}</span>
                  <a
                    href={
                      orderResult.link_akun.startsWith('http')
                        ? orderResult.link_akun
                        : `https://${orderResult.link_akun}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5 inline" />
                  </a>
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2">
                <span className="text-xs text-slate-400">Waktu Order Dibuat</span>
                <p className="text-xs text-slate-300 font-medium">
                  {new Date(orderResult.dibuatPada).toLocaleString('id-ID', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>

            {/* Catatan Admin Jika Ada */}
            {orderResult.catatan_admin && (
              <div className="bg-purple-950/60 border border-purple-800/60 p-4 rounded-2xl text-xs space-y-1 text-purple-200">
                <strong className="block font-bold text-purple-300">📌 Catatan Admin:</strong>
                <p>{orderResult.catatan_admin}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
