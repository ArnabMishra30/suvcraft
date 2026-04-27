import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createSystemUser } from '@/lib/repos/system-user';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createSystemUser(body);
    return ok({ id }, { message: 'System user created.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}