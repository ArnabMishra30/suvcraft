import { query } from '@/lib/db';

export async function listAffiliateProducts({ page = 1, perPage = 20, search = '', categoryId = '', isInAffiliate = '' } = {}) {
  const where = [];
  const params = [];

  if (search) {
    where.push('(p.id = ? OR p.name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`);
  }
  if (categoryId) { where.push('p.category_id = ?'); params.push(Number(categoryId)); }
  if (isInAffiliate === '0' || isInAffiliate === '1') { where.push('p.is_in_affiliate = ?'); params.push(Number(isInAffiliate)); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT p.id, p.name, p.image, p.is_in_affiliate, p.status,
              c.name AS category_name,
              b.name AS brand_name
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         LEFT JOIN brands b ON b.id = p.brand
         ${whereSql}
         ORDER BY p.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM products p ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function setAffiliateStatus(id, isInAffiliate) {
  const r = await query('UPDATE products SET is_in_affiliate = ? WHERE id = ?', [Number(isInAffiliate) ? 1 : 0, Number(id)]);
  return r.affectedRows > 0;
}

export async function bulkSetAffiliateStatus(ids, isInAffiliate) {
  if (!ids?.length) return 0;
  const placeholders = ids.map(() => '?').join(',');
  const r = await query(
    `UPDATE products SET is_in_affiliate = ? WHERE id IN (${placeholders})`,
    [Number(isInAffiliate) ? 1 : 0, ...ids.map(Number)]
  );
  return r.affectedRows || 0;
}
