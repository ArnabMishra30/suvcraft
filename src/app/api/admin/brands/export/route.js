import { requireRole } from '@/lib/auth/require';
import { exportBrandsCsv } from '@/lib/repos/brand';

export async function GET() {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const csv = await exportBrandsCsv();
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="brands-export.csv"',
    },
  });
}