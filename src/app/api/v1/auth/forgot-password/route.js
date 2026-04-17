import { ok, fail } from '@/lib/api-response';
import { findUserByIdentity } from '@/lib/repos/user';
import { query } from '@/lib/db';
import crypto from 'node:crypto';

export async function POST(req) {
  const { identity } = await req.json().catch(() => ({}));
  if (!identity) return fail('Email or mobile is required.', 422);

  const user = await findUserByIdentity(String(identity).trim());
  if (!user) return ok({}, { message: 'If the account exists, reset instructions have been sent.' });

  const selector = crypto.randomBytes(20).toString('hex');
  const code = crypto.randomBytes(20).toString('hex');
  const hash = crypto.createHash('sha1').update(code).digest('hex');
  const now = Math.floor(Date.now() / 1000);

  await query(
    `UPDATE users SET forgotten_password_selector = ?, forgotten_password_code = ?, forgotten_password_time = ? WHERE id = ?`,
    [selector, hash, now, user.id]
  );

  return ok({}, { message: 'If the account exists, reset instructions have been sent.' });
}