import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { bulkInsertCategories, bulkUpdateCategories } from '@/lib/repos/category';
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
  if (!rows.length) return fail('CSV is empty or has no data rows.', 422);

  if (type === 'upload') {
    const r = await bulkInsertCategories(rows);
    return ok(r, { message: `${r.created} of ${r.total} category(ies) created.` });
  } else {
    const r = await bulkUpdateCategories(rows);
    return ok(r, { message: `${r.updated} of ${r.total} category(ies) updated.` });
  }
}