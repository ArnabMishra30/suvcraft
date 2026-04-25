import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { bulkUpdateCategoryOrder } from '@/lib/repos/category';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  if (!Array.isArray(body.items)) return fail('items array is required.', 422);
  const updated = await bulkUpdateCategoryOrder(body.items);
  return ok({ updated }, { message: `${updated} categor${updated === 1 ? 'y' : 'ies'} reordered.` });
}