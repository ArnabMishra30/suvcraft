import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { deleteProducts } from '@/lib/repos/product';

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { id } = await params;
  const removed = await deleteProducts([Number(id)]);
  if (!removed) return fail('Product not found.', 404);
  return ok({ id: Number(id) }, { message: 'Product deleted.' });
}