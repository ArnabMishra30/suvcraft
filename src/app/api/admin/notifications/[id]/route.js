import { ok } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { deleteNotification } from '@/lib/repos/notification';

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteNotification(id);
  return ok({ id: Number(id) }, { message: 'Notification deleted.' });
}