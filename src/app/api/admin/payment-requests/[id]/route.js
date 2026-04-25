import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getPaymentRequest, updatePaymentRequest } from '@/lib/repos/payment-request';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getPaymentRequest(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    await updatePaymentRequest(id, { status: body?.status, remarks: body?.remarks });
    return ok({}, { message: 'Payment request updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}