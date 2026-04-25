import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setReturnRequestStatus, deleteReturnRequest } from '@/lib/repos/return-request';

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (![0, 1, 2, 3, 4].includes(Number(body.status))) return fail('Invalid status.', 422);
  await setReturnRequestStatus(id, body.status, body.remarks);
  return ok({ id: Number(id), status: Number(body.status) }, { message: 'Status updated.' });
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteReturnRequest(id);
  return ok({ id: Number(id) }, { message: 'Return request deleted.' });
}