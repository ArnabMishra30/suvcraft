import { query } from '@/lib/db';

function buildWhere({ search, sellerId }) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(p.id = ? OR p.name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`);
  }
  if (sellerId) { where.push('p.seller_id = ?'); params.push(Number(sellerId)); }
  return { whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

function ordersJoinClause({ from, to, sellerId }) {
  // order_items doesn't carry product_id directly — resolve via product_variants.product_id.
  const conds = ['pv.product_id = p.id'];
  const params = [];
  if (from) { conds.push('oi.date_added >= ?'); params.push(`${from} 00:00:00`); }
  if (to) { conds.push('oi.date_added <= ?'); params.push(`${to} 23:59:59`); }
  if (sellerId) { conds.push('oi.seller_id = ?'); params.push(Number(sellerId)); }
  return {
    sub: `(SELECT COALESCE(SUM(oi.quantity), 0)
             FROM order_items oi
             JOIN product_variants pv ON pv.id = oi.product_variant_id
             WHERE ${conds.join(' AND ')})`,
    params,
  };
}

export async function listInventoryItems({
  page = 1, perPage = 20, search = '', from = '', to = '', sellerId = '',
} = {}) {
  const { whereSql, params: whereParams } = buildWhere({ search, sellerId });
  const orders = ordersJoinClause({ from, to, sellerId });
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT p.id AS item_id, p.name AS product_name, p.stock,
              ${orders.sub} AS orders_placed
         FROM products p
         ${whereSql}
         ORDER BY p.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      [...orders.params, ...whereParams]
    ),
    query(`SELECT COUNT(*) AS c FROM products p ${whereSql}`, whereParams),
  ]);

  // For variant-stocked products the products.stock column is 0 — sum from variants.
  const variantTargetIds = rows.filter((r) => Number(r.stock) === 0).map((r) => r.item_id);
  if (variantTargetIds.length) {
    const ph = variantTargetIds.map(() => '?').join(',');
    const v = await query(
      `SELECT product_id, COALESCE(SUM(stock), 0) AS s
         FROM product_variants
         WHERE product_id IN (${ph}) AND active_status = 'active'
         GROUP BY product_id`,
      variantTargetIds
    );
    const m = new Map(v.map((r) => [Number(r.product_id), Number(r.s)]));
    for (const r of rows) {
      if (Number(r.stock) === 0 && m.has(r.item_id)) r.stock = m.get(r.item_id);
    }
  }

  return {
    rows: rows.map((r) => ({
      ...r,
      stock: Number(r.stock || 0),
      orders_placed: Number(r.orders_placed || 0),
    })),
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getTopSellingProducts({ from = '', to = '', sellerId = '', limit = 5 } = {}) {
  const where = [];
  const params = [];
  if (from) { where.push('oi.date_added >= ?'); params.push(`${from} 00:00:00`); }
  if (to) { where.push('oi.date_added <= ?'); params.push(`${to} 23:59:59`); }
  if (sellerId) { where.push('oi.seller_id = ?'); params.push(Number(sellerId)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const lim = Math.min(20, Math.max(1, Number(limit)));

  return query(
    `SELECT pv.product_id,
            COALESCE(p.name, MAX(oi.product_name)) AS product_name,
            p.image AS product_image,
            SUM(oi.quantity) AS total_qty
       FROM order_items oi
       JOIN product_variants pv ON pv.id = oi.product_variant_id
       LEFT JOIN products p ON p.id = pv.product_id
       ${whereSql}
       GROUP BY pv.product_id, p.name, p.image
       ORDER BY total_qty DESC
       LIMIT ${lim}`,
    params
  );
}