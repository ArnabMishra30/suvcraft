import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setSetting } from '@/lib/settings';

const FIELDS = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId'];

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  const next = {};
  for (const f of FIELDS) {
    const v = String(body?.[f] ?? '').trim();
    if (!v) return fail(`${f} is required.`, 422);
    next[f] = v;
  }
  await setSetting('firebase_settings', next);
  return ok({}, { message: 'Firebase settings updated.' });
}