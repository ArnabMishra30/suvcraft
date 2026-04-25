import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { listMedia, bulkDeleteMedia } from '@/lib/repos/media';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

const UPLOAD_BASE = process.env.UPLOAD_DIR || 'C:/xampp/htdocs/ecommerce/uploads';

export async function GET(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const sp = new URL(req.url).searchParams;
  const result = await listMedia({
    page: Number(sp.get('page') || 1),
    perPage: Number(sp.get('perPage') || 10),
    search: sp.get('q') || '',
    kind: sp.get('kind') || '',
    from: sp.get('from') || '',
    to: sp.get('to') || '',
  });
  return ok(result);
}

export async function DELETE(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body?.ids) ? body.ids : [];
  if (!ids.length) return fail('No media selected.', 422);

  const { rows, count } = await bulkDeleteMedia(ids);
  await Promise.all(rows.map(async (row) => {
    try {
      const sub = String(row.sub_directory || '').replace(/^\/?(uploads\/?)?/, '');
      const ext = String(row.extension || '').replace(/^\./, '');
      const fname = String(row.name || '').toLowerCase().endsWith(`.${ext.toLowerCase()}`)
        ? row.name
        : `${row.name}.${ext}`;
      const full = path.join(UPLOAD_BASE, sub, fname);
      await unlink(full);
    } catch { /* ignore missing files */ }
  }));

  return ok({ count }, { message: `${count} file${count === 1 ? '' : 's'} deleted.` });
}