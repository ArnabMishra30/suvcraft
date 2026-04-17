import { query, getPool } from '@/lib/db';
import { ORDER_STATUSES } from './order-statuses';
export { ORDER_STATUSES };

export async function getOrderStatusCounts() {
  const rows = await query(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'awaiting' THEN 1 ELSE 0 END) AS awaiting,
       SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) AS received,
       SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) AS processed,
       SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) AS shipped,
       SUM(CASE WHEN status = 'out_for_delivery' THEN 1 ELSE 0 END) AS out_for_delivery,
       SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) AS returned
     FROM orders`
  );
  const r = rows[0] || {};
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Number(v || 0)]));
}

export async function listSellersForFilter() {
  return query(
    'SELECT u.id, COALESCE(NULLIF(u.company, ""), u.username) AS name FROM users u JOIN users_groups ug ON ug.user_id = u.id WHERE ug.group_id = 4 ORDER BY name LIMIT 500'
  );
}

function parseStatus(s) {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    if (!Array.isArray(v)) return [];
    return v.map((entry) => Array.isArray(entry) ? { name: entry[0], at: entry[1] } : { name: String(entry), at: null });
  } catch {
    return [{ name: String(s), at: null }];
  }
}

function currentStatus(s) {
  const arr = parseStatus(s);
  return arr.length ? arr[arr.length - 1].name : null;
}

export async function listOrders({
  page = 1, perPage = 20,
  status = '', search = '',
  paymentMethod = '', orderType = '',
  sellerId = '', from = '', to = '',
} = {}) {
  const where = [];
  const params = [];

  if (status) { where.push('o.status = ?'); params.push(status); }
  if (search) {
    where.push('(o.id = ? OR o.mobile LIKE ? OR u.username LIKE ? OR u.email LIKE ?)');
    const like = `%${search}%`;
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, like, like, like);
  }
  if (paymentMethod) { where.push('LOWER(o.payment_method) = ?'); params.push(paymentMethod.toLowerCase()); }
  if (orderType === 'pos') where.push('o.is_pos_order = 1');
  else if (orderType === 'shiprocket') where.push('o.is_shiprocket_order = 1');
  else if (orderType === 'regular') where.push('(o.is_pos_order = 0 AND o.is_shiprocket_order = 0)');
  if (sellerId) {
    where.push('o.id IN (SELECT DISTINCT order_id FROM order_items WHERE seller_id = ?)');
    params.push(Number(sellerId));
  }
  if (from) { where.push('o.date_added >= ?'); params.push(`${from} 00:00:00`); }
  if (to) { where.push('o.date_added <= ?'); params.push(`${to} 23:59:59`); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT o.id, o.user_id, o.mobile, o.total, o.final_total, o.status, o.payment_method,
              o.is_cod_collected, o.is_pos_order, o.is_shiprocket_order,
              o.delivery_charge, o.wallet_balance, o.discount, o.promo_discount, o.promo_code,
              o.notes, o.date_added, o.delivery_date,
              u.username AS customer, u.email AS customer_email,
              (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS items_count,
              (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) AS qty,
              (SELECT GROUP_CONCAT(DISTINCT COALESCE(NULLIF(su.company, ""), su.username) SEPARATOR ", ")
                 FROM order_items oi
                 LEFT JOIN users su ON su.id = oi.seller_id
                WHERE oi.order_id = o.id) AS sellers
         FROM orders o
         LEFT JOIN users u ON u.id = o.user_id
         ${whereSql}
         ORDER BY o.date_added DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(
      `SELECT COUNT(*) AS c FROM orders o LEFT JOIN users u ON u.id = o.user_id ${whereSql}`,
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

export async function getOrder(id) {
  const orderRows = await query(
    `SELECT o.*, u.username AS customer, u.email AS customer_email
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       WHERE o.id = ? LIMIT 1`,
    [id]
  );
  if (!orderRows.length) return null;
  const order = orderRows[0];

  const items = await query(
    `SELECT id, product_name, variant_name, quantity, price, discounted_price, sub_total,
            tax_amount, discount, status, active_status, product_image, seller_id, delivery_boy_id,
            return_reason, date_added
       FROM order_items WHERE order_id = ?`,
    [id]
  );

  const address = order.address_id
    ? (await query('SELECT * FROM addresses WHERE id = ? LIMIT 1', [order.address_id]))[0] || null
    : null;

  const itemsWithStatus = items.map((it) => ({
    ...it,
    status_history: parseStatus(it.status),
    current_status: currentStatus(it.status),
    active_status_history: parseStatus(it.active_status),
    current_active_status: currentStatus(it.active_status),
  }));

  return { ...order, items: itemsWithStatus, address };
}

export async function appendOrderItemStatus(itemId, statusName) {
  if (!ORDER_STATUSES.includes(statusName)) {
    throw new Error(`Unknown status: ${statusName}`);
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT status FROM order_items WHERE id = ? FOR UPDATE', [itemId]);
    if (!rows.length) throw new Error('Order item not found');

    const history = parseStatus(rows[0].status);
    const next = [...history.map((h) => [h.name, h.at]), [statusName, new Date().toISOString()]];
    await conn.execute('UPDATE order_items SET status = ?, updated_by = ? WHERE id = ?', [
      JSON.stringify(next),
      0,
      itemId,
    ]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  return true;
}

export async function setOrderStatus(orderId, status) {
  if (!ORDER_STATUSES.includes(status)) throw new Error(`Unknown status: ${status}`);
  await query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  return true;
}