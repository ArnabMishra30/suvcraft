import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getTicketType, updateTicketType, deleteTicketType } from '@/lib/repos/ticket-type';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getTicketType(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    await updateTicketType(id, body);
    return ok({}, { message: 'Ticket type updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteTicketType(id);
  return ok({ id: Number(id) }, { message: 'Ticket type deleted.' });
}