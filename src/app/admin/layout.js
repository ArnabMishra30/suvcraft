import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { findUserById, publicUser } from '@/lib/repos/user';
import AdminShell from '@/components/admin/shell';

export default async function AdminLayout({ children }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/login?next=/admin');
  }
  const user = await findUserById(session.uid);

  return <AdminShell user={publicUser(user)}>{children}</AdminShell>;
}