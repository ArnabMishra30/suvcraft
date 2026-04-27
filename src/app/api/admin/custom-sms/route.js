import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createCustomSms } from '@/lib/repos/custom-sms';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createCustomSms(body);
    return ok({ id }, { message: 'Custom SMS added.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}