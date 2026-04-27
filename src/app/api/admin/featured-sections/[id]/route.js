import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getSection, updateSection, deleteSection } from '@/lib/repos/section';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getSection(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    await updateSection(id, body);
    return ok({}, { message: 'Featured section updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteSection(id);
  return ok({ id: Number(id) }, { message: 'Featured section deleted.' });
}