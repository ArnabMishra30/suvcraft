import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createSlider } from '@/lib/repos/slider';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createSlider(body);
    return ok({ id }, { message: 'Slider added.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}