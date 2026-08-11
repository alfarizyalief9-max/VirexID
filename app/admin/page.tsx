import { redirect } from 'next/navigation';

/**
 * Rute /admin otomatis mengarahkan ke /admin/dashboard
 */
export default function AdminIndexPage() {
  redirect('/admin/dashboard');
}
