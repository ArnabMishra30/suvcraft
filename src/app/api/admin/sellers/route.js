import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createSeller } from '@/lib/repos/seller';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createSeller(body);
    return ok({ id }, { message: 'Seller created.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}