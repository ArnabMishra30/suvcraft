import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createDeliveryBoy } from '@/lib/repos/delivery-boy';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createDeliveryBoy(body);
    return ok({ id }, { message: 'Delivery boy created.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}