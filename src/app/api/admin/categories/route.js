import { ok } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { listAllCategoriesForForm } from '@/lib/repos/product';

export async function GET() {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const rows = await listAllCategoriesForForm();
  return ok({ categories: rows });
}