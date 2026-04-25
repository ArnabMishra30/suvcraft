import { query } from '@/lib/db';

export async function listProductsForStock({
  page = 1, perPage = 20, search = '',
  sellerId = '', categoryId = '',
} = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(p.id = ? OR p.name LIKE ? OR p.sku LIKE ? OR p.product_identity LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  if (sellerId) { where.push('p.seller_id = ?'); params.push(Number(sellerId)); }
  if (categoryId) { where.push('p.category_id = ?'); params.push(Number(categoryId)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT p.id, p.name, p.image, p.stock_type, p.stock,
              c.name AS category_name,
              COALESCE(NULLIF(su.company, ''), su.username) AS seller_name
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         LEFT JOIN users su ON su.id = p.seller_id
         ${whereSql}
         ORDER BY p.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM products p ${whereSql}`, params),
  ]);

  let variantMap = new Map();
  if (rows.length) {
    const ids = rows.map((r) => r.id);
    const placeholders = ids.map(() => '?').join(',');
    const variants = await query(
      `SELECT v.id, v.product_id, v.attribute_set, v.sku, v.stock,
              v.attribute_value_ids
         FROM product_variants v
         WHERE v.product_id IN (${placeholders}) AND v.active_status = 'active'
         ORDER BY v.id`,
      ids
    );

    const valueIds = new Set();
    for (const v of variants) {
      String(v.attribute_value_ids || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((id) => valueIds.add(id));
    }
    let valueLabelMap = new Map();
    if (valueIds.size) {
      const ph = Array.from(valueIds).map(() => '?').join(',');
      const av = await query(
        `SELECT av.id, av.value, a.name AS attribute_name
           FROM attribute_values av
           LEFT JOIN attributes a ON a.id = av.attribute_id
           WHERE av.id IN (${ph})`,
        Array.from(valueIds)
      );
      valueLabelMap = new Map(av.map((r) => [String(r.id), r]));
    }

    for (const v of variants) {
      const ids = String(v.attribute_value_ids || '').split(',').map((s) => s.trim()).filter(Boolean);
      const labels = ids.map((id) => {
        const r = valueLabelMap.get(id);
        return r ? r.value : null;
      }).filter(Boolean);
      v.label = labels.length ? labels.join(' / ') : (v.attribute_set || v.sku || `#${v.id}`);
      const arr = variantMap.get(v.product_id) || [];
      arr.push(v);
      variantMap.set(v.product_id, arr);
    }
  }

  return {
    rows: rows.map((r) => ({ ...r, variants: variantMap.get(r.id) || [] })),
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function updateProductStock(id, stock) {
  const v = Number(stock);
  if (!Number.isFinite(v) || v < 0) throw new Error('Stock must be a non-negative number.');
  const r = await query('UPDATE products SET stock = ?, availability = ? WHERE id = ?', [v, v > 0 ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function updateVariantStock(id, stock) {
  const v = Number(stock);
  if (!Number.isFinite(v) || v < 0) throw new Error('Stock must be a non-negative number.');
  const r = await query('UPDATE product_variants SET stock = ?, availability = ? WHERE id = ?', [v, v > 0 ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function listSellersForStockFilter() {
  return query(
    `SELECT u.id, COALESCE(NULLIF(u.company, ''), u.username) AS name
       FROM users u JOIN users_groups ug ON ug.user_id = u.id
       WHERE ug.group_id = 4 ORDER BY name LIMIT 1000`
  );
}

export async function listCategoriesForStockFilter() {
  return query('SELECT id, name FROM categories WHERE status = 1 ORDER BY name LIMIT 1000');
}