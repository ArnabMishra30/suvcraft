import { ok, fail } from '@/lib/api-response';
import { findUserByIdentity, getPrimaryRole, getStatus, publicUser } from '@/lib/repos/user';
import { verifyPassword } from '@/lib/auth/password';
import { setSession } from '@/lib/auth/session';

const REDIRECT = {
  admin: '/admin',
  seller: '/seller',
  delivery_boy: '/delivery',
  affiliate: '/affiliate',
  members: '/account',
};

const STATUS_MSG = {
  0: 'Your account is deactivated.',
  2: 'Your account is not yet approved.',
  7: 'Your account has been removed by the admin. Contact admin for more information.',
};

export async function POST(req) {
  const { identity, password } = await req.json().catch(() => ({}));
  if (!identity || !password) return fail('Identity and password are required.', 422);

  const user = await findUserByIdentity(String(identity).trim());
  if (!user) return fail('Incorrect login.', 401);

  const isEmail = /@/.test(identity);
  if (isEmail && user.email_verified === 0) return fail('Please verify your email address before logging in.');
  if (!isEmail && user.mobile_verified === 0) return fail('Please verify your mobile number before logging in.');

  const okPass = await verifyPassword(password, user.password);
  if (!okPass) return fail('Incorrect login.', 401);

  if (user.active !== 1) return fail('Your account is not active.', 403);

  const role = await getPrimaryRole(user.id);
  if (!role) return fail('No role assigned to this account.', 403);

  if (role !== 'admin' && role !== 'members') {
    const status = await getStatus(user.id);
    if (status !== 1) return fail(STATUS_MSG[status] || 'Account not active.', 403);
  }

  await setSession({ uid: user.id, role });

  return ok({
    user: publicUser(user),
    role,
    redirect: REDIRECT[role] || '/',
  }, { message: 'Logged in successfully' });
}