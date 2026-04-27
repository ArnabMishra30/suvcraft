import { query, getPool } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { sanitizePermissions } from '@/lib/system-modules';

const ADMIN_GROUP_ID = 1;

function parsePerms(raw) {
  if (raw == null) return null;
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function listSystemUsers({ page = 1, perPage = 20, search = '' } = {}) {
  const where = ['ug.group_id = ?'];
  const params = [ADMIN_GROUP_ID];
  if (search) {
    where.push('(u.id = ? OR u.username LIKE ? OR u.email LIKE ? OR u.mobile LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT u.id, u.username, u.mobile, u.email, u.active,
              up.role, up.permissions
         FROM users u
         JOIN users_groups ug ON ug.user_id = u.id
         LEFT JOIN user_permissions up ON up.user_id = u.id
         ${whereSql}
         ORDER BY u.id ASC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(
      `SELECT COUNT(*) AS c
         FROM users u JOIN users_groups ug ON ug.user_id = u.id
         ${whereSql}`,
      params
    ),
  ]);

  return {
    rows: rows.map((r) => ({
      id: r.id,
      username: r.username,
      mobile: r.mobile,
      email: r.email,
      active: Number(r.active),
      role: r.role == null ? null : Number(r.role),
      permissions: parsePerms(r.permissions),
    })),
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getSystemUser(id) {
  const rows = await query(
    `SELECT u.id, u.username, u.mobile, u.email, u.active,
            up.role, up.permissions
       FROM users u
       LEFT JOIN user_permissions up ON up.user_id = u.id
       WHERE u.id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    username: r.username,
    mobile: r.mobile,
    email: r.email,
    active: Number(r.active),
    role: r.role == null ? null : Number(r.role),
    permissions: parsePerms(r.permissions),
  };
}

function validateBase(input, { requirePassword }) {
  const username = String(input.username || '').trim();
  const mobile = String(input.mobile || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const role = Number(input.role);
  if (!username) throw new Error('Username is required.');
  if (!mobile || !/^\d{6,16}$/.test(mobile)) throw new Error('A valid mobile number is required.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid email is required.');
  if (![0, 1, 2, 3].includes(role)) throw new Error('Role is required.');
  const password = input.password ? String(input.password) : '';
  if (requirePassword || password) {
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    if (input.confirm_password != null && input.confirm_password !== password) {
      throw new Error('Passwords do not match.');
    }
  }
  return { username, mobile, email, role, password };
}

export async function createSystemUser(input) {
  const v = validateBase(input, { requirePassword: true });
  const dupe = await query(
    'SELECT id FROM users WHERE email = ? OR mobile = ? LIMIT 1',
    [v.email, v.mobile]
  );
  if (dupe.length) throw new Error('A user with this email or mobile already exists.');

  const hashed = await hashPassword(v.password);
  const now = Math.floor(Date.now() / 1000);
  const perms = v.role === 0 ? null : sanitizePermissions(input.permissions);

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.execute(
      `INSERT INTO users (username, password, email, mobile, active, created_on, type)
       VALUES (?, ?, ?, ?, 1, ?, 'phone')`,
      [v.username, hashed, v.email, v.mobile, now]
    );
    const userId = r.insertId;
    await conn.execute(
      'INSERT INTO users_groups (user_id, group_id) VALUES (?, ?)',
      [userId, ADMIN_GROUP_ID]
    );
    await conn.execute(
      'INSERT INTO user_permissions (user_id, role, permissions) VALUES (?, ?, ?)',
      [userId, v.role, perms == null ? null : JSON.stringify(perms)]
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

export async function updateSystemUser(id, input) {
  const v = validateBase(input, { requirePassword: false });
  const dupe = await query(
    'SELECT id FROM users WHERE (email = ? OR mobile = ?) AND id != ? LIMIT 1',
    [v.email, v.mobile, id]
  );
  if (dupe.length) throw new Error('Another user already has this email or mobile.');

  const fields = ['username = ?', 'email = ?', 'mobile = ?'];
  const params = [v.username, v.email, v.mobile];
  if (v.password) {
    fields.push('password = ?');
    params.push(await hashPassword(v.password));
  }
  params.push(id);

  const perms = v.role === 0 ? null : sanitizePermissions(input.permissions);

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    const [existing] = await conn.execute(
      'SELECT id FROM user_permissions WHERE user_id = ? LIMIT 1',
      [id]
    );
    if (existing.length) {
      await conn.execute(
        'UPDATE user_permissions SET role = ?, permissions = ? WHERE user_id = ?',
        [v.role, perms == null ? null : JSON.stringify(perms), id]
      );
    } else {
      await conn.execute(
        'INSERT INTO user_permissions (user_id, role, permissions) VALUES (?, ?, ?)',
        [id, v.role, perms == null ? null : JSON.stringify(perms)]
      );
    }
    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function setSystemUserActive(id, active) {
  const v = active ? 1 : 0;
  const r = await query('UPDATE users SET active = ? WHERE id = ?', [v, id]);
  return r.affectedRows > 0;
}

export async function deleteSystemUser(id) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM user_permissions WHERE user_id = ?', [id]);
    await conn.execute('DELETE FROM users_groups WHERE user_id = ? AND group_id = ?', [id, ADMIN_GROUP_ID]);
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