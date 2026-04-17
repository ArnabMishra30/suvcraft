import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { deleteSystemNotification, markSystemNotificationRead } from '@/lib/repos/system-notification';

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { id } = await params;
  const removed = await deleteSystemNotification(Number(id));
  if (!removed) return fail('Notification not found.', 404);
  return ok({ id: Number(id) }, { message: 'Notification deleted.' });
}

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { id } = await params;
  const { read_by } = await req.json().catch(() => ({}));
  const updated = await markSystemNotificationRead(Number(id), read_by ?? 1);
  if (!updated) return fail('Notification not found.', 404);
  return ok({ id: Number(id), read_by: Number(read_by ?? 1) });
}