import { ok } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { query } from '@/lib/db';

export async function GET() {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const rows = await query('SELECT id, name FROM attribute_set ORDER BY name LIMIT 500');
  return ok({ rows });
}