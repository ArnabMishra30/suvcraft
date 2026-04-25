import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { listAllCategoriesForForm } from '@/lib/repos/product';
import { createCategory } from '@/lib/repos/category';

export async function GET() {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const rows = await listAllCategoriesForForm();
  return ok({ categories: rows });
}

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createCategory(body);
    return ok({ id }, { message: 'Category created.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}