import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setSetting } from '@/lib/settings';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  if (!body || typeof body !== 'object') return fail('Invalid body.', 400);
  await setSetting('sms_gateway_settings', {
    base_url: String(body.base_url || ''),
    sms_gateway_method: String(body.sms_gateway_method || 'POST').toUpperCase(),
    account_sid: String(body.account_sid || ''),
    auth_token: String(body.auth_token || ''),
    text_format_data: String(body.text_format_data || ''),
    header_key: Array.isArray(body.header_key) ? body.header_key : [],
    header_value: Array.isArray(body.header_value) ? body.header_value : [],
    body_key: Array.isArray(body.body_key) ? body.body_key : [],
    body_value: Array.isArray(body.body_value) ? body.body_value : [],
    params_key: Array.isArray(body.params_key) ? body.params_key : [],
    params_value: Array.isArray(body.params_value) ? body.params_value : [],
  });
  return ok({}, { message: 'SMS gateway settings updated.' });
}