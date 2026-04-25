import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { csvToObjects } from '@/lib/csv';
import {
  bulkInsertZipcodes, bulkUpdateZipcodes,
  bulkInsertCities, bulkUpdateCities,
} from '@/lib/repos/location';

export const runtime = 'nodejs';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  let fd;
  try { fd = await req.formData(); } catch { return fail('Invalid multipart body.', 400); }

  const file = fd.get('file');
  const type = String(fd.get('type') || '');
  const locationType = String(fd.get('locationType') || '');

  if (!file || typeof file === 'string') return fail('No file uploaded.', 422);
  if (!['upload', 'update'].includes(type)) return fail('Type must be upload or update.', 422);
  if (!['zipcodes', 'cities'].includes(locationType)) return fail('Location Type must be zipcodes or cities.', 422);
  if (!/\.csv$/i.test(file.name || '')) return fail('Only .csv files are accepted.', 415);

  const text = new TextDecoder('utf-8').decode(await file.arrayBuffer());
  const rows = csvToObjects(text);
  if (!rows.length) return fail('CSV is empty or has no data rows.', 422);

  let result;
  if (locationType === 'zipcodes') {
    result = type === 'upload' ? await bulkInsertZipcodes(rows) : await bulkUpdateZipcodes(rows);
  } else {
    result = type === 'upload' ? await bulkInsertCities(rows) : await bulkUpdateCities(rows);
  }

  const noun = locationType === 'zipcodes' ? 'zipcode' : 'city';
  const verb = type === 'upload' ? 'created' : 'updated';
  const count = type === 'upload' ? result.created : result.updated;
  return ok({ ...result, kind: type, locationType }, { message: `${count} of ${result.total} ${noun}(s) ${verb}.` });
}