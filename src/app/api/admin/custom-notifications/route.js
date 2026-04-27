import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createCustomNotification } from '@/lib/repos/custom-notification';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createCustomNotification(body);
    return ok({ id }, { message: 'Custom message added.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}