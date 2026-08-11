import React from 'react';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaketEtalaseClient from '@/components/PaketEtalaseClient';
import { ShieldCheck, Zap, Lock, MessageSquare, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

// SEO Meta Data
export const metadata = {
  title: 'Etalase VirexID - Layanan Followers, Likes & Views Fast Process',
  description: 'Pusat layanan suntik sosial media terpercaya. Followers Instagram, TikTok, YouTube murah, aman tanpa password, proses cepat 24 jam dengan garansi resmi.',
};

export const dynamic = 'force-dynamic';

/**
 * Halaman Utama Etalase Paket (Server Component)
 */
export default async function HomePage() {
  let paketList: any[] = [];
  let namaToko = 'SUNTIK SOSMED ID';
  let nomorWaBot = '6281234567890';

  try {
    // Ambil data paket aktif dari database Prisma SQLite
    paketList = await prisma.paket.findMany({
      where: { status_aktif: true },
      orderBy: [{ urutan: 'asc' }, { kode_paket: 'asc' }],
    });

    // Ambil Pengaturan Toko dari Database SQLite
    const namaTokoSetting = await prisma.pengaturan.findUnique({
      where: { kunci: 'NAMA_TOKO' },
    });
    const nomorAdminSetting = await prisma.pengaturan.findUnique({
      where: { kunci: 'NOMOR_ADMIN_WA' },
    });

    if (namaTokoSetting?.nilai) namaToko = namaTokoSetting.nilai;
    if (nomorAdminSetting?.nilai) nomorWaBot = nomorAdminSetting.nilai;
  } catch (err: any) {
    console.error('Peringatan: Gagal load paket di homepage:', err.message);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Navbar */}
      <Navbar namaToko={namaToko} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-purple-300 text-xs font-bold shadow-lg shadow-purple-900/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Layanan Booster Sosmed Otomatis #1 Indonesia</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Tingkatkan Rebranding Sosmed Anda di{' '}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              {namaToko}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Aman Tanpa Password • Proses Cepat 24 Jam • Garansi 30 Hari Refill
          </p>

          {/* Key Advantages Pill Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs sm:text-sm font-semibold text-slate-300">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Aman Tanpa Password</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant / Fast Process</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Garansi 30 Hari</span>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/cara-order"
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Panduan Cara Order</span>
            </Link>
            <Link
              href="/cek-status"
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>Cek Status Invoice</span>
            </Link>
          </div>
        </section>

        {/* ETALASE PAKET SECTION */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              🎯 ETALASE PAKET TERFAVORIT
            </h2>
            <p className="text-sm text-slate-400">
              Pilih paket, catat Kode Angka, dan kirim format order via WhatsApp Bot 24/7.
            </p>
          </div>

          {/* Client Interactive Component */}
          <PaketEtalaseClient paketList={paketList} nomorWaBot={nomorWaBot} />
        </section>
      </main>

      {/* Footer */}
      <Footer namaToko={namaToko} />
    </div>
  );
}
