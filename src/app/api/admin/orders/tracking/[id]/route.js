import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { deleteTracking, getTracking, upsertTracking } from '@/lib/repos/order-tracking';

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { id } = await params;
  const removed = await deleteTracking(Number(id));
  if (!removed) return fail('Tracking entry not found.', 404);
  return ok({ id: Number(id) }, { message: 'Tracking entry deleted.' });
}

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { id } = await params;
  const row = await getTracking(Number(id));
  if (!row) return fail('Tracking entry not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.order_id) return fail('order_id is required.', 422);
  if (!body.tracking_id) return fail('tracking_id is required.', 422);

  await upsertTracking({
    order_id: Number(body.order_id),
    order_item_id: body.order_item_id || '',
    courier_agency: body.courier_agency || '',
    tracking_id: body.tracking_id,
    url: body.url || '',
  });
  return ok({}, { message: 'Tracking saved.' });
}