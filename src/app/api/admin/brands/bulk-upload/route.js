import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { bulkInsertBrands, bulkUpdateBrands } from '@/lib/repos/brand';
import { csvToObjects } from '@/lib/csv';

export const runtime = 'nodejs';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  let fd;
  try { fd = await req.formData(); } catch { return fail('Invalid multipart body.', 400); }

  const file = fd.get('file');
  const type = String(fd.get('type') || 'upload');
  if (!file || typeof file === 'string') return fail('No file uploaded.', 422);
  if (!['upload', 'update'].includes(type)) return fail('Invalid type.', 422);
  if (!/\.csv$/i.test(file.name || '')) return fail('Only .csv files are accepted.', 415);

  const text = new TextDecoder('utf-8').decode(await file.arrayBuffer());
  const rows = csvToObjects(text);
  if (!rows.length) return fail('CSV is empty.', 422);

  const r = type === 'upload' ? await bulkInsertBrands(rows) : await bulkUpdateBrands(rows);
  return ok({ ...r, kind: type }, { message: type === 'upload' ? `${r.created} of ${r.total} brand(s) created.` : `${r.updated} of ${r.total} brand(s) updated.` });
}