import { query } from '@/lib/db';

export async function listProductRatings({ page = 1, perPage = 20, search = '', productId = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(r.id = ? OR r.comment LIKE ? OR p.name LIKE ? OR u.username LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (productId) { where.push('r.product_id = ?'); params.push(Number(productId)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT r.id, r.user_id, r.product_id, r.rating, r.images, r.comment, r.data_added,
              p.name AS product_name,
              u.username
         FROM product_rating r
         LEFT JOIN products p ON p.id = r.product_id
         LEFT JOIN users u ON u.id = r.user_id
         ${whereSql}
         ORDER BY r.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM product_rating r LEFT JOIN products p ON p.id = r.product_id LEFT JOIN users u ON u.id = r.user_id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function deleteProductRating(id) {
  const r = await query('DELETE FROM product_rating WHERE id = ?', [id]);
  return r.affectedRows > 0;
}