import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

export const ROLE = {
  admin: 1,
  members: 2,
  delivery_boy: 3,
  seller: 4,
  affiliate: 5,
};

export const ROLE_NAME = Object.fromEntries(Object.entries(ROLE).map(([k, v]) => [v, k]));

export async function findUserByIdentity(identity) {
  if (!identity) return null;
  const isEmail = /@/.test(identity);
  const col = isEmail ? 'email' : 'mobile';
  const rows = await query(`SELECT * FROM users WHERE ${col} = ? LIMIT 1`, [identity]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function getUserRoles(userId) {
  const rows = await query(
    'SELECT g.id, g.name FROM users_groups ug JOIN `groups` g ON g.id = ug.group_id WHERE ug.user_id = ?',
    [userId]
  );
  return rows;
}

export async function getPrimaryRole(userId) {
  const roles = await getUserRoles(userId);
  if (!roles.length) return null;
  const priority = ['admin', 'seller', 'delivery_boy', 'affiliate', 'members'];
  for (const name of priority) {
    const found = roles.find((r) => r.name === name);
    if (found) return found.name;
  }
  return roles[0].name;
}

export async function emailExists(email) {
  const rows = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  return rows.length > 0;
}

export async function mobileExists(mobile) {
  const rows = await query('SELECT id FROM users WHERE mobile = ? LIMIT 1', [mobile]);
  return rows.length > 0;
}

export async function createCustomer({ name, email, mobile, password, countryCode = 0 }) {
  const hash = await hashPassword(password);
  const referralCode = randomCode(8);
  const now = Math.floor(Date.now() / 1000);

  const result = await query(
    `INSERT INTO users
      (username, email, mobile, password, country_code, referral_code, active, created_on, email_verified, mobile_verified, type)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, 0, 0, 'email')`,
    [name, email, mobile || null, hash, countryCode, referralCode, now]
  );

  await query('INSERT INTO users_groups (user_id, group_id) VALUES (?, ?)', [
    result.insertId,
    ROLE.members,
  ]);

  return findUserById(result.insertId);
}

export async function getStatus(userId) {
  const rows = await query('SELECT status FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows.length ? Number(rows[0].status) : 1;
}

function randomCode(len) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function publicUser(u) {
  if (!u) return null;
  const { password, activation_code, forgotten_password_code, remember_code, apikey, ...rest } = u;
  return rest;
}