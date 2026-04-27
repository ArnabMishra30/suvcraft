import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { mergeSetting } from '@/lib/settings';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  if (!body || typeof body !== 'object') return fail('Invalid body.', 400);

  if (Number(body.local_shipping_method) !== 1 && Number(body.shiprocket_shipping_method) !== 1) {
    return fail('At least one shipping method (Local or Shiprocket) must be enabled.', 422);
  }
  if (Number(body.shiprocket_shipping_method) === 1) {
    if (!String(body.email || '').trim()) return fail('Shiprocket email is required when Standard shipping is enabled.', 422);
    if (!String(body.password || '').trim()) return fail('Shiprocket password is required when Standard shipping is enabled.', 422);
  }

  try {
    await mergeSetting('shipping_method', body);
    return ok({}, { message: 'Shipping settings updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}