import { requireRole } from '@/lib/auth/require';
import { exportCategoriesCsv } from '@/lib/repos/category';

export async function GET() {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const csv = await exportCategoriesCsv();
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="categories-export.csv"',
    },
  });
}