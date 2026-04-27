import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setAffiliateStatus, deleteAffiliate } from '@/lib/repos/affiliate';

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body?.status == null) return fail('status is required.', 422);
  try {
    await setAffiliateStatus(id, body.status);
    return ok({}, { message: 'Status updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteAffiliate(id);
  return ok({ id: Number(id) }, { message: 'Affiliate user deleted.' });
}