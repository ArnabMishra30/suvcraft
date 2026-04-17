import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { upsertTracking } from '@/lib/repos/order-tracking';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => ({}));
  if (!body.order_id) return fail('order_id is required.', 422);
  if (!body.tracking_id) return fail('tracking_id is required.', 422);

  const id = await upsertTracking({
    order_id: Number(body.order_id),
    order_item_id: body.order_item_id || '',
    courier_agency: body.courier_agency || '',
    tracking_id: body.tracking_id,
    url: body.url || '',
  });
  return ok({ id }, { message: 'Tracking saved.' });
}