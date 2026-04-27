import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { mergeSetting, setSetting } from '@/lib/settings';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    if (body?.system_settings && typeof body.system_settings === 'object') {
      await mergeSetting('system_settings', body.system_settings);
    }
    if (typeof body?.logo === 'string') await setSetting('logo', body.logo);
    if (typeof body?.favicon === 'string') await setSetting('favicon', body.favicon);
    if (typeof body?.currency === 'string') await setSetting('currency', body.currency);
    return ok({}, { message: 'Settings updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}