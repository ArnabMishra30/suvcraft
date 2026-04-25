import { query } from '@/lib/db';

export async function listSellerWalletTransactions({ page = 1, perPage = 20, search = '', status = '', sellerId = '' } = {}) {
  const where = ['ug.group_id = 4'];
  const params = [];
  if (search) {
    where.push('(wt.id = ? OR u.username LIKE ? OR wt.message LIKE ? OR wt.type LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  if (status !== '' && status != null) { where.push('wt.status = ?'); params.push(Number(status)); }
  if (sellerId) { where.push('wt.user_id = ?'); params.push(Number(sellerId)); }
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT wt.id, wt.user_id, wt.type, wt.amount, wt.message, wt.status, wt.date_created,
              u.username, u.email
         FROM wallet_transactions wt
         JOIN users_groups ug ON ug.user_id = wt.user_id
         LEFT JOIN users u ON u.id = wt.user_id
         ${whereSql}
         ORDER BY wt.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM wallet_transactions wt JOIN users_groups ug ON ug.user_id = wt.user_id LEFT JOIN users u ON u.id = wt.user_id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function listSellersForFilterShort() {
  return query(
    `SELECT u.id, COALESCE(NULLIF(u.username, ""), CONCAT('Seller #', u.id)) AS name
       FROM users u JOIN users_groups ug ON ug.user_id = u.id
       WHERE ug.group_id = 4 ORDER BY u.username LIMIT 1000`
  );
}