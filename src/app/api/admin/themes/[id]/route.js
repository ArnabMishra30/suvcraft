import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setThemeStatus, setDefaultTheme } from '@/lib/repos/theme';

export async function PATCH(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body?.is_default === 1 || body?.is_default === true) {
    await setDefaultTheme(id);
    return ok({}, { message: 'Default theme updated.' });
  }
  if (body?.status != null) {
    await setThemeStatus(id, body.status);
    return ok({}, { message: 'Theme status updated.' });
  }
  return fail('Nothing to update.', 422);
}