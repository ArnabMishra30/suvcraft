import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setAffiliateStatus } from '@/lib/repos/product-affiliate';

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { id } = await params;
  const { is_in_affiliate } = await req.json().catch(() => ({}));
  if (is_in_affiliate !== 0 && is_in_affiliate !== 1 && is_in_affiliate !== '0' && is_in_affiliate !== '1') {
    return fail('is_in_affiliate must be 0 or 1.', 422);
  }
  const okRow = await setAffiliateStatus(id, is_in_affiliate);
  if (!okRow) return fail('Product not found.', 404);
  return ok({ id: Number(id), is_in_affiliate: Number(is_in_affiliate) }, { message: 'Affiliate status updated.' });
}