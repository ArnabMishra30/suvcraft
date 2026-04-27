import path from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getLanguage } from '@/lib/repos/language';

export const runtime = 'nodejs';

const UPLOAD_BASE = process.env.UPLOAD_DIR || 'C:/xampp/htdocs/ecommerce/uploads';

export async function POST(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const lang = await getLanguage(id);
  if (!lang) return fail('Language not found.', 404);

  let fd;
  try { fd = await req.formData(); } catch { return fail('Invalid multipart body.', 400); }
  const file = fd.get('file');
  if (!file || typeof file === 'string') return fail('No file uploaded.', 422);
  const ext = path.extname(file.name || '').toLowerCase();
  if (!['.json', '.csv'].includes(ext)) return fail('Only .json or .csv translation files are accepted.', 415);

  const dir = path.join(UPLOAD_BASE, 'languages');
  await mkdir(dir, { recursive: true });
  const dest = path.join(dir, `${lang.code}${ext}`);
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return ok({ path: `uploads/languages/${lang.code}${ext}` }, { message: `Translations file saved for "${lang.language}".` });
}