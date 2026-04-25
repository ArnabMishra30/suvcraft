import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { deleteProductRating } from '@/lib/repos/product-rating';

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const okRow = await deleteProductRating(id);
  if (!okRow) return fail('Not found.', 404);
  return ok({ id: Number(id) }, { message: 'Rating deleted.' });
}