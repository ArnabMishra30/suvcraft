import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setOrderStatus, ORDER_STATUSES } from '@/lib/repos/order';

export async function POST(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { id } = await params;
  const { status } = await req.json().catch(() => ({}));
  if (!ORDER_STATUSES.includes(status)) return fail('Invalid status.', 422);

  try {
    await setOrderStatus(Number(id), status);
    return ok({ id: Number(id), status }, { message: 'Status updated' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 500);
  }
}