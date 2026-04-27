import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setSetting } from '@/lib/settings';

const ALLOWED = new Set(['firebase', 'custom_sms']);

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  const method = String(body?.authentication_method || '').toLowerCase();
  if (!ALLOWED.has(method)) return fail('Invalid authentication method.', 422);
  await setSetting('authentication_settings', { authentication_method: method });
  return ok({}, { message: 'Authentication settings updated.' });
}