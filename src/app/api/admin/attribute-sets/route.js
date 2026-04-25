import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createAttributeSet } from '@/lib/repos/attribute-set';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createAttributeSet({ name: body.name, status: body.status ?? 1 });
    return ok({ id }, { message: 'Attribute set created.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}