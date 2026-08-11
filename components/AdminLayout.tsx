'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAdminAction } from '@/app/actions/auth';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  ShoppingBag,
  ExternalLink,
  Bot,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Komponen Admin Layout & Sidebar Navigation
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Kelola Order', href: '/admin/order', icon: <ShoppingCart className="w-4 h-4" /> },
    { label: 'Kelola Paket', href: '/admin/paket', icon: <Package className="w-4 h-4" /> },
    { label: 'Pengaturan Toko', href: '/admin/pengaturan', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass-nav md:glass-card border-b md:border-b-0 md:border-r border-slate-800 p-4 md:p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Brand & Title */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-100 tracking-tight block">
                ADMIN PANEL
              </span>
              <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider block">
                VirexID
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions & Logout */}
        <div className="pt-4 border-t border-slate-800 space-y-2 mt-4 md:mt-0">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <span>Lihat Website</span>
            <ExternalLink className="w-3 h-3 text-purple-400" />
          </Link>

          <button
            onClick={() => logoutAdminAction()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/60 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar / Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">{children}</main>
    </div>
  );
}
