import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getDeliveryBoy, updateDeliveryBoy, deleteDeliveryBoy, setDeliveryBoyStatus } from '@/lib/repos/delivery-boy';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getDeliveryBoy(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    await updateDeliveryBoy(id, body);
    return ok({}, { message: 'Delivery boy updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (![0, 1, 7].includes(Number(body.status))) return fail('status must be 0, 1, or 7.', 422);
  await setDeliveryBoyStatus(id, body.status);
  return ok({ id: Number(id), status: Number(body.status) }, { message: 'Status updated.' });
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteDeliveryBoy(id);
  return ok({ id: Number(id) }, { message: 'Delivery boy deleted.' });
}