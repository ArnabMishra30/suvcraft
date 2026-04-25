import { query } from '@/lib/db';

export async function listProductFaqs({ page = 1, perPage = 20, search = '', productId = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(f.id = ? OR f.question LIKE ? OR f.answer LIKE ? OR p.name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (productId) { where.push('f.product_id = ?'); params.push(Number(productId)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT f.id, f.product_id, f.question, f.answer, f.user_id, f.answered_by, f.votes, f.date_added,
              p.name AS product_name,
              uq.username AS asked_by_username,
              ua.username AS answered_by_username
         FROM product_faqs f
         LEFT JOIN products p ON p.id = f.product_id
         LEFT JOIN users uq ON uq.id = f.user_id
         LEFT JOIN users ua ON ua.id = f.answered_by
         ${whereSql}
         ORDER BY f.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM product_faqs f LEFT JOIN products p ON p.id = f.product_id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getProductFaq(id) {
  const rows = await query('SELECT * FROM product_faqs WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function createProductFaq({ product_id, question, answer = '', user_id, answered_by = null }) {
  if (!product_id) throw new Error('Product is required.');
  const q = String(question || '').trim();
  if (!q) throw new Error('Question is required.');
  const sellerRow = await query('SELECT seller_id FROM products WHERE id = ? LIMIT 1', [Number(product_id)]);
  const sellerId = sellerRow[0]?.seller_id || 0;
  const trimAns = String(answer || '').trim();
  const r = await query(
    'INSERT INTO product_faqs (user_id, seller_id, product_id, votes, question, answer, answered_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [Number(user_id || 0), Number(sellerId), Number(product_id), 0, q, trimAns, trimAns ? Number(answered_by || user_id || 0) : 0]
  );
  return r.insertId;
}

export async function updateProductFaq(id, { question, answer = '', answered_by = null }) {
  const q = String(question || '').trim();
  if (!q) throw new Error('Question is required.');
  const trimAns = String(answer || '').trim();
  const r = await query(
    'UPDATE product_faqs SET question = ?, answer = ?, answered_by = ? WHERE id = ?',
    [q, trimAns, trimAns ? Number(answered_by || 0) : 0, id]
  );
  return r.affectedRows > 0;
}

export async function deleteProductFaq(id) {
  const r = await query('DELETE FROM product_faqs WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function listProductsForFilter() {
  return query('SELECT id, name FROM products WHERE status IN (1, 2) ORDER BY name LIMIT 1000');
}