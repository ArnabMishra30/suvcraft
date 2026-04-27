import { query } from '@/lib/db';

export const SEND_TO_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'customer', label: 'Customers' },
  { value: 'seller', label: 'Sellers' },
  { value: 'delivery_boy', label: 'Delivery Boys' },
  { value: 'affiliate', label: 'Affiliates' },
];

export const SEND_TO_LABEL = Object.fromEntries(SEND_TO_OPTIONS.map((o) => [o.value, o.label]));

export const NOTIFICATION_TYPES = [
  { value: 'default', label: 'Default' },
  { value: 'category', label: 'Category' },
  { value: 'product', label: 'Product' },
];

export const NOTIFICATION_TYPE_LABEL = Object.fromEntries(NOTIFICATION_TYPES.map((t) => [t.value, t.label]));

export async function listNotifications({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(n.id = ? OR n.title LIKE ? OR n.message LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT n.id, n.title, n.message, n.type, n.type_id, n.send_to, n.users_id, n.image, n.link, n.date_sent,
              p.name AS product_name,
              c.name AS category_name
         FROM notifications n
         LEFT JOIN products p ON p.id = n.type_id AND n.type = 'product'
         LEFT JOIN categories c ON c.id = n.type_id AND n.type = 'category'
         ${whereSql}
         ORDER BY n.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM notifications n ${whereSql}`, params),
  ]);

  return {
    rows: rows.map((r) => ({ ...r, product_or_category: r.product_name || r.category_name || '' })),
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

function validateInput(input) {
  const title = String(input.title || '').trim();
  if (!title) throw new Error('Title is required.');
  const message = String(input.message || '').trim();
  if (!message) throw new Error('Message is required.');
  let type = String(input.type || '').toLowerCase().trim();
  if (type === 'categories') type = 'category';
  if (type === 'products') type = 'product';
  if (!['default', 'category', 'product'].includes(type)) throw new Error('Type is required.');
  let typeId = '0';
  if (type === 'category') {
    const cid = Number(input.category_id || input.type_id || 0);
    if (!cid) throw new Error('Category is required.');
    typeId = String(cid);
  } else if (type === 'product') {
    const pid = Number(input.product_id || input.type_id || 0);
    if (!pid) throw new Error('Product is required.');
    typeId = String(pid);
  }
  let sendTo = String(input.send_to || 'all').toLowerCase().trim();
  if (!['all', 'customer', 'seller', 'delivery_boy', 'affiliate'].includes(sendTo)) sendTo = 'all';
  const image = String(input.image || '').trim();
  return { title, message, type, typeId, sendTo, image };
}

export async function createNotification(input) {
  const { title, message, type, typeId, sendTo, image } = validateInput(input);
  const r = await query(
    `INSERT INTO notifications (title, message, type, type_id, send_to, users_id, image, link)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, message, type, typeId, sendTo, '', image || '', '']
  );
  return r.insertId;
}

export async function deleteNotification(id) {
  const r = await query('DELETE FROM notifications WHERE id = ?', [id]);
  return r.affectedRows > 0;
}