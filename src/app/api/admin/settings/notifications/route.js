import path from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setSetting } from '@/lib/settings';

export const runtime = 'nodejs';

const UPLOAD_BASE = process.env.UPLOAD_DIR || 'C:/xampp/htdocs/ecommerce/uploads';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  let fd;
  try { fd = await req.formData(); } catch { return fail('Invalid multipart body.', 400); }

  const vapId = String(fd.get('vap_id_key') || '').trim();
  const projectId = String(fd.get('firebase_project_id') || '').trim();
  if (!vapId) return fail('VAP ID Key is required.', 422);
  if (!projectId) return fail('Firebase Project ID is required.', 422);

  await setSetting('vap_id_Key', vapId);
  await setSetting('firebase_project_id', projectId);

  const file = fd.get('service_account_file');
  if (file && typeof file !== 'string' && file.size > 0) {
    const ext = path.extname(file.name || '').toLowerCase();
    if (ext !== '.json') return fail('Service account file must be a .json file.', 415);
    const subDir = 'firebase';
    const dir = path.join(UPLOAD_BASE, subDir);
    await mkdir(dir, { recursive: true });
    const fname = `service-account-${Date.now()}.json`;
    const dest = path.join(dir, fname);
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(dest, buf);
    await setSetting('firebase_service_account_file', `uploads/${subDir}/${fname}`);
  }

  return ok({}, { message: 'Notification settings updated.' });
}