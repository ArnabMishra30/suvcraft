import { ok } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { listConversations } from '@/lib/repos/chat';

export async function GET() {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const adminId = auth.session?.uid || 0;
  const conversations = await listConversations(adminId);
  return ok({ conversations });
}