import { query } from '@/lib/db';

export async function listTracking({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(t.id = ? OR t.order_id = ? OR t.tracking_id LIKE ? OR t.courier_agency LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, idGuess, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT t.id, t.order_id, t.order_item_id, t.courier_agency, t.tracking_id, t.url,
              t.awb_code, t.is_canceled, t.date_created
         FROM order_tracking t
         ${whereSql}
         ORDER BY t.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM order_tracking t ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getTracking(id) {
  const rows = await query('SELECT * FROM order_tracking WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function deleteTracking(id) {
  const r = await query('DELETE FROM order_tracking WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function upsertTracking({ order_id, order_item_id, courier_agency, tracking_id, url }) {
  const existing = await query(
    'SELECT id FROM order_tracking WHERE order_id = ? AND order_item_id = ? LIMIT 1',
    [order_id, String(order_item_id || '')]
  );
  if (existing.length) {
    await query(
      'UPDATE order_tracking SET courier_agency = ?, tracking_id = ?, url = ? WHERE id = ?',
      [courier_agency || '', tracking_id || '', url || '', existing[0].id]
    );
    return existing[0].id;
  }
  const r = await query(
    `INSERT INTO order_tracking
       (order_id, order_item_id, courier_agency, tracking_id, url,
        shiprocket_order_id, shipment_id, pickup_status, status,
        pickup_scheduled_date, pickup_token_number, others, pickup_generated_date,
        data, date, manifest_url, label_url, invoice_url)
     VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, '', '', '', '', '', '', '', '', '')`,
    [order_id, String(order_item_id || ''), courier_agency || '', tracking_id || '', url || '']
  );
  return r.insertId;
}