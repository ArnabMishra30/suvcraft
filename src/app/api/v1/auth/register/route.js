import { ok, fail } from '@/lib/api-response';
import { createCustomer, emailExists, mobileExists, publicUser } from '@/lib/repos/user';
import { setSession } from '@/lib/auth/session';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const mobile = String(body.mobile || '').trim();
  const password = String(body.password || '');
  const countryCode = Number(String(body.country_code || '0').replace('+', '')) || 0;

  if (!name) return fail('Name is required.', 422);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Valid email is required.', 422);
  if (mobile && !/^\d{5,16}$/.test(mobile)) return fail('Mobile number is invalid.', 422);
  if (password.length < 6) return fail('Password must be at least 6 characters.', 422);

  if (await emailExists(email)) return fail('The email is already registered. Please login.', 409);
  if (mobile && (await mobileExists(mobile))) return fail('The mobile number is already registered. Please login.', 409);

  const user = await createCustomer({ name, email, mobile, password, countryCode });
  await setSession({ uid: user.id, role: 'members' });

  return ok({ user: publicUser(user), role: 'members', redirect: '/account' }, { message: 'Registered Successfully' });
}