import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getCustomer, setCustomerActive, deleteCustomer } from '@/lib/repos/customer';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getCustomer(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (![0, 1, '0', '1'].includes(body.active)) return fail('active must be 0 or 1.', 422);
  await setCustomerActive(id, body.active);
  return ok({ id: Number(id), active: Number(body.active) }, { message: 'Status updated.' });
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteCustomer(id);
  return ok({ id: Number(id) }, { message: 'Customer deleted.' });
}