import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setProductStatus } from '@/lib/repos/product';

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { id } = await params;
  const { status } = await req.json().catch(() => ({}));
  if (![0, 1, 2, '0', '1', '2'].includes(status)) return fail('Invalid status.', 422);

  const updated = await setProductStatus(Number(id), Number(status));
  if (!updated) return fail('Product not found.', 404);
  return ok({ id: Number(id), status: Number(status) }, { message: 'Status updated' });
}