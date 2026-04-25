import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createZipcode, deleteZipcodes } from '@/lib/repos/location';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createZipcode(body);
    return ok({ id }, { message: 'Zipcode added.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}

export async function DELETE(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body?.ids) ? body.ids : [];
  if (!ids.length) return fail('No zipcodes selected.', 422);
  const count = await deleteZipcodes(ids);
  return ok({ count }, { message: `${count} zipcode${count === 1 ? '' : 's'} deleted.` });
}