import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getTimeSlot, updateTimeSlot, deleteTimeSlot } from '@/lib/repos/time-slot';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getTimeSlot(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    await updateTimeSlot(id, body);
    return ok({}, { message: 'Time slot updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteTimeSlot(id);
  return ok({ id: Number(id) }, { message: 'Time slot deleted.' });
}