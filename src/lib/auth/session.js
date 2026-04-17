import { cookies } from 'next/headers';
import { signJwt, verifyJwt } from './jwt';

const COOKIE = 'session';
const MAX_AGE = 60 * 60 * 24 * 30;

export async function setSession(payload) {
  const token = await signJwt(payload, MAX_AGE);
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function getSession() {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  return verifyJwt(token);
}