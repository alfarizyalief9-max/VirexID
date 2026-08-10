import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Helper untuk menggabungkan class Tailwind secara dinamis & aman dari konflik
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper untuk memformat angka nominal ke format mata uang Rupiah (contoh: Rp 15.000)
 */
export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(angka);
}

/**
 * Helper untuk memformat nomor WA ke standar internasional Indonesia (62xxx)
 * Menghapus semua karakter non-angka dan mengubah awalan '08' menjadi '628'
 */
export function formatNomorWA(nomor: string): string {
  // Hapus semua karakter selain angka
  let bersih = nomor.replace(/\D/g, '');

  // Jika diawali 0, ganti dengan 62
  if (bersih.startsWith('0')) {
    bersih = '62' + bersih.substring(1);
  }

  return bersih;
}
