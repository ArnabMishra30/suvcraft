import { ok } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { listMedia } from '@/lib/repos/media';

export async function GET(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const sp = new URL(req.url).searchParams;
  const result = await listMedia({
    page: Number(sp.get('page') || 1),
    perPage: Number(sp.get('perPage') || 10),
    search: sp.get('q') || '',
    kind: sp.get('kind') || '',
  });
  return ok(result);
}