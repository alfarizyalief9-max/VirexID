'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SESSION_COOKIE_NAME = 'admin_session_token';

/**
 * Server Action: Process Login Admin
 */
export async function loginAdminAction(formData: FormData) {
  const passwordInput = formData.get('password') as string;
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminsssosmed';

  if (!passwordInput || passwordInput !== adminPassword) {
    return { success: false, message: 'Password Admin salah!' };
  }

  // Set Cookie HTTP-only session token
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, 'authenticated_admin_secret_9988', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  return { success: true, message: 'Login berhasil!' };
}

/**
 * Server Action: Logout Admin
 */
export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/admin/login');
}

/**
 * Helper: Cek apakah user adalah admin terautentikasi
 */
export async function isAuthAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return token === 'authenticated_admin_secret_9988';
}
