import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getCustomSms, updateCustomSms, deleteCustomSms } from '@/lib/repos/custom-sms';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getCustomSms(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    await updateCustomSms(id, body);
    return ok({}, { message: 'Custom SMS updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteCustomSms(id);
  return ok({ id: Number(id) }, { message: 'Custom SMS deleted.' });
}