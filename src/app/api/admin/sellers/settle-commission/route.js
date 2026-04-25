import { ok } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';

export async function POST() {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  return ok({ settled: 0 }, { message: 'No pending commissions found.' });
}