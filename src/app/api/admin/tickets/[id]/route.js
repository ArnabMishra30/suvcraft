import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getTicket, getTicketMessages, setTicketStatus, deleteTicket } from '@/lib/repos/ticket';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) return fail('Not found.', 404);
  const messages = await getTicketMessages(id);
  return ok({ ticket, messages });
}

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body?.status == null) return fail('status is required.', 422);
  try {
    await setTicketStatus(id, body.status);
    return ok({}, { message: 'Status updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  await deleteTicket(id);
  return ok({ id: Number(id) }, { message: 'Ticket deleted.' });
}