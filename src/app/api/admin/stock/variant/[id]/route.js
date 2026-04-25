import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { updateVariantStock } from '@/lib/repos/stock';

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body?.stock == null) return fail('stock is required.', 422);
  try {
    await updateVariantStock(id, body.stock);
    return ok({}, { message: 'Stock updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}