import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createAttribute } from '@/lib/repos/attribute';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createAttribute({
      name: body.name,
      attribute_set_id: body.attribute_set_id,
      status: body.status ?? 1,
      values: Array.isArray(body.values) ? body.values : [],
    });
    return ok({ id }, { message: 'Attribute created.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}