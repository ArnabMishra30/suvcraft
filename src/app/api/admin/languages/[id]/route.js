import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getLanguage, updateLanguage, setDefaultLanguage, deleteLanguage } from '@/lib/repos/language';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getLanguage(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    await updateLanguage(id, body);
    return ok({}, { message: 'Language updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body?.is_default === 1 || body?.is_default === true) {
    await setDefaultLanguage(id);
    return ok({}, { message: 'Default language updated.' });
  }
  return fail('Nothing to update.', 422);
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  try {
    await deleteLanguage(id);
    return ok({ id: Number(id) }, { message: 'Language deleted.' });
  } catch (e) {
    return fail(e.message || 'Delete failed.', 422);
  }
}