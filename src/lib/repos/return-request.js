import { query } from '@/lib/db';

export const RETURN_STATUS = {
  0: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  1: { label: 'Approved', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  2: { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  3: { label: 'Return Pickedup', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
  4: { label: 'Returned', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
};

export async function listReturnRequests({ page = 1, perPage = 20, search = '', status = '', sellerId = '', productId = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(rr.id = ? OR rr.order_id = ? OR rr.order_item_id = ? OR p.name LIKE ? OR u.username LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, idGuess, idGuess, like, like);
  }
  if (status !== '' && status != null) { where.push('rr.status = ?'); params.push(Number(status)); }
  if (sellerId) { where.push('p.seller_id = ?'); params.push(Number(sellerId)); }
  if (productId) { where.push('rr.product_id = ?'); params.push(Number(productId)); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT rr.id, rr.user_id, rr.product_id, rr.product_variant_id, rr.order_id, rr.order_item_id,
              rr.return_reason, rr.return_item_image, rr.status, rr.remarks, rr.date_created,
              u.username, u.email,
              p.name AS product_name, p.seller_id,
              su.username AS seller_name,
              oi.variant_name, oi.quantity, oi.sub_total, oi.price, oi.discounted_price
         FROM return_requests rr
         LEFT JOIN users u ON u.id = rr.user_id
         LEFT JOIN products p ON p.id = rr.product_id
         LEFT JOIN users su ON su.id = p.seller_id
         LEFT JOIN order_items oi ON oi.id = rr.order_item_id
         ${whereSql}
         ORDER BY rr.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(
      `SELECT COUNT(*) AS c FROM return_requests rr
         LEFT JOIN products p ON p.id = rr.product_id
         LEFT JOIN users u ON u.id = rr.user_id
         ${whereSql}`,
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

export async function setReturnRequestStatus(id, status, remarks = '') {
  const r = await query('UPDATE return_requests SET status = ?, remarks = ? WHERE id = ?', [Number(status), remarks || '', id]);
  return r.affectedRows > 0;
}

export async function deleteReturnRequest(id) {
  const r = await query('DELETE FROM return_requests WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

// Return reasons CRUD
export async function listReturnReasons({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR return_reason LIKE ? OR message LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(`SELECT id, return_reason, message, image, created_at, updated_at FROM return_reasons ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM return_reasons ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getReturnReason(id) {
  const rows = await query('SELECT * FROM return_reasons WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function createReturnReason({ return_reason, message = '', image = '' }) {
  const r = String(return_reason || '').trim();
  if (!r) throw new Error('Return reason is required.');
  const result = await query(
    'INSERT INTO return_reasons (return_reason, message, image, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
    [r, message || '', image || '']
  );
  return result.insertId;
}

export async function updateReturnReason(id, { return_reason, message = '', image = '' }) {
  const r = String(return_reason || '').trim();
  if (!r) throw new Error('Return reason is required.');
  const result = await query(
    'UPDATE return_reasons SET return_reason = ?, message = ?, image = ?, updated_at = NOW() WHERE id = ?',
    [r, message || '', image || '', id]
  );
  return result.affectedRows > 0;
}

export async function deleteReturnReason(id) {
  const r = await query('DELETE FROM return_reasons WHERE id = ?', [id]);
  return r.affectedRows > 0;
}