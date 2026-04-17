import { ok } from '@/lib/api-response';
import { clearSession } from '@/lib/auth/session';

export async function POST() {
  await clearSession();
  return ok({}, { message: 'Logged out' });
}