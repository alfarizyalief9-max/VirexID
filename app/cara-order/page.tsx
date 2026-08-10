import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import { ShoppingBag, MessageSquare, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Panduan Cara Order - Suntik Sosmed ID',
  description: 'Panduan mudah cara melakukan order paket suntik sosmed melalui WhatsApp Bot otomatis 24 jam.',
};

/**
 * Halaman Panduan Cara Order (App Router Next.js 15)
 */
export default async function CaraOrderPage() {
  const namaTokoSetting = await prisma.pengaturan.findUnique({
    where: { kunci: 'NAMA_TOKO' },
  });
  const nomorAdminSetting = await prisma.pengaturan.findUnique({
    where: { kunci: 'NOMOR_ADMIN_WA' },
  });

  const namaToko = namaTokoSetting ? namaTokoSetting.nilai : 'SUNTIK SOSMED ID';
  const nomorWaBot = nomorAdminSetting ? nomorAdminSetting.nilai : '6281234567890';

  const langkahList = [
    {
      no: '1',
      judul: 'Pilih Paket & Catat Kode Angka',
      deskripsi:
        'Buka etalase website kami, pilih paket yang sesuai kebutuhan (Instagram, TikTok, YouTube), lalu catat 3-digit **Kode Paket Angka** (contoh: 101, 201, 301).',
      ikon: <ShoppingBag className="w-6 h-6 text-purple-400" />,
    },
    {
      no: '2',
      judul: 'Chat WhatsApp Bot / Klik Tombol Order WA',
      deskripsi:
        'Klik tombol "Order WA" pada kartu paket atau langsung kirim pesan WhatsApp ke nomor Bot resmi kami.',
      ikon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
    },
    {
      no: '3',
      judul: 'Kirim Format Pesanan',
      deskripsi:
        'Kirimkan chat dengan format:\n`ORDER <KODE_PAKET> - <LINK_AKUN>`\nContoh: `ORDER 101 - instagram.com/username`',
      ikon: <ArrowRight className="w-6 h-6 text-amber-400" />,
    },
    {
      no: '4',
      judul: 'Lakukan Pembayaran & Kirim Bukti Transfer',
      deskripsi:
        'Bot WhatsApp akan membalas dengan total harga + No Invoice unik. Lakukan transfer ke BCA/DANA lalu upload foto bukti bayar ke WhatsApp.',
      ikon: <CreditCard className="w-6 h-6 text-blue-400" />,
    },
    {
      no: '5',
      judul: 'Pesanan Diproses & Selesai!',
      deskripsi:
        'Sistem & admin akan memverifikasi pembayaran Anda. Pesanan Anda akan diproses secara otomatis!',
      ikon: <CheckCircle2 className="w-6 h-6 text-teal-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar namaToko={namaToko} />

      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 space-y-10">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full bg-purple-900/50 border border-purple-700/50 text-purple-300 text-xs font-semibold">
            📖 Panduan Penggunaan
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Cara Mudah Order via WhatsApp Bot
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Hanya butuh 1 menit untuk melakukan order otomatis. Ikuti 5 langkah simpel di bawah ini:
          </p>
        </div>

        {/* List Langkah Step-by-Step */}
        <div className="space-y-4">
          {langkahList.map((step) => (
            <div
              key={step.no}
              className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 border border-slate-800 hover:border-purple-500/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                {step.ikon}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Langkah #{step.no}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100">{step.judul}</h3>
                <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                  {step.deskripsi}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button Kembali ke Etalase */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all"
          >
            <span>Lihat Etalase & Pilih Paket</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer namaToko={namaToko} />
    </div>
  );
}
