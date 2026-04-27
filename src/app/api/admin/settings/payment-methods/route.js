import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { mergeSetting } from '@/lib/settings';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  if (!body || typeof body !== 'object') return fail('Invalid body.', 400);
  try {
    await mergeSetting('payment_method', body);
    return ok({}, { message: 'Payment settings updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}