'use client';

import React, { useState } from 'react';
import { formatRupiah } from '@/lib/utils';
import { createWebOrderAction } from '@/app/actions/order';
import {
  Camera,
  Video,
  Play,
  Copy,
  MessageSquare,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Filter,
  ShoppingCart,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

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

interface PaketEtalaseClientProps {
  paketList: PaketItem[];
  nomorWaBot: string;
}

/**
 * Komponen Client Filter & Etalase Kartu Paket Sosmed
 */
export default function PaketEtalaseClient({ paketList, nomorWaBot }: PaketEtalaseClientProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Semua');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Web Checkout Modal State
  const [orderModalPaket, setOrderModalPaket] = useState<PaketItem | null>(null);
  const [nomorWaInput, setNomorWaInput] = useState('');
  const [targetLinkInput, setTargetLinkInput] = useState('');
  const [jumlahInput, setJumlahInput] = useState('1');
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<{ invoice: string; total: number; nama: string } | null>(null);

  // Daftar Kategori Platform Dinamis dari Data Paket DB
  const dynamicPlatforms = Array.from(new Set(paketList.map((p) => p.platform))).filter(Boolean);
  const defaultPlatforms = ['Instagram', 'TikTok', 'YouTube'];
  const allPlatformTabs = ['Semua', ...Array.from(new Set([...defaultPlatforms, ...dynamicPlatforms]))];

  // Filter paket berdasarkan tab aktif
  const filteredPaket = paketList.filter((item) => {
    if (selectedPlatform === 'Semua') return true;
    return item.platform.toLowerCase() === selectedPlatform.toLowerCase();
  });

  // Function: Salin Kode ke Clipboard + Toast
  const handleCopyCode = (kode: number) => {
    navigator.clipboard.writeText(kode.toString());
    setToastMessage(`✅ Kode ${kode} berhasil disalin ke clipboard!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Helper untuk Ikon Platform
  const getPlatformIcon = (platformName: string) => {
    const p = platformName.toLowerCase();
    if (p.includes('instagram')) return <Camera className="w-5 h-5 text-pink-400" />;
    if (p.includes('tiktok')) return <Video className="w-5 h-5 text-cyan-400" />;
    if (p.includes('youtube')) return <Play className="w-5 h-5 text-red-500 fill-red-500/20" />;
    return <Zap className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification Floating Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Filter Buttons Platform Dinamis */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        {allPlatformTabs.map((platform) => {
          const isActive = selectedPlatform === platform;
          return (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2 shadow-lg ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-purple-500/30 scale-105 border border-purple-400/40'
                  : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {platform !== 'Semua' && getPlatformIcon(platform)}
              {platform === 'Semua' && <Filter className="w-4 h-4 text-purple-400" />}
              <span>{platform}</span>
            </button>
          );
        })}
      </div>

      {/* Grid Kartu Paket (3 Kolom Desktop, 2 Tablet, 1 Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPaket.map((paket) => {
          // Link deep link WA Order format: ORDER <KODE> -
          const waLink = `https://wa.me/${nomorWaBot}?text=ORDER%20${paket.kode_paket}%20-%20`;

          return (
            <div
              key={paket.id}
              className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
            >
              {/* Top Row: Badge Platform & Tag Garansi */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/90 text-slate-300 border border-slate-700">
                    {getPlatformIcon(paket.platform)}
                    {paket.platform}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {paket.garansi}
                  </span>
                </div>

                {/* KODE PAKET ANGKA BESAR BOLD (MENONJOL SESUAI SYARAT UTAMA) */}
                <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 rounded-2xl p-3 text-center my-3 shadow-inner">
                  <span className="text-xs uppercase tracking-widest text-purple-300 font-bold block mb-0.5">
                    KODE PAKET
                  </span>
                  <span className="text-4xl font-extrabold tracking-tight text-amber-400 drop-shadow-md">
                    {paket.kode_paket}
                  </span>
                </div>

                {/* Nama Paket */}
                <h3 className="text-lg font-bold text-slate-100 mb-2 leading-snug group-hover:text-purple-300 transition-colors">
                  {paket.nama_paket}
                </h3>

                {/* Estimasi Pengerjaan */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Estimasi: <strong className="text-slate-200">{paket.estimasi}</strong></span>
                </div>
              </div>

              {/* Bottom Section: Harga & Tombol Aksi */}
              <div className="pt-4 border-t border-slate-800/80 mt-2 space-y-4">
                {/* Nominal Harga Rupiah Besar */}
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 font-medium">Harga Resmi</span>
                  <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    {formatRupiah(paket.harga)}
                  </span>
                </div>

                {/* Tombol Utama: Pesan Langsung Web & Order via WA */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setOrderModalPaket(paket);
                      setNomorWaInput('');
                      setTargetLinkInput('');
                      setJumlahInput('1');
                      setSuccessInvoice(null);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Pesan Langsung di Web</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCopyCode(paket.kode_paket)}
                      className="w-full py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1 border border-slate-700"
                    >
                      <Copy className="w-3 h-3 text-purple-400" />
                      <span>Salin Kode</span>
                    </button>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1 border border-emerald-800"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Order WA</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPaket.length === 0 && (
        <div className="text-center py-16 glass-card rounded-3xl text-slate-400">
          <p className="text-base font-semibold">Belum ada paket untuk kategori {selectedPlatform}.</p>
        </div>
      )}

      {/* MODAL CHECKOUT DIRECT ORDER WEB */}
      {orderModalPaket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-md w-full p-6 space-y-5 border border-purple-500/40 relative">
            <button
              onClick={() => setOrderModalPaket(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold"
            >
              ✕
            </button>

            {successInvoice ? (
              <div className="text-center space-y-4 py-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold block">PESANAN BERHASIL DIBUAT</span>
                  <h3 className="text-2xl font-black font-mono text-amber-400">{successInvoice.invoice}</h3>
                  <p className="text-xs text-slate-300">
                    Paket: <strong>{successInvoice.nama}</strong>
                  </p>
                  <p className="text-lg font-bold text-emerald-400">{formatRupiah(successInvoice.total)}</p>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1 text-left">
                  <span className="font-bold text-purple-300 block">Langkah Selanjutnya:</span>
                  <p>1. Lakukan pembayaran ke nomor rekening toko.</p>
                  <p>2. Upload foto bukti bayar di halaman Cek Status.</p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={`/cek-status?inv=${successInvoice.invoice}`}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <span>Upload Bukti & Cek Status Invoice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setOrderModalPaket(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-bold"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoadingOrder(true);
                  const formData = new FormData();
                  formData.append('kode_paket', String(orderModalPaket.kode_paket));
                  formData.append('nomor_wa', nomorWaInput);
                  formData.append('link_akun', targetLinkInput);
                  formData.append('jumlah', jumlahInput);

                  const res = await createWebOrderAction(formData);
                  setLoadingOrder(false);

                  if (res.success && res.no_invoice) {
                    setSuccessInvoice({
                      invoice: res.no_invoice,
                      total: res.total_harga,
                      nama: res.nama_paket,
                    });
                  } else {
                    alert(res.message);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <span className="text-xs text-purple-400 font-bold tracking-wider uppercase block">Form Pemesanan Direct</span>
                  <h3 className="text-lg font-bold text-slate-100">{orderModalPaket.nama_paket}</h3>
                  <span className="text-xs text-emerald-400 font-bold">{formatRupiah(orderModalPaket.harga)}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Nomor WhatsApp Pemesan (628xxx / 08xxx):</label>
                    <input
                      type="text"
                      value={nomorWaInput}
                      onChange={(e) => setNomorWaInput(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Target Link / Username Akun Sosmed:</label>
                    <input
                      type="text"
                      value={targetLinkInput}
                      onChange={(e) => setTargetLinkInput(e.target.value)}
                      placeholder="Contoh: https://instagram.com/username_anda"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOrderModalPaket(null)}
                    className="px-4 py-2.5 text-xs rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loadingOrder}
                    className="px-5 py-2.5 text-xs rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2"
                  >
                    {loadingOrder ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Buat Pesanan Sekarang</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
