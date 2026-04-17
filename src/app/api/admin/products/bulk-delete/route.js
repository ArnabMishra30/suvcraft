import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { deleteProducts } from '@/lib/repos/product';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { ids } = await req.json().catch(() => ({}));
  if (!Array.isArray(ids) || !ids.length) return fail('No products selected.', 422);

  const removed = await deleteProducts(ids);
  return ok({ removed }, { message: `${removed} product(s) deleted.` });
}