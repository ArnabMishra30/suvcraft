import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import {
  getSystemUser,
  updateSystemUser,
  deleteSystemUser,
  setSystemUserActive,
} from '@/lib/repos/system-user';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getSystemUser(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    await updateSystemUser(id, body);
    return ok({}, { message: 'System user updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.active === 'undefined') return fail('active flag is required.', 422);
  await setSystemUserActive(id, Number(body.active) ? 1 : 0);
  return ok({ id: Number(id), active: Number(body.active) ? 1 : 0 }, { message: 'Status updated.' });
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  if (Number(id) === Number(auth.session?.uid)) return fail('You cannot delete your own account.', 422);
  await deleteSystemUser(id);
  return ok({ id: Number(id) }, { message: 'System user deleted.' });
}