import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createApiKey } from '@/lib/repos/api-key';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const data = await createApiKey(body);
    return ok(data, { message: 'Client API key created.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}