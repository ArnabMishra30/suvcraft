import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createBrand } from '@/lib/repos/brand';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createBrand({ name: body.name, image: body.image, status: body.status ?? 1 });
    return ok({ id }, { message: 'Brand created.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}