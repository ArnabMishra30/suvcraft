import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setSetting } from '@/lib/settings';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  if (!body || typeof body !== 'object') return fail('Invalid body.', 400);
  // Accept any shape; we just store the matrix as-is.
  await setSetting('send_notification_settings', body);
  return ok({}, { message: 'Notification matrix updated.' });
}