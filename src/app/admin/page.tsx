import { redirect } from 'next/navigation';
import { getAdminFromCookies } from '@/lib/auth';

export default async function AdminRootPage() {
  const admin = await getAdminFromCookies();
  if (admin) {
    redirect('/admin/dashboard');
  } else {
    redirect('/admin/login');
  }
}
