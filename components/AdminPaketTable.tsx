'use client';

import React, { useState } from 'react';
import { createPaketAction, updatePaketAction, deletePaketAction } from '@/app/actions/admin';
import { formatRupiah } from '@/lib/utils';
import { Plus, Edit, Trash2, CheckCircle2, ShieldCheck, Clock, RefreshCw } from 'lucide-react';

interface PaketItem {
  id: number;
  kode_paket: number;
  platform: string;
  nama_paket: string;
  harga: number;
  estimasi: string;
  garansi: string;
  butuh_password: boolean;
  status_aktif: boolean;
  urutan: number;
}

interface AdminPaketTableProps {
  paketList: PaketItem[];
}

/**
 * Komponen Client Tabel CRUD Paket Sosmed Admin
 */
export default function AdminPaketTable({ paketList }: AdminPaketTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPaket, setEditingPaket] = useState<PaketItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [kodePaket, setKodePaket] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [namaPaket, setNamaPaket] = useState('');
  const [harga, setHarga] = useState('');
  const [estimasi, setEstimasi] = useState('1-15 Menit');
  const [garansi, setGaransi] = useState('30 Hari Refill');
  const [urutan, setUrutan] = useState('0');
  const [statusAktif, setStatusAktif] = useState(true);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const openAddModal = () => {
    setEditingPaket(null);
    setKodePaket('');
    setPlatform('Instagram');
    setNamaPaket('');
    setHarga('');
    setEstimasi('1-15 Menit');
    setGaransi('30 Hari Refill');
    setUrutan((paketList.length + 1).toString());
    setStatusAktif(true);
    setModalOpen(true);
  };

  const openEditModal = (p: PaketItem) => {
    setEditingPaket(p);
    setKodePaket(p.kode_paket.toString());
    setPlatform(p.platform);
    setNamaPaket(p.nama_paket);
    setHarga(p.harga.toString());
    setEstimasi(p.estimasi);
    setGaransi(p.garansi);
    setUrutan(p.urutan.toString());
    setStatusAktif(p.status_aktif);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('kode_paket', kodePaket);
    formData.append('platform', platform);
    formData.append('nama_paket', namaPaket);
    formData.append('harga', harga);
    formData.append('estimasi', estimasi);
    formData.append('garansi', garansi);
    formData.append('urutan', urutan);
    formData.append('status_aktif', statusAktif ? 'true' : 'false');

    let res;
    if (editingPaket) {
      res = await updatePaketAction(editingPaket.id, formData);
    } else {
      res = await createPaketAction(formData);
    }

    setLoading(false);

    if (res.success) {
      showToast(res.message);
      setModalOpen(false);
    } else {
      alert(res.message);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Yakin ingin menghapus paket "${nama}"?`)) return;
    const res = await deletePaketAction(id);
    if (res.success) {
      showToast('Paket berhasil dihapus.');
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Button Tambah Paket */}
      <div className="flex items-center justify-between glass-card p-4 rounded-2xl">
        <p className="text-xs text-slate-400 font-medium">Total Paket Terdaftar: <strong className="text-purple-400">{paketList.length}</strong></p>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* Tabel Data Paket */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Urutan</th>
                <th className="py-3.5 px-4">Kode Angka</th>
                <th className="py-3.5 px-4">Platform</th>
                <th className="py-3.5 px-4">Nama Paket</th>
                <th className="py-3.5 px-4">Harga</th>
                <th className="py-3.5 px-4">Estimasi</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paketList.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500 font-bold">#{p.urutan}</td>
                  <td className="py-3.5 px-4 font-mono font-black text-amber-400 text-sm">{p.kode_paket}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-300">{p.platform}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-100">{p.nama_paket}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{formatRupiah(p.harga)}</td>
                  <td className="py-3.5 px-4 text-slate-400">{p.estimasi}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.status_aktif
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}
                    >
                      {p.status_aktif ? 'AKTIF' : 'NON-AKTIF'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-purple-300 hover:bg-slate-700"
                        title="Edit Paket"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.nama_paket)}
                        className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-400 hover:bg-rose-900/60"
                        title="Hapus Paket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit Paket */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-purple-500/40"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100">
                {editingPaket ? `Edit Paket (Kode ${editingPaket.kode_paket})` : 'Tambah Paket Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Kode Paket (ANGKA UNIK):</label>
                <input
                  type="number"
                  value={kodePaket}
                  onChange={(e) => setKodePaket(e.target.value)}
                  placeholder="Contoh: 106"
                  disabled={!!editingPaket}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-purple-500 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Platform:</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Twitter/X">Twitter/X</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-slate-300 font-semibold">Nama Paket Etalase:</label>
                <input
                  type="text"
                  value={namaPaket}
                  onChange={(e) => setNamaPaket(e.target.value)}
                  placeholder="Contoh: Followers Instagram 1K (High Quality)"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Harga (Rupiah murni):</label>
                <input
                  type="number"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  placeholder="Contoh: 15000"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Urutan Tampilan:</label>
                <input
                  type="number"
                  value={urutan}
                  onChange={(e) => setUrutan(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Estimasi Pengerjaan:</label>
                <input
                  type="text"
                  value={estimasi}
                  onChange={(e) => setEstimasi(e.target.value)}
                  placeholder="1-15 Menit"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Informasi Garansi:</label>
                <input
                  type="text"
                  value={garansi}
                  onChange={(e) => setGaransi(e.target.value)}
                  placeholder="30 Hari Refill"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="col-span-2 flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="statusAktif"
                  checked={statusAktif}
                  onChange={(e) => setStatusAktif(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-700 bg-slate-900"
                />
                <label htmlFor="statusAktif" className="text-xs text-slate-300 font-semibold">
                  Tampilkan Paket di Etalase Website & WhatsApp Bot (Aktif)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Simpan Paket</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
