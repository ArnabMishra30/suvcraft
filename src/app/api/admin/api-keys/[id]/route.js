import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setApiKeyStatus, deleteApiKey } from '@/lib/repos/api-key';

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body?.status == null) return fail('status is required.', 422);
  await setApiKeyStatus(id, body.status);
  return ok({}, { message: 'Status updated.' });
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteApiKey(id);
  return ok({ id: Number(id) }, { message: 'API key deleted.' });
}