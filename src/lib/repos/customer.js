import { query } from '@/lib/db';

export async function listCustomers({ page = 1, perPage = 20, search = '', status = '' } = {}) {
  const where = ['ug.group_id = 2'];
  const params = [];
  if (search) {
    where.push('(u.id = ? OR u.username LIKE ? OR u.email LIKE ? OR u.mobile LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  if (status === '0' || status === '1') { where.push('u.active = ?'); params.push(Number(status)); }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT u.id, u.username AS name, u.email, u.mobile, u.balance, u.active AS status, u.created_on, u.image
         FROM users u
         JOIN users_groups ug ON ug.user_id = u.id
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

export async function getCustomer(id) {
  const rows = await query('SELECT id, username, email, mobile, balance, active, status, created_on FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function setCustomerActive(id, active) {
  const r = await query('UPDATE users SET active = ? WHERE id = ?', [Number(active) ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function deleteCustomer(id) {
  await query('DELETE FROM users_groups WHERE user_id = ? AND group_id = 2', [id]);
  await query('DELETE FROM addresses WHERE user_id = ?', [id]).catch(() => {});
  const r = await query('DELETE FROM users WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function listCustomersWithBalance({ page = 1, perPage = 20, search = '' } = {}) {
  const where = ['ug.group_id = 2'];
  const params = [];
  if (search) {
    where.push('(u.id = ? OR u.username LIKE ? OR u.email LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like);
  }
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT u.id, u.username AS name, u.email, u.balance
         FROM users u
         JOIN users_groups ug ON ug.user_id = u.id
         ${whereSql}
         ORDER BY u.balance DESC, u.id DESC
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

export async function listCustomersForFilter() {
  return query(
    `SELECT u.id, COALESCE(NULLIF(u.username, ''), CONCAT('User #', u.id)) AS name
       FROM users u JOIN users_groups ug ON ug.user_id = u.id
       WHERE ug.group_id = 2 ORDER BY u.username LIMIT 1000`
  );
}

export async function listCustomerAddresses({ page = 1, perPage = 20, search = '' } = {}) {
  const where = ['ug.group_id = 2'];
  const params = [];
  if (search) {
    where.push('(a.id = ? OR a.name LIKE ? OR a.mobile LIKE ? OR a.address LIKE ? OR a.city LIKE ? OR u.username LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like, like, like);
  }
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT a.*, u.username
         FROM addresses a
         JOIN users u ON u.id = a.user_id
         JOIN users_groups ug ON ug.user_id = u.id
         ${whereSql}
         ORDER BY a.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM addresses a JOIN users u ON u.id = a.user_id JOIN users_groups ug ON ug.user_id = u.id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function listCustomerTransactions({ page = 1, perPage = 20, search = '', userId = '', status = '', txnType = '' } = {}) {
  const where = ['ug.group_id = 2'];
  const params = [];
  if (search) {
    where.push('(t.id = ? OR t.txn_id LIKE ? OR t.payu_txn_id LIKE ? OR u.username LIKE ? OR t.order_id LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like, like);
  }
  if (userId) { where.push('t.user_id = ?'); params.push(Number(userId)); }
  if (status) { where.push('LOWER(t.status) = ?'); params.push(String(status).toLowerCase()); }
  if (txnType) { where.push('LOWER(t.transaction_type) = ?'); params.push(String(txnType).toLowerCase()); }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT t.id, t.user_id, t.order_id, t.txn_id, t.payu_txn_id, t.type, t.transaction_type,
              t.amount, t.status, t.message, t.transaction_date, t.date_created, t.is_refund,
              u.username
         FROM transactions t
         JOIN users u ON u.id = t.user_id
         JOIN users_groups ug ON ug.user_id = u.id
         ${whereSql}
         ORDER BY t.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM transactions t JOIN users u ON u.id = t.user_id JOIN users_groups ug ON ug.user_id = u.id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function listCustomerWalletTransactions({ page = 1, perPage = 20, search = '', userId = '', status = '' } = {}) {
  const where = ['ug.group_id = 2'];
  const params = [];
  if (search) {
    where.push('(wt.id = ? OR u.username LIKE ? OR wt.message LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like);
  }
  if (userId) { where.push('wt.user_id = ?'); params.push(Number(userId)); }
  if (status !== '' && status != null) { where.push('wt.status = ?'); params.push(Number(status)); }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT wt.*, u.username, u.email
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