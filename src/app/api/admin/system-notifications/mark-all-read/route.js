import { ok } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { markAllSystemNotificationsRead } from '@/lib/repos/system-notification';

export async function POST() {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const updated = await markAllSystemNotificationsRead();
  return ok({ updated }, { message: `${updated} notification(s) marked as read.` });
}