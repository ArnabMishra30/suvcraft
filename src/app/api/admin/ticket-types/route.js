import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createTicketType } from '@/lib/repos/ticket-type';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createTicketType(body);
    return ok({ id }, { message: 'Ticket type added.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}