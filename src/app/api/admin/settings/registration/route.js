import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { mergeSetting } from '@/lib/settings';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  const web = String(body?.web_purchase_code || '').trim();
  const app = String(body?.app_purchase_code || '').trim();
  if (!web && !app) return fail('Enter at least one purchase code.', 422);
  await mergeSetting('purchase_codes', { web_purchase_code: web, app_purchase_code: app, registered_at: new Date().toISOString() });
  return ok({ registered: true }, { message: 'System registered. Enjoy selling online!' });
}