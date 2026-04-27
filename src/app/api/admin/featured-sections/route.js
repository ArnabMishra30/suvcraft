import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createSection } from '@/lib/repos/section';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createSection(body);
    return ok({ id }, { message: 'Featured section added.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}