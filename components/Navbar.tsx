'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, HelpCircle, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  namaToko?: string;
}

/**
 * Komponen Navigation Bar Publik (Responsive & Glassmorphism)
 */
export default function Navbar({ namaToko = 'SUNTIK SOSMED ID' }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              {namaToko}
            </span>
            <span className="block text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
              ● Official Store
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Etalase
          </Link>
          <Link
            href="/cara-order"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Cara Order</span>
          </Link>
          <Link
            href="/cek-status"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <Search className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Cek Status</span>
          </Link>
          <Link
            href="/admin/login"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/80 border border-purple-800/50 hover:bg-purple-900/60 transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
