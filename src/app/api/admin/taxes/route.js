import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createTax } from '@/lib/repos/tax';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createTax({ title: body.title, percentage: body.percentage, status: body.status ?? 1 });
    return ok({ id }, { message: 'Tax created.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}