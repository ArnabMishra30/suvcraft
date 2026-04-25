import { query, getPool } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

export const DB_STATUS = {
  0: { label: 'Not Approved', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  1: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  7: { label: 'Removed', cls: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
};

export async function listDeliveryBoys({ page = 1, perPage = 20, search = '', status = '' } = {}) {
  const where = ['ug.group_id = 3'];
  const params = [];
  if (search) {
    where.push('(u.id = ? OR u.username LIKE ? OR u.email LIKE ? OR u.mobile LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  if (status !== '' && status != null) { where.push('u.status = ?'); params.push(Number(status)); }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT u.id, u.username AS name, u.email, u.mobile, u.address, u.city, u.area,
              u.bonus_type, u.bonus, u.balance, u.cash_received, u.status, u.created_on,
              u.driving_license, c.name AS city_name
         FROM users u
         JOIN users_groups ug ON ug.user_id = u.id
         LEFT JOIN cities c ON c.id = u.city
         ${whereSql}
         ORDER BY u.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM users u JOIN users_groups ug ON ug.user_id = u.id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getDeliveryBoy(id) {
  const rows = await query(
    `SELECT u.*, c.name AS city_name
       FROM users u
       LEFT JOIN cities c ON c.id = u.city
       WHERE u.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function generateReferralCode() {
  const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function createDeliveryBoy(input) {
  const username = String(input.name || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const mobile = String(input.mobile || '').trim();
  const password = String(input.password || '');
  if (!username) throw new Error('Name is required.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Valid email is required.');
  if (!mobile) throw new Error('Mobile is required.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  if (input.confirm_password != null && input.confirm_password !== password) throw new Error('Passwords do not match.');
  if (!input.bonus_type) throw new Error('Bonus type is required.');
  if (!input.city) throw new Error('City is required.');

  const dupe = await query('SELECT id FROM users WHERE email = ? OR mobile = ? LIMIT 1', [email, mobile]);
  if (dupe.length) throw new Error('A user with this email or mobile already exists.');

  const hashed = await hashPassword(password);
  const referral = await generateReferralCode();
  const now = Math.floor(Date.now() / 1000);

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.execute(
      `INSERT INTO users
        (username, password, email, mobile, address, city, area, bonus_type, bonus,
         driving_license, country_code, active, status, mobile_verified, email_verified,
         referral_code, created_on, type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1, 1, ?, ?, 'phone')`,
      [
        username, hashed, email, mobile,
        input.address || '', String(input.city || ''), String(input.area || ''),
        input.bonus_type, Number(input.bonus || 0),
        input.driving_license || '', Number(input.country_code || 0),
        Number(input.status ?? 0), referral, now,
      ]
    );
    const userId = r.insertId;
    await conn.execute('INSERT INTO users_groups (user_id, group_id) VALUES (?, 3)', [userId]);
    await conn.commit();
    return userId;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function updateDeliveryBoy(id, input) {
  const username = String(input.name || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const mobile = String(input.mobile || '').trim();
  if (!username) throw new Error('Name is required.');
  if (!email) throw new Error('Email is required.');
  if (!mobile) throw new Error('Mobile is required.');
  if (!input.bonus_type) throw new Error('Bonus type is required.');
  if (!input.city) throw new Error('City is required.');

  const dupe = await query('SELECT id FROM users WHERE (email = ? OR mobile = ?) AND id != ? LIMIT 1', [email, mobile, id]);
  if (dupe.length) throw new Error('Another user already has this email or mobile.');

  const fields = ['username = ?', 'email = ?', 'mobile = ?', 'address = ?', 'city = ?', 'area = ?', 'bonus_type = ?', 'bonus = ?', 'status = ?'];
  const params = [
    username, email, mobile, input.address || '',
    String(input.city || ''), String(input.area || ''),
    input.bonus_type, Number(input.bonus || 0),
    Number(input.status ?? 0),
  ];
  if (input.driving_license != null) { fields.push('driving_license = ?'); params.push(input.driving_license || ''); }
  if (input.password) { fields.push('password = ?'); params.push(await hashPassword(input.password)); }
  params.push(id);

  const r = await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
  return r.affectedRows > 0;
}

export async function setDeliveryBoyStatus(id, status) {
  const r = await query('UPDATE users SET status = ? WHERE id = ?', [Number(status), id]);
  return r.affectedRows > 0;
}

export async function deleteDeliveryBoy(id) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM users_groups WHERE user_id = ? AND group_id = 3', [id]);
    await conn.execute('DELETE FROM users WHERE id = ?', [id]);
    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function listCitiesForFilter() {
  return query('SELECT id, name FROM cities ORDER BY name LIMIT 2000');
}

export async function listDeliveryBoysForFilter() {
  return query(
    `SELECT u.id, COALESCE(NULLIF(u.username, ''), CONCAT('User #', u.id)) AS name
       FROM users u JOIN users_groups ug ON ug.user_id = u.id
       WHERE ug.group_id = 3 ORDER BY u.username LIMIT 1000`
  );
}

export async function listCashTransactions({ page = 1, perPage = 20, search = '', status = '', from = '', to = '' } = {}) {
  const where = ['ug.group_id = 3'];
  const params = [];
  if (search) {
    where.push('(wt.id = ? OR u.username LIKE ? OR u.mobile LIKE ? OR wt.message LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  if (status === 'received') {
    where.push('wt.message LIKE ?');
    params.push('%Cash received%');
  } else if (status === 'collected') {
    where.push('wt.message LIKE ?');
    params.push('%collected by admin%');
  }
  if (from) { where.push('wt.date_created >= ?'); params.push(`${from} 00:00:00`); }
  if (to) { where.push('wt.date_created <= ?'); params.push(`${to} 23:59:59`); }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT wt.id, wt.user_id, wt.type, wt.amount, wt.message, wt.status, wt.date_created,
              u.username, u.mobile
         FROM wallet_transactions wt
         JOIN users u ON u.id = wt.user_id
         JOIN users_groups ug ON ug.user_id = u.id
         ${whereSql}
         ORDER BY wt.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM wallet_transactions wt JOIN users u ON u.id = wt.user_id JOIN users_groups ug ON ug.user_id = u.id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function listFundTransfers({ page = 1, perPage = 20, search = '', deliveryBoyId = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(ft.id = ? OR u.username LIKE ? OR u.mobile LIKE ? OR ft.message LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  if (deliveryBoyId) { where.push('ft.delivery_boy_id = ?'); params.push(Number(deliveryBoyId)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT ft.id, ft.delivery_boy_id, ft.opening_balance, ft.closing_balance, ft.amount,
              ft.status, ft.message, ft.date_created,
              u.username AS name, u.mobile
         FROM fund_transfers ft
         LEFT JOIN users u ON u.id = ft.delivery_boy_id
         ${whereSql}
         ORDER BY ft.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM fund_transfers ft LEFT JOIN users u ON u.id = ft.delivery_boy_id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}