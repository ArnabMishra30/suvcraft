import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { deleteMedia } from '@/lib/repos/media';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

const UPLOAD_BASE = process.env.UPLOAD_DIR || 'C:/xampp/htdocs/ecommerce/uploads';

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await deleteMedia(id);
  if (!row) return fail('Not found.', 404);
  try {
    const sub = String(row.sub_directory || '').replace(/^\/?(uploads\/?)?/, '');
    const ext = String(row.extension || '').replace(/^\./, '');
    const fname = String(row.name || '').toLowerCase().endsWith(`.${ext.toLowerCase()}`)
      ? row.name
      : `${row.name}.${ext}`;
    await unlink(path.join(UPLOAD_BASE, sub, fname));
  } catch { /* ignore missing files */ }
  return ok({ id: Number(id) }, { message: 'Media deleted.' });
}