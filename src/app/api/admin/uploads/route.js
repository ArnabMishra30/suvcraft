import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { insertMedia } from '@/lib/repos/media';

export const runtime = 'nodejs';

const UPLOAD_BASE = process.env.UPLOAD_DIR || 'C:/xampp/htdocs/ecommerce/uploads';

const ALLOWED = {
  image: { exts: new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']), max: 10 * 1024 * 1024, folder: 'media', type: 'image' },
  audio: { exts: new Set(['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac']), max: 50 * 1024 * 1024, folder: 'audio', type: 'audio' },
  video: { exts: new Set(['.mp4', '.webm', '.ogv', '.mov', '.avi', '.mkv']), max: 200 * 1024 * 1024, folder: 'videos', type: 'video' },
  archive: { exts: new Set(['.zip', '.rar', '.7z', '.tar', '.gz']), max: 200 * 1024 * 1024, folder: 'archives', type: 'archive' },
  spreadsheet: { exts: new Set(['.xls', '.xlsx', '.csv', '.ods']), max: 50 * 1024 * 1024, folder: 'spreadsheets', type: 'spreadsheet' },
  document: { exts: new Set(['.pdf', '.doc', '.docx', '.txt', '.odt', '.rtf', '.md']), max: 50 * 1024 * 1024, folder: 'documents', type: 'document' },
  any: { exts: null, max: 200 * 1024 * 1024, folder: 'files', type: 'file' },
};

function detectKind(ext) {
  for (const [k, cfg] of Object.entries(ALLOWED)) {
    if (k === 'any') continue;
    if (cfg.exts?.has(ext)) return k;
  }
  return 'any';
}

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  let fd;
  try { fd = await req.formData(); } catch { return fail('Invalid multipart body.', 400); }

  const file = fd.get('file');
  if (!file || typeof file === 'string') return fail('No file uploaded.', 422);

  const ext = path.extname(file.name || '').toLowerCase();
  const requestedKind = String(fd.get('kind') || '');
  const kind = requestedKind || detectKind(ext);
  const cfg = ALLOWED[kind] || ALLOWED.any;
  if (cfg.exts && !cfg.exts.has(ext)) return fail(`Unsupported file type ${ext}.`, 415);
  if (file.size > cfg.max) return fail(`File too large (max ${Math.round(cfg.max / 1024 / 1024)}MB).`, 413);

  const baseName = path.basename(file.name || `file${ext}`, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 60) || 'file';
  const stampedBase = `${baseName}-${Date.now()}`;
  const fname = `${stampedBase}${ext}`;
  const year = String(new Date().getFullYear());
  const subDir = `${cfg.folder}/${year}`;
  const subdir = path.join(UPLOAD_BASE, cfg.folder, year);
  await mkdir(subdir, { recursive: true });

  const destPath = path.join(subdir, fname);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(destPath, buf);

  const id = await insertMedia({
    title: file.name || stampedBase,
    name: stampedBase,
    extension: ext.replace(/^\./, ''),
    type: cfg.type,
    sub_directory: subDir,
    size: file.size,
  });

  const relPath = `uploads/${subDir}/${fname}`;
  return ok(
    { id, path: relPath, url: `/${relPath}`, name: file.name, size: file.size, type: file.type },
    { message: 'Uploaded.' }
  );
}