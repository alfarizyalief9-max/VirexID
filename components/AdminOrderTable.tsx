'use client';

import React, { useState } from 'react';
import { updateOrderStatusAction, deleteOrderAction, processDumpediaOrderAction, checkDumpediaOrderStatusAction } from '@/app/actions/admin';
import { formatRupiah } from '@/lib/utils';
import { Search, Eye, Trash2, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Image as ImageIcon, Send, Zap } from 'lucide-react';

interface OrderItem {
  id: number;
  no_invoice: string;
  kode_paket: number;
  nomor_wa_pelanggan: string;
  link_akun: string;
  total_harga: number;
  status_order: string;
  bukti_bayar_url: string | null;
  catatan_admin: string | null;
  id_order_provider?: string | null;
  dibuatPada: Date | string;
  paket: {
    nama_paket: string;
    platform: string;
    id_layanan_provider?: number | null;
  };
}

interface AdminOrderTableProps {
  orders: OrderItem[];
}

/**
 * Komponen Client Tabel Manajemen Order Admin
 */
export default function AdminOrderTable({ orders }: AdminOrderTableProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [catatanInput, setCatatanInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Status Enum Options
  const statusOptions = ['BARU', 'MENUNGGU_BAYAR', 'SUDAH_BAYAR', 'DIPROSES', 'SELESAI', 'GAGAL', 'REFUND'];

  // Filter Orders
  const filteredOrders = orders.filter((ord) => {
    const matchSearch =
      ord.no_invoice.toLowerCase().includes(search.toLowerCase()) ||
      ord.nomor_wa_pelanggan.includes(search) ||
      ord.link_akun.toLowerCase().includes(search.toLowerCase());

    const matchStatus = filterStatus === 'ALL' || ord.status_order === filterStatus;
    return matchSearch && matchStatus;
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Handler Update Status
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setLoading(true);
    const res = await updateOrderStatusAction(orderId, newStatus, catatanInput);
    setLoading(false);
    if (res.success) {
      showToast(res.message);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status_order: newStatus, catatan_admin: catatanInput });
      }
    } else {
      alert(res.message);
    }
  };

  // Handler Tembak Order ke Dumpedia Provider
  const handleProcessDumpedia = async (orderId: number) => {
    if (!confirm('Apakah Anda yakin ingin menembak/mengirim pesanan ini ke provider SMM Dumpedia.id?')) return;
    setLoading(true);
    const res = await processDumpediaOrderAction(orderId);
    setLoading(false);
    if (res.success) {
      showToast(res.message);
    } else {
      alert(`⚠️ Respon Dumpedia: ${res.message}`);
    }
  };

  // Handler Cek Status Order ke Dumpedia
  const handleCheckStatusDumpedia = async (orderId: number) => {
    setLoading(true);
    const res = await checkDumpediaOrderStatusAction(orderId);
    setLoading(false);
    if (res.success) {
      showToast(res.message);
    } else {
      alert(`⚠️ Gagal Cek Status Dumpedia: ${res.message}`);
    }
  };

  // Handler Hapus Order
  const handleDelete = async (orderId: number, invoice: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus order ${invoice}?`)) return;
    const res = await deleteOrderAction(orderId);
    if (res.success) {
      showToast('Order berhasil dihapus.');
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Baris Filter & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Invoice / Nomor WA / Link..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filter Status Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Semua ({orders.length})
          </button>
          {statusOptions.map((st) => {
            const count = orders.filter((o) => o.status_order === st).length;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabel Data Order */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Nomor WA</th>
                <th className="py-3.5 px-4">Kode & Nama Paket</th>
                <th className="py-3.5 px-4">Total Harga</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi Ubah Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{ord.no_invoice}</td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(ord.dibuatPada).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">{ord.nomor_wa_pelanggan}</td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="font-bold text-purple-300">[{ord.kode_paket}]</span> {ord.paket.nama_paket}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{formatRupiah(ord.total_harga)}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={ord.status_order}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-slate-900 focus:outline-none cursor-pointer ${
                        ord.status_order === 'SUDAH_BAYAR'
                          ? 'text-blue-300 border-blue-800'
                          : ord.status_order === 'SELESAI'
                          ? 'text-emerald-300 border-emerald-800'
                          : ord.status_order === 'MENUNGGU_BAYAR'
                          ? 'text-amber-300 border-amber-800'
                          : 'text-slate-300 border-slate-700'
                      }`}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-slate-200">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {ord.id_order_provider ? (
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-700 text-cyan-300 font-mono text-[10px] font-bold">
                            Ref #{ord.id_order_provider}
                          </span>
                          <button
                            onClick={() => handleCheckStatusDumpedia(ord.id)}
                            disabled={loading}
                            className="p-1 rounded-lg bg-cyan-900/60 border border-cyan-700 text-cyan-300 hover:bg-cyan-800/80 text-[10px]"
                            title="Cek Status Dumpedia"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleProcessDumpedia(ord.id)}
                          disabled={loading}
                          className="px-2 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-md shadow-cyan-600/20"
                          title="Tembak Order ke Server Dumpedia.id"
                        >
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span>Tembak Provider</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setCatatanInput(ord.catatan_admin || '');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-300 hover:bg-purple-900/80 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>

                      <button
                        onClick={() => handleDelete(ord.id, ord.no_invoice)}
                        className="p-1 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-400 hover:bg-rose-900/60"
                        title="Hapus Order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    Tidak ada transaksi order yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail & Edit Order */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-purple-500/40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">DETAIL TRANSAKSI</span>
                <h3 className="text-xl font-black font-mono text-amber-400">{selectedOrder.no_invoice}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Nomor WA Pemesan:</span>
                  <span className="font-bold text-slate-200">{selectedOrder.nomor_wa_pelanggan}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Total Nominal:</span>
                  <span className="font-bold text-emerald-400">{formatRupiah(selectedOrder.total_harga)}</span>
                </div>
              </div>

              {/* Status Integration Provider Dumpedia */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-cyan-800/60 flex items-center justify-between gap-3">
                <div>
                  <span className="text-slate-400 block font-semibold">Status Provider Dumpedia.id:</span>
                  {selectedOrder.id_order_provider ? (
                    <span className="font-mono font-extrabold text-cyan-300 text-sm">
                      Terhubung (ID Ref #{selectedOrder.id_order_provider})
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium italic">Belum Ditembak ke Provider</span>
                  )}
                </div>

                {selectedOrder.id_order_provider ? (
                  <button
                    onClick={() => handleCheckStatusDumpedia(selectedOrder.id)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 font-bold text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Cek Status</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleProcessDumpedia(selectedOrder.id)}
                    disabled={loading}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Tembak Provider</span>
                  </button>
                )}
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Target Link Akun:</span>
                <a
                  href={
                    selectedOrder.link_akun.startsWith('http')
                      ? selectedOrder.link_akun
                      : `https://${selectedOrder.link_akun}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-purple-400 hover:underline break-all flex items-center gap-1"
                >
                  <span>{selectedOrder.link_akun}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Bukti Bayar Image jika ada */}
              {selectedOrder.bukti_bayar_url && (
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Foto Bukti Pembayaran:</span>
                  </span>
                  <a
                    href={selectedOrder.bukti_bayar_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={selectedOrder.bukti_bayar_url}
                      alt="Bukti Bayar"
                      className="max-h-48 rounded-lg border border-slate-700 object-cover hover:opacity-90"
                    />
                  </a>
                </div>
              )}

              {/* Edit Catatan Admin */}
              <div className="space-y-1.5 pt-2">
                <label className="text-slate-300 font-bold block">Catatan Internal Admin:</label>
                <textarea
                  value={catatanInput}
                  onChange={(e) => setCatatanInput(e.target.value)}
                  placeholder="Tambah catatan admin (misal: SMM Panel Order ID #88921)..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold"
                >
                  Tutup
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.status_order)}
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Simpan Catatan & Notif WA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
