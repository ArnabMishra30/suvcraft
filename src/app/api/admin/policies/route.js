import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setSetting } from '@/lib/settings';
import { isAllowedPolicyKey } from '@/lib/policies';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  const key = String(body?.key || '');
  if (!isAllowedPolicyKey(key)) return fail('Unknown policy key.', 422);
  const html = String(body?.html ?? '');
  if (!html.trim()) return fail('Policy content cannot be empty.', 422);
  await setSetting(key, html);
  return ok({}, { message: 'Policy updated.' });
}