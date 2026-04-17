import { ok, fail } from '@/lib/api-response';
import { getSession } from '@/lib/auth/session';
import { findUserById, publicUser } from '@/lib/repos/user';

export async function GET() {
  const session = await getSession();
  if (!session) return fail('Not authenticated.', 401);
  const user = await findUserById(session.uid);
  if (!user) return fail('User not found.', 404);
  return ok({ user: publicUser(user), role: session.role });
}