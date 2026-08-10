import React from 'react';

interface FooterProps {
  namaToko?: string;
}

/**
 * Komponen Footer Publik
 */
export default function Footer({ namaToko = 'SUNTIK SOSMED ID' }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 text-center text-sm text-slate-400">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-300">
            © {year} <span className="text-purple-400">{namaToko}</span>. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Layanan Suntik Sosial Media Otomatis • Fast Process & Garansi Resmi
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Aman Tanpa Password</span>
          <span>•</span>
          <span>Proses 24 Jam</span>
          <span>•</span>
          <span>Garansi 30 Hari</span>
        </div>
      </div>
    </footer>
  );
}
