import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getAttributeSet, updateAttributeSet, deleteAttributeSet, setAttributeSetStatus } from '@/lib/repos/attribute-set';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getAttributeSet(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const okRow = await updateAttributeSet(id, { name: body.name, status: body.status ?? 1 });
    if (!okRow) return fail('Not found.', 404);
    return ok({}, { message: 'Attribute set updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body.status !== 0 && body.status !== 1 && body.status !== '0' && body.status !== '1') {
    return fail('status must be 0 or 1.', 422);
  }
  const okRow = await setAttributeSetStatus(id, body.status);
  if (!okRow) return fail('Not found.', 404);
  return ok({ id: Number(id), status: Number(body.status) }, { message: 'Status updated.' });
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const okRow = await deleteAttributeSet(id);
  if (!okRow) return fail('Not found.', 404);
  return ok({ id: Number(id) }, { message: 'Attribute set deleted.' });
}