import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createAttributeValue } from '@/lib/repos/attribute-value';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createAttributeValue(body);
    return ok({ id }, { message: 'Attribute value created.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}