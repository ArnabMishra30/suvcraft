import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getBrand, updateBrand, deleteBrand, setBrandStatus } from '@/lib/repos/brand';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getBrand(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const okRow = await updateBrand(id, body);
    if (!okRow) return fail('Not found.', 404);
    return ok({}, { message: 'Brand updated.' });
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
  const okRow = await setBrandStatus(id, body.status);
  if (!okRow) return fail('Not found.', 404);
  return ok({ id: Number(id), status: Number(body.status) }, { message: 'Status updated.' });
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  try {
    const okRow = await deleteBrand(id);
    if (!okRow) return fail('Not found.', 404);
    return ok({ id: Number(id) }, { message: 'Brand deleted.' });
  } catch (e) {
    return fail(e.message, 409);
  }
}