import { getSession } from './session';
import { fail } from '@/lib/api-response';

export async function requireRole(roles) {
  const session = await getSession();
  if (!session) return { session: null, response: fail('Not authenticated.', 401) };
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(session.role)) {
    return { session, response: fail('Forbidden.', 403) };
  }
  return { session, response: null };
}