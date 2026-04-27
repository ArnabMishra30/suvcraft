import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createNotification } from '@/lib/repos/notification';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createNotification(body);
    return ok({ id }, { message: 'Notification sent.' });
  } catch (e) {
    return fail(e.message || 'Send failed.', 422);
  }
}