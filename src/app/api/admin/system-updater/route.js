import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';

export const runtime = 'nodejs';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  let fd;
  try { fd = await req.formData(); } catch { return fail('Invalid multipart body.', 400); }
  const file = fd.get('file');
  if (!file || typeof file === 'string') return fail('No file uploaded.', 422);
  if (!/\.zip$/i.test(file.name || '')) return fail('Only .zip files are accepted.', 415);
  // We don't actually patch a Next.js bundle from inside the app — the PHP "drop a zip" workflow
  // doesn't apply here. We just acknowledge receipt and tell the operator to redeploy.
  return ok(
    { name: file.name, size: file.size },
    { message: 'Package received. To apply an update, replace the deployed source and run `npm run build && pm2 restart`.' }
  );
}