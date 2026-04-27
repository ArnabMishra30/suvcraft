import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getFaq, updateFaq, setFaqStatus, deleteFaq } from '@/lib/repos/faq';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getFaq(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    await updateFaq(id, body);
    return ok({}, { message: 'FAQ updated.' });
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
  await setFaqStatus(id, body.status);
  return ok({}, { message: 'Status updated.' });
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteFaq(id);
  return ok({ id: Number(id) }, { message: 'FAQ deleted.' });
}