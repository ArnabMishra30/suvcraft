import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createLanguage } from '@/lib/repos/language';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createLanguage(body);
    return ok({ id }, { message: 'Language added.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}