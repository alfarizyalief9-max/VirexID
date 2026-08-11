'use client';

import React, { useState } from 'react';
import { updatePengaturanAction } from '@/app/actions/admin';
import { Save, CheckCircle2, RefreshCw, Store, Phone, CreditCard, ShieldCheck, HelpCircle } from 'lucide-react';

interface PengaturanItem {
  id: number;
  kunci: string;
  nilai: string;
  keterangan: string | null;
}

interface AdminPengaturanFormProps {
  pengaturanList: PengaturanItem[];
}

/**
 * Komponen Client Form Pengaturan Toko Admin
 */
export default function AdminPengaturanForm({ pengaturanList }: AdminPengaturanFormProps) {
  // Utility get value by key
  const getValue = (key: string, fallback: string = '') => {
    const item = pengaturanList.find((p) => p.kunci === key);
    return item ? item.nilai : fallback;
  };

  const [namaToko, setNamaToko] = useState(getValue('NAMA_TOKO', 'VirexID'));
  const [nomorAdminWA, setNomorAdminWA] = useState(getValue('NOMOR_ADMIN_WA', '6281234567890'));
  const [rekBCA, setRekBCA] = useState(getValue('REKENING_BCA', 'BCA: 1234567890 a/n Admin'));
  const [rekDana, setRekDana] = useState(getValue('REKENING_DANA', 'DANA: 081234567890 a/n Admin'));
  const [caraOrder, setCaraOrder] = useState(
    getValue(
      'CARA_ORDER',
      '1. Pilih paket & catat Kode Angka\n2. Balas chat ini dengan format: ORDER <KODE> - <LINK_AKUN>'
    )
  );
  const [garansiInfo, setGaransiInfo] = useState(
    getValue('GARANSI_INFO', '🛡️ Layanan Followers dilengkapi Garansi Refill 30 Hari.')
  );

  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = async (kunci: string, nilai: string) => {
    setLoading(true);
    const res = await updatePengaturanAction(kunci, nilai);
    setLoading(false);

    if (res.success) {
      showToast(`Pengaturan ${kunci} berhasil diperbarui!`);
    } else {
      alert(res.message);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await updatePengaturanAction('NAMA_TOKO', namaToko);
    await updatePengaturanAction('NOMOR_ADMIN_WA', nomorAdminWA);
    await updatePengaturanAction('REKENING_BCA', rekBCA);
    await updatePengaturanAction('REKENING_DANA', rekDana);
    await updatePengaturanAction('CARA_ORDER', caraOrder);
    await updatePengaturanAction('GARANSI_INFO', garansiInfo);

    setLoading(false);
    showToast('Semua pengaturan toko berhasil disimpan!');
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Grid Setting Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Profil Toko & Admin */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Store className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100">Profil Toko & Kontak Admin</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Nama Toko (Branding Utama):</label>
              <input
                type="text"
                value={namaToko}
                onChange={(e) => setNamaToko(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nomor WhatsApp Admin (Forward Order & Notif):</span>
              </label>
              <input
                type="text"
                value={nomorAdminWA}
                onChange={(e) => setNomorAdminWA(e.target.value)}
                placeholder="6281234567890"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Rekening Pembayaran */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100">Rekening Pembayaran</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Rekening Bank BCA:</label>
              <input
                type="text"
                value={rekBCA}
                onChange={(e) => setRekBCA(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Rekening E-Wallet (DANA/OVO/ShopeePay):</label>
              <input
                type="text"
                value={rekDana}
                onChange={(e) => setRekDana(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Teks Pesan Bot Menu 2 (Cara Order) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Balasan Bot WA Menu 2 (Cara Order)</h3>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-semibold">Teks Instruksi Cara Order:</label>
            <textarea
              value={caraOrder}
              onChange={(e) => setCaraOrder(e.target.value)}
              rows={4}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Section 4: Teks Pesan Bot Menu 4 (Garansi Info) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-slate-100">Balasan Bot WA Menu 4 (Informasi Garansi)</h3>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-semibold">Teks Penjelasan Garansi Resmi:</label>
            <textarea
              value={garansiInfo}
              onChange={(e) => setGaransiInfo(e.target.value)}
              rows={4}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Button Save All Settings */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Simpan Semua Pengaturan Toko</span>
        </button>
      </div>
    </form>
  );
}
