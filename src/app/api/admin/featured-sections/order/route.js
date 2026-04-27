import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { reorderSections } from '@/lib/repos/section';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  if (!Array.isArray(body?.ids)) return fail('ids array is required.', 422);
  await reorderSections(body.ids);
  return ok({}, { message: 'Order updated.' });
}