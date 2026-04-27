import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createAffiliate } from '@/lib/repos/affiliate';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createAffiliate(body);
    return ok({ id }, { message: 'Affiliate user added.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}