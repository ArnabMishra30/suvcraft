import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getMessagesBetween, sendMessage, markConversationRead, getAdminUserId } from '@/lib/repos/chat';

const ALLOWED_ROLES = ['members', 'seller', 'delivery_boy', 'affiliate'];

export async function GET(req) {
  const auth = await requireRole(ALLOWED_ROLES);
  if (auth.response) return auth.response;
  const myId = auth.session?.uid;
  if (!myId) return fail('Not authenticated.', 401);
  const adminId = await getAdminUserId();
  if (!adminId) return fail('No admin user is configured.', 503);

  const sp = new URL(req.url).searchParams;
  const since = Number(sp.get('since') || 0);
  const all = await getMessagesBetween(adminId, myId);
  await markConversationRead(myId, adminId);
  const messages = since > 0 ? all.filter((m) => m.id > since) : all;
  return ok({ messages, adminId });
}

export async function POST(req) {
  const auth = await requireRole(ALLOWED_ROLES);
  if (auth.response) return auth.response;
  const myId = auth.session?.uid;
  if (!myId) return fail('Not authenticated.', 401);
  const adminId = await getAdminUserId();
  if (!adminId) return fail('No admin user is configured.', 503);

  const body = await req.json().catch(() => ({}));
  try {
    const id = await sendMessage({ fromId: myId, toId: adminId, message: body?.message });
    return ok({ id, adminId }, { message: 'Sent.' });
  } catch (e) {
    return fail(e.message || 'Send failed.', 422);
  }
}