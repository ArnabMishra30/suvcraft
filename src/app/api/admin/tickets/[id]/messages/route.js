import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { addTicketMessage } from '@/lib/repos/ticket';

export async function POST(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    await addTicketMessage({
      ticketId: id,
      userId: auth.session?.uid || 0,
      userType: 'admin',
      message: body?.message,
      attachments: body?.attachments || '',
    });
    return ok({}, { message: 'Reply sent.' });
  } catch (e) {
    return fail(e.message || 'Send failed.', 422);
  }
}