import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware Proteksi Halaman Admin Dashboard
 * Memeriksa keberadaan cookie session 'admin_session_token'
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan akses bebas ke /admin/login
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Jika mencoba mengakses rute /admin/* lainnya
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('admin_session_token')?.value;

    // Jika belum login, redirect ke halaman login admin
    if (sessionToken !== 'authenticated_admin_secret_9988') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
