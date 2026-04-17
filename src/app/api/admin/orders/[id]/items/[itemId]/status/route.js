import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { appendOrderItemStatus, ORDER_STATUSES } from '@/lib/repos/order';

export async function POST(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { itemId } = await params;
  const { status } = await req.json().catch(() => ({}));
  if (!ORDER_STATUSES.includes(status)) return fail('Invalid status.', 422);

  try {
    await appendOrderItemStatus(Number(itemId), status);
    return ok({ item_id: Number(itemId), status }, { message: 'Item status updated' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 500);
  }
}