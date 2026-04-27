import crypto from 'node:crypto';
import { query, getPool } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

export const AFFILIATE_STATUS = {
  0: { label: 'Not Approved', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  1: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  2: { label: 'Suspended', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
};

export async function listAffiliates({ page = 1, perPage = 20, search = '', status = '' } = {}) {
  const where = ['ug.group_id = 5'];
  const params = [];
  if (search) {
    where.push('(u.id = ? OR u.username LIKE ? OR u.email LIKE ? OR u.mobile LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  if (status === '0' || status === '1' || status === '2') { where.push('a.status = ?'); params.push(Number(status)); }
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT u.id, u.username AS name, u.email, u.mobile, u.created_on,
              a.id AS affiliate_id, a.uuid, a.website_url, a.mobile_app_url,
              a.status, a.affiliate_wallet_balance, a.commission_type, a.default_commission_rate
         FROM users u
         JOIN users_groups ug ON ug.user_id = u.id
         LEFT JOIN affiliates a ON a.user_id = u.id
         ${whereSql}
         ORDER BY u.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(
      `SELECT COUNT(*) AS c FROM users u JOIN users_groups ug ON ug.user_id = u.id LEFT JOIN affiliates a ON a.user_id = u.id ${whereSql}`,
      params
    ),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function createAffiliate(input) {
  const username = String(input.name || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const mobile = String(input.mobile || '').trim();
  const password = String(input.password || '');
  const confirm = String(input.confirm_password || '');
  const address = String(input.address || '').trim();
  const websiteUrl = String(input.website_url || '').trim();
  const appUrl = String(input.mobile_app_url || '').trim();
  if (!username) throw new Error('Full name is required.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Valid email is required.');
  if (!mobile) throw new Error('Mobile is required.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  if (password !== confirm) throw new Error('Passwords do not match.');
  if (!address) throw new Error('Address is required.');
  if (!websiteUrl) throw new Error('Website URL is required.');

  const dupe = await query('SELECT id FROM users WHERE email = ? OR mobile = ? LIMIT 1', [email, mobile]);
  if (dupe.length) throw new Error('A user with this email or mobile already exists.');

  const hashed = await hashPassword(password);
  const now = Math.floor(Date.now() / 1000);
  const status = Number(input.status) === 1 ? 1 : 0;

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.execute(
      `INSERT INTO users (username, password, email, mobile, address, active, mobile_verified, email_verified, created_on, type)
       VALUES (?, ?, ?, ?, ?, 1, 1, 1, ?, 'phone')`,
      [username, hashed, email, mobile, address, now]
    );
    const userId = r.insertId;
    await conn.execute('INSERT INTO users_groups (user_id, group_id) VALUES (?, 5)', [userId]);
    await conn.execute(
      `INSERT INTO affiliates (uuid, user_id, website_url, mobile_app_url, status, commission_type, default_commission_rate)
       VALUES (?, ?, ?, ?, ?, 'percentage', 0)`,
      [crypto.randomUUID(), userId, websiteUrl, appUrl, status]
    );
    await conn.commit();
    return userId;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function setAffiliateStatus(userId, status) {
  const s = Number(status);
  if (![0, 1, 2].includes(s)) throw new Error('Invalid status.');
  const r = await query('UPDATE affiliates SET status = ? WHERE user_id = ?', [s, userId]);
  return r.affectedRows > 0;
}

export async function deleteAffiliate(userId) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM affiliates WHERE user_id = ?', [userId]);
    await conn.execute('DELETE FROM users_groups WHERE user_id = ? AND group_id = 5', [userId]);
    await conn.execute('DELETE FROM users WHERE id = ?', [userId]);
    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function getAffiliateStats() {
  const [orderRow, userRow, earningRow] = await Promise.all([
    query(
      `SELECT COUNT(DISTINCT t.id) AS c
         FROM affiliate_tracking t
         WHERE t.usage_count > 0`
    ).catch(() => [{ c: 0 }]),
    query(`SELECT COUNT(*) AS c FROM affiliates`).catch(() => [{ c: 0 }]),
    query(`SELECT COALESCE(SUM(commission_earned), 0) AS s FROM affiliate_tracking`).catch(() => [{ s: 0 }]),
  ]);
  return {
    orders: Number(orderRow[0]?.c || 0),
    users: Number(userRow[0]?.c || 0),
    earnings: Number(earningRow[0]?.s || 0),
  };
}

export async function settleAllCommissions() {
  // For each affiliate, sum tracked commission and credit it to their wallet, then zero the trackers.
  const rows = await query(
    `SELECT a.user_id, COALESCE(SUM(t.commission_earned), 0) AS pending
       FROM affiliates a
       LEFT JOIN affiliate_tracking t ON t.affiliate_id = a.id
       GROUP BY a.user_id
       HAVING pending > 0`
  );
  let credited = 0;
  for (const row of rows) {
    await query('UPDATE affiliates SET affiliate_wallet_balance = affiliate_wallet_balance + ? WHERE user_id = ?', [row.pending, row.user_id]);
    await query(
      `INSERT INTO affiliate_wallet_transactions (user_id, amount, type, reference_type, message)
       VALUES (?, ?, 'credit', 'commission_settlement', ?)`,
      [row.user_id, row.pending, 'Bulk commission settlement']
    );
    credited++;
  }
  await query(`UPDATE affiliate_tracking SET commission_earned = 0`);
  return { credited };
}