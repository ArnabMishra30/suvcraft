import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { bulkSetAffiliateStatus } from '@/lib/repos/product-affiliate';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { ids, is_in_affiliate } = await req.json().catch(() => ({}));
  if (!Array.isArray(ids) || !ids.length) return fail('No products selected.', 422);
  if (is_in_affiliate !== 0 && is_in_affiliate !== 1 && is_in_affiliate !== '0' && is_in_affiliate !== '1') {
    return fail('is_in_affiliate must be 0 or 1.', 422);
  }
  const updated = await bulkSetAffiliateStatus(ids, is_in_affiliate);
  return ok({ updated }, { message: `${updated} product(s) updated.` });
}