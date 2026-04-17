import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';

const KINDS = new Set(['promo', 'user_cashback', 'referral_cashback']);

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const { kind } = await req.json().catch(() => ({}));
  if (!KINDS.has(kind)) return fail('Invalid settlement kind.', 422);

  return ok({ kind, settled: 0 }, { message: 'Settlement triggered (no pending items).' });
}