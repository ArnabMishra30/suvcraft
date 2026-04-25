import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setPickupLocationStatus, deletePickupLocation } from '@/lib/repos/location';

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body?.status == null) return fail('status is required.', 422);
  await setPickupLocationStatus(id, body.status);
  return ok({}, { message: 'Pickup location updated.' });
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deletePickupLocation(id);
  return ok({ id: Number(id) }, { message: 'Pickup location deleted.' });
}