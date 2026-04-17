import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth/jwt';

const ROLE_GATES = [
  { prefix: '/admin', roles: ['admin'], loginPath: '/login?next=/admin' },
  { prefix: '/seller', roles: ['admin', 'seller'], loginPath: '/login?next=/seller' },
  { prefix: '/delivery', roles: ['admin', 'delivery_boy'], loginPath: '/login?next=/delivery' },
  { prefix: '/affiliate', roles: ['admin', 'affiliate'], loginPath: '/login?next=/affiliate' },
];

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const gate = ROLE_GATES.find((g) => pathname.startsWith(g.prefix));
  if (!gate) return NextResponse.next();

  const token = req.cookies.get('session')?.value;
  const payload = await verifyJwt(token);
  if (!payload || !gate.roles.includes(payload.role)) {
    return NextResponse.redirect(new URL(gate.loginPath, req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*', '/delivery/:path*', '/affiliate/:path*'],
};