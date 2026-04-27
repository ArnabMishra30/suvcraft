import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { mergeSetting } from '@/lib/settings';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  if (!body || typeof body !== 'object') return fail('Invalid body.', 400);

  const next = {};
  if ('permanent_account_delete_days' in body) {
    const v = Number(body.permanent_account_delete_days);
    if (!Number.isFinite(v) || v < 0) return fail('Permanent Account Delete Days must be a non-negative number.', 422);
    next.permanent_account_delete_days = String(v);
  }
  if ('max_withdrawal_amount' in body) {
    const v = Number(body.max_withdrawal_amount);
    if (!Number.isFinite(v) || v < 0) return fail('Max Withdrawal Amount must be a non-negative number.', 422);
    next.max_withdrawal_amount = String(v);
  }
  if ('min_withdrawal_balance' in body) {
    const v = Number(body.min_withdrawal_balance);
    if (!Number.isFinite(v) || v < 0) return fail('Min Withdrawal Balance must be a non-negative number.', 422);
    next.min_withdrawal_balance = String(v);
  }
  if ('category_commissions' in body) {
    if (!Array.isArray(body.category_commissions)) return fail('category_commissions must be an array.', 422);
    const seen = new Set();
    const list = [];
    for (const row of body.category_commissions) {
      const cid = Number(row?.category_id);
      const pct = Number(row?.commission);
      if (!cid) continue;
      if (seen.has(cid)) return fail('A category appears more than once. Each category can be listed only once.', 422);
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) return fail('Commission must be between 0 and 100.', 422);
      seen.add(cid);
      list.push({ category_id: cid, commission: pct });
    }
    next.category_commissions = list;
  }

  await mergeSetting('affiliate_settings', next);
  return ok({}, { message: 'Affiliate settings updated.' });
}