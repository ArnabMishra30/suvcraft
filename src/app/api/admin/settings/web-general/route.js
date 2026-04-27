import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { mergeSetting, setSetting } from '@/lib/settings';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  if (!body || typeof body !== 'object') return fail('Invalid body.', 400);

  // Required fields
  for (const f of ['site_title', 'support_number', 'support_email', 'copyright_details', 'address']) {
    if (!String(body?.[f] || '').trim()) return fail(`${f.replace(/_/g, ' ')} is required.`, 422);
  }

  try {
    await mergeSetting('web_settings', body);
    if (typeof body.logo === 'string') await setSetting('web_logo', body.logo);
    if (typeof body.favicon === 'string') await setSetting('web_favicon', body.favicon);
    return ok({}, { message: 'General website settings updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}