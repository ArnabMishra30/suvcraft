import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setSetting } from '@/lib/settings';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));

  const enabled = Number(body?.is_time_slots_enabled) ? '1' : '0';
  const startsFrom = String(body?.delivery_starts_from || '0');
  const allowedDays = String(body?.allowed_days || '7');
  if (!/^\d+$/.test(startsFrom)) return fail('Delivery Starts From is invalid.', 422);
  if (!/^\d+$/.test(allowedDays) || Number(allowedDays) < 1) return fail('Allowed days must be a positive integer.', 422);

  try {
    await setSetting('time_slot_config', {
      time_slot_config: '1',
      is_time_slots_enabled: enabled,
      delivery_starts_from: startsFrom,
      allowed_days: allowedDays,
    });
    return ok({}, { message: 'Time slot settings updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}