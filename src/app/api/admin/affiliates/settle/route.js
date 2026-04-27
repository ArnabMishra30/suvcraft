import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { settleAllCommissions } from '@/lib/repos/affiliate';

export async function POST() {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  try {
    const r = await settleAllCommissions();
    return ok(r, { message: `Settled commission for ${r.credited} affiliate${r.credited === 1 ? '' : 's'}.` });
  } catch (e) {
    return fail(e.message || 'Settle failed.', 422);
  }
}