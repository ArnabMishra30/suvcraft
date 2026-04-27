import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getBlog, updateBlog, setBlogStatus, deleteBlog } from '@/lib/repos/blog';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getBlog(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    await updateBlog(id, body);
    return ok({}, { message: 'Blog updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body?.status == null) return fail('status is required.', 422);
  await setBlogStatus(id, body.status);
  return ok({}, { message: 'Status updated.' });
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteBlog(id);
  return ok({ id: Number(id) }, { message: 'Blog deleted.' });
}