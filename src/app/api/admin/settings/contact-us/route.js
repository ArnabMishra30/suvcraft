import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setSetting } from '@/lib/settings';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  const html = String(body?.html ?? '');
  if (!html.trim()) return fail('Contact Us content cannot be empty.', 422);
  await setSetting('contact_us', html);
  return ok({}, { message: 'Contact Us updated.' });
}