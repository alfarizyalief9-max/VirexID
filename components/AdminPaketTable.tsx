'use client';

import React, { useState, useMemo } from 'react';
import {
  createPaketAction,
  updatePaketAction,
  deletePaketAction,
  togglePaketStatusAction,
} from '@/app/actions/admin';
import { formatRupiah } from '@/lib/utils';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Copy,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface PaketItem {
  id: number;
  kode_paket: number;
  id_layanan_provider?: number | null;
  nama_provider?: string | null;
  platform: string;
  nama_paket: string;
  harga: number;
  harga_modal?: number | null;
  jumlah_default?: number | null;
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
 * Komponen Client Manajemen Paket Admin Lengkap (CRUD, Filter, Search, Paginasi 20 items, Duplicate, Order Safeguard)
 */
export default function AdminPaketTable({ paketList }: AdminPaketTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPaket, setEditingPaket] = useState<PaketItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [sortBy, setSortBy] = useState<'urutan' | 'kode' | 'harga_asc' | 'harga_desc' | 'nama'>('urutan');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Form Input State
  const [kodePaket, setKodePaket] = useState('');
  const [idLayananProvider, setIdLayananProvider] = useState('');
  const [namaProvider, setNamaProvider] = useState('Dumpedia.id');
  const [platform, setPlatform] = useState('Instagram');
  const [namaPaket, setNamaPaket] = useState('');
  const [harga, setHarga] = useState('');
  const [hargaModal, setHargaModal] = useState('0');
  const [jumlahDefault, setJumlahDefault] = useState('1000');
  const [estimasi, setEstimasi] = useState('1-15 Menit');
  const [garansi, setGaransi] = useState('30 Hari Refill');
  const [urutan, setUrutan] = useState('0');
  const [statusAktif, setStatusAktif] = useState(true);
  const [butuhPassword, setButuhPassword] = useState(false);

  const platformOptions = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook', 'Shopee', 'Telegram', 'Lainnya'];
  const providerOptions = ['Dumpedia.id', 'SMM Panel', 'Provider Lain'];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Helper untuk membuka modal tambah paket baru
  const openAddModal = () => {
    // Cari rekomendasi kode paket tertinggi + 1
    const maxKode = paketList.length > 0 ? Math.max(...paketList.map((p) => p.kode_paket)) : 100;
    const nextKode = maxKode > 0 ? maxKode + 1 : 101;

    setEditingPaket(null);
    setKodePaket(nextKode.toString());
    setIdLayananProvider('');
    setNamaProvider('Dumpedia.id');
    setPlatform('Instagram');
    setNamaPaket('');
    setHarga('');
    setHargaModal('0');
    setJumlahDefault('1000');
    setEstimasi('1-15 Menit');
    setGaransi('30 Hari Refill');
    setUrutan((paketList.length + 1).toString());
    setStatusAktif(true);
    setButuhPassword(false);
    setAlertError(null);
    setModalOpen(true);
  };

  // Helper untuk membuka modal edit paket
  const openEditModal = (p: PaketItem) => {
    setEditingPaket(p);
    setKodePaket(p.kode_paket.toString());
    setIdLayananProvider(p.id_layanan_provider ? p.id_layanan_provider.toString() : '');
    setNamaProvider(p.nama_provider || 'Dumpedia.id');
    setPlatform(p.platform);
    setNamaPaket(p.nama_paket);
    setHarga(p.harga.toString());
    setHargaModal((p.harga_modal ?? 0).toString());
    setJumlahDefault((p.jumlah_default ?? 1000).toString());
    setEstimasi(p.estimasi);
    setGaransi(p.garansi);
    setUrutan(p.urutan.toString());
    setStatusAktif(p.status_aktif);
    setButuhPassword(p.butuh_password);
    setAlertError(null);
    setModalOpen(true);
  };

  // Helper untuk aksi cepat SALIN PAKET (Duplicate)
  const handleDuplicate = (p: PaketItem) => {
    const maxKode = Math.max(...paketList.map((item) => item.kode_paket));
    setEditingPaket(null);
    setKodePaket((maxKode + 1).toString());
    setIdLayananProvider(p.id_layanan_provider ? p.id_layanan_provider.toString() : '');
    setNamaProvider(p.nama_provider || 'Dumpedia.id');
    setPlatform(p.platform);
    setNamaPaket(`${p.nama_paket} (Salinan)`);
    setHarga(p.harga.toString());
    setHargaModal((p.harga_modal ?? 0).toString());
    setJumlahDefault((p.jumlah_default ?? 1000).toString());
    setEstimasi(p.estimasi);
    setGaransi(p.garansi);
    setUrutan((paketList.length + 1).toString());
    setStatusAktif(true);
    setButuhPassword(p.butuh_password);
    setAlertError(null);
    setModalOpen(true);
    showToast(`Menduplikasi paket [Kode ${p.kode_paket}]. Kode baru: ${maxKode + 1}`);
  };

  // Handler Toggle Status Cepat (1x Klik)
  const handleToggleStatus = async (p: PaketItem) => {
    setLoading(true);
    const newStatus = !p.status_aktif;
    const res = await togglePaketStatusAction(p.id, newStatus);
    setLoading(false);
    if (res.success) {
      showToast(res.message);
    } else {
      alert(res.message);
    }
  };

  // Handler Submit Form (Tambah & Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlertError(null);

    const formData = new FormData();
    formData.append('kode_paket', kodePaket);
    formData.append('id_layanan_provider', idLayananProvider);
    formData.append('nama_provider', namaProvider);
    formData.append('platform', platform);
    formData.append('nama_paket', namaPaket);
    formData.append('harga', harga);
    formData.append('harga_modal', hargaModal);
    formData.append('jumlah_default', jumlahDefault);
    formData.append('estimasi', estimasi);
    formData.append('garansi', garansi);
    formData.append('urutan', urutan);
    formData.append('status_aktif', statusAktif ? 'true' : 'false');
    formData.append('butuh_password', butuhPassword ? 'true' : 'false');

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
      setAlertError(res.message || 'Gagal menyimpan data paket.');
    }
  };

  // Handler Hapus Paket (Dengan Order Safeguard)
  const handleDelete = async (p: PaketItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus paket "${p.nama_paket}" (Kode ${p.kode_paket})?\n\nTindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    setLoading(true);
    const res = await deletePaketAction(p.id);
    setLoading(false);
    if (res.success) {
      showToast('Paket berhasil dihapus.');
    } else {
      alert(`⚠️ Hapus Ditolak: ${res.message}`);
    }
  };

  // Processing Filter, Search & Sort
  const processedPaketList = useMemo(() => {
    return paketList
      .filter((p) => {
        // Search Filter (Kode Paket / Nama Paket)
        const matchSearch =
          p.kode_paket.toString().includes(search.trim()) ||
          p.nama_paket.toLowerCase().includes(search.toLowerCase().trim()) ||
          p.platform.toLowerCase().includes(search.toLowerCase().trim());

        // Platform Filter
        const matchPlatform =
          filterPlatform === 'Semua' || p.platform.toLowerCase() === filterPlatform.toLowerCase();

        // Status Filter
        const matchStatus =
          filterStatus === 'Semua' ||
          (filterStatus === 'Aktif' && p.status_aktif) ||
          (filterStatus === 'Non-Aktif' && !p.status_aktif);

        return matchSearch && matchPlatform && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'kode') return a.kode_paket - b.kode_paket;
        if (sortBy === 'harga_asc') return a.harga - b.harga;
        if (sortBy === 'harga_desc') return b.harga - a.harga;
        if (sortBy === 'nama') return a.nama_paket.localeCompare(b.nama_paket);
        // Default: urutan asc
        return a.urutan - b.urutan;
      });
  }, [paketList, search, filterPlatform, filterStatus, sortBy]);

  // Pagination Logic (20 items per page)
  const totalPages = Math.ceil(processedPaketList.length / itemsPerPage) || 1;
  const paginatedPaketList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedPaketList.slice(start, start + itemsPerPage);
  }, [processedPaketList, currentPage]);

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Control Bar: Stats, Search, Filters, Sort & Tambah Button */}
      <div className="glass-card p-5 rounded-3xl space-y-4 border border-slate-800">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Header Stats */}
          <div>
            <span className="text-xs text-slate-400 font-semibold block">TOTAL ETALASE TERDAFTAR</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-100">{paketList.length} <span className="text-xs font-normal text-slate-400">Paket</span></span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {paketList.filter((p) => p.status_aktif).length} Aktif
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800">
                {paketList.filter((p) => !p.status_aktif).length} Non-Aktif
              </span>
            </div>
          </div>

          {/* Tombol Tambah Paket Baru */}
          <button
            onClick={openAddModal}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Paket Baru</span>
          </button>
        </div>

        {/* Baris Filter & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari Kode (misal 101) / Nama..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Filter Platform */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1">
            <Filter className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <select
              value={filterPlatform}
              onChange={(e) => {
                setFilterPlatform(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 w-full focus:outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-900">Platform: Semua</option>
              {platformOptions.map((p) => (
                <option key={p} value={p} className="bg-slate-900">
                  Platform: {p}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1">
            <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 w-full focus:outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-900">Status: Semua</option>
              <option value="Aktif" className="bg-slate-900">Status: Aktif</option>
              <option value="Non-Aktif" className="bg-slate-900">Status: Non-Aktif</option>
            </select>
          </div>

          {/* Sort By Option */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 w-full focus:outline-none cursor-pointer"
            >
              <option value="urutan" className="bg-slate-900">Urutkan: Posisi Tampil</option>
              <option value="kode" className="bg-slate-900">Urutkan: Kode Paket</option>
              <option value="harga_asc" className="bg-slate-900">Urutkan: Harga Termurah</option>
              <option value="harga_desc" className="bg-slate-900">Urutkan: Harga Termahal</option>
              <option value="nama" className="bg-slate-900">Urutkan: Nama Paket A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Data Paket Lengkap */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-4 px-4 w-16 text-center">Urutan</th>
                <th className="py-4 px-4 font-extrabold text-amber-400">Kode Paket</th>
                <th className="py-4 px-4">Platform</th>
                <th className="py-4 px-4">Nama Paket Etalase</th>
                <th className="py-4 px-4">Harga Jual</th>
                <th className="py-4 px-4">Harga Modal</th>
                <th className="py-4 px-4">Profit</th>
                <th className="py-4 px-4">Service Provider</th>
                <th className="py-4 px-4">Status Etalase</th>
                <th className="py-4 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedPaketList.map((p) => {
                const profit = p.harga - (p.harga_modal || 0);
                return (
                  <tr key={p.id} className="hover:bg-slate-900/70 transition-colors">
                    {/* Urutan */}
                    <td className="py-3.5 px-4 text-center text-slate-500 font-bold font-mono">#{p.urutan}</td>

                    {/* KODE PAKET ANGKA MENONJOL */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-3 py-1 bg-amber-950/80 border border-amber-600/60 text-amber-400 font-mono font-black text-base rounded-xl shadow-sm">
                        {p.kode_paket}
                      </span>
                    </td>

                    {/* Platform */}
                    <td className="py-3.5 px-4 font-semibold text-slate-300">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px]">
                        {p.platform}
                      </span>
                    </td>

                    {/* Nama Paket */}
                    <td className="py-3.5 px-4 font-bold text-slate-100 max-w-xs">
                      <div>{p.nama_paket}</div>
                      <div className="text-[10px] font-normal text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Estimasi: {p.estimasi}</span>
                        <span>•</span>
                        <span>Garansi: {p.garansi}</span>
                      </div>
                    </td>

                    {/* Harga Jual */}
                    <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                      {formatRupiah(p.harga)}
                    </td>

                    {/* Harga Modal */}
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      {formatRupiah(p.harga_modal || 0)}
                    </td>

                    {/* Margin/Profit */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          profit >= 0 ? 'text-teal-300' : 'text-rose-400'
                        }`}
                      >
                        +{formatRupiah(profit)}
                      </span>
                    </td>

                    {/* Provider & Service ID */}
                    <td className="py-3.5 px-4 font-mono text-cyan-300 text-xs">
                      {p.id_layanan_provider ? (
                        <div>
                          <span className="font-bold">#{p.id_layanan_provider}</span>
                          <span className="text-[10px] text-slate-500 block">({p.nama_provider || 'Dumpedia'})</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic font-normal text-[10px]">Auto (Kode Paket)</span>
                      )}
                    </td>

                    {/* Status Badge & Fast Switch */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        disabled={loading}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          p.status_aktif
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                            : 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900'
                        }`}
                        title="Klik untuk ubah status cepat"
                      >
                        {p.status_aktif ? (
                          <>
                            <ToggleRight className="w-3.5 h-3.5 text-emerald-400" />
                            <span>AKTIF</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3.5 h-3.5 text-rose-400" />
                            <span>NON-AKTIF</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Kolom Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-purple-300 hover:bg-purple-900/60 transition-colors"
                          title="Edit Paket"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate/Salin Paket */}
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                          title="Salin/Duplicate Paket Ini"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Hapus Paket */}
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-400 hover:bg-rose-900/80 transition-colors"
                          title="Hapus Paket (Ada Safeguard Order)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {processedPaketList.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 font-medium">
                    Tidak ada paket yang sesuai dengan filter atau kata kunci pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Navigation Pagination Controls */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            Menampilkan <strong className="text-slate-200">{paginatedPaketList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> -{' '}
            <strong className="text-slate-200">{Math.min(currentPage * itemsPerPage, processedPaketList.length)}</strong> dari{' '}
            <strong className="text-purple-400">{processedPaketList.length}</strong> paket
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40 flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <span className="px-3 py-1 text-slate-300 font-bold">
              Halaman {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40 flex items-center gap-1 font-semibold"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form Tambah / Edit / Duplicate Paket */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="glass-card rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 border border-purple-500/40 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] text-purple-400 font-bold tracking-wider uppercase block">
                  {editingPaket ? `EDIT PAKET #${editingPaket.kode_paket}` : 'TAMBAH PAKET ETALASE'}
                </span>
                <h3 className="text-lg font-bold text-slate-100">
                  {editingPaket ? `Edit Data ${editingPaket.nama_paket}` : 'Form Paket Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {alertError && (
              <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs font-medium">
                ⚠️ {alertError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Kode Paket */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Kode Paket (ANGKA SAJA, UNIK): *</label>
                <input
                  type="number"
                  value={kodePaket}
                  onChange={(e) => setKodePaket(e.target.value)}
                  placeholder="Contoh: 101"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-amber-400 font-mono font-black focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Platform */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Platform Sosmed: *</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  {platformOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Paket */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-300 font-bold block">Nama Paket Etalase: *</label>
                <input
                  type="text"
                  value={namaPaket}
                  onChange={(e) => setNamaPaket(e.target.value)}
                  placeholder="Contoh: Followers Instagram 1K (High Quality Garansi Refill)"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Harga Jual */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Harga Jual Pembeli (Rp): *</label>
                <input
                  type="number"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  placeholder="Contoh: 15000"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Harga Modal */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Harga Modal Provider (Rp):</label>
                <input
                  type="number"
                  value={hargaModal}
                  onChange={(e) => setHargaModal(e.target.value)}
                  placeholder="Contoh: 8000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Service ID Provider */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Service ID Provider (SMM Panel):</label>
                <input
                  type="number"
                  value={idLayananProvider}
                  onChange={(e) => setIdLayananProvider(e.target.value)}
                  placeholder="Contoh: 1542 (Opsional)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Nama Provider */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Nama Provider Panel:</label>
                <select
                  value={namaProvider}
                  onChange={(e) => setNamaProvider(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  {providerOptions.map((prv) => (
                    <option key={prv} value={prv}>
                      {prv}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimasi Pengerjaan */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Estimasi Pengerjaan: *</label>
                <input
                  type="text"
                  value={estimasi}
                  onChange={(e) => setEstimasi(e.target.value)}
                  placeholder="Contoh: 1-15 Menit"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Informasi Garansi */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Informasi Garansi: *</label>
                <input
                  type="text"
                  value={garansi}
                  onChange={(e) => setGaransi(e.target.value)}
                  placeholder="Contoh: 30 Hari Refill"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Jumlah Default */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Jumlah Default (Pcs/Followers):</label>
                <input
                  type="number"
                  value={jumlahDefault}
                  onChange={(e) => setJumlahDefault(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Urutan Tampil */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Urutan Tampilan di Website:</label>
                <input
                  type="number"
                  value={urutan}
                  onChange={(e) => setUrutan(e.target.value)}
                  placeholder="1"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Checkboxes: Status Aktif & Butuh Password */}
              <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="statusAktif"
                    checked={statusAktif}
                    onChange={(e) => setStatusAktif(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-700 bg-slate-900 cursor-pointer"
                  />
                  <label htmlFor="statusAktif" className="text-xs text-slate-200 font-semibold cursor-pointer">
                    Tampilkan Paket di Etalase Website & WhatsApp Bot (Aktif)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="butuhPassword"
                    checked={butuhPassword}
                    onChange={(e) => setButuhPassword(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-700 bg-slate-900 cursor-pointer"
                  />
                  <label htmlFor="butuhPassword" className="text-xs text-slate-400 font-medium cursor-pointer">
                    Membutuhkan Password Akun (Default: Tidak/Aman Tanpa Password)
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 text-xs rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-xs rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold flex items-center gap-2 shadow-lg shadow-purple-600/30"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Simpan Paket</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
