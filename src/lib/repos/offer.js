import { query } from '@/lib/db';

export const OFFER_TYPES = [
  { value: 'default', label: 'Default' },
  { value: 'categories', label: 'Category' },
  { value: 'products', label: 'Product' },
  { value: 'offer_url', label: 'Offer URL' },
];

export const OFFER_TYPE_LABEL = Object.fromEntries(OFFER_TYPES.map((t) => [t.value, t.label]));

export async function listOffers({ page = 1, perPage = 20, search = '', type = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(o.id = ? OR o.type LIKE ? OR o.link LIKE ? OR p.name LIKE ? OR c.name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like, like);
  }
  if (type) { where.push('o.type = ?'); params.push(type); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT o.id, o.type, o.type_id, o.link, o.image, o.date_added,
              p.name AS product_name,
              c.name AS category_name
         FROM offers o
         LEFT JOIN products p ON p.id = o.type_id AND o.type = 'products'
         LEFT JOIN categories c ON c.id = o.type_id AND o.type = 'categories'
         ${whereSql}
         ORDER BY o.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(
      `SELECT COUNT(DISTINCT o.id) AS c
         FROM offers o
         LEFT JOIN products p ON p.id = o.type_id AND o.type = 'products'
         LEFT JOIN categories c ON c.id = o.type_id AND o.type = 'categories'
         ${whereSql}`,
      params
    ),
  ]);

  return {
    rows: rows.map((r) => ({ ...r, name: r.product_name || r.category_name || (r.type === 'offer_url' ? r.link : '') })),
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getOffer(id) {
  const rows = await query('SELECT * FROM offers WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

function normalizeInput(input) {
  let type = String(input.type || '').toLowerCase().trim();
  if (type === 'category') type = 'categories';
  if (type === 'product') type = 'products';
  if (type === 'offerurl' || type === 'offer url') type = 'offer_url';
  if (!['default', 'categories', 'products', 'offer_url'].includes(type)) throw new Error('Type is required.');

  const image = String(input.image || '').trim();
  if (!image) throw new Error('Offer image is required.');

  let typeId = 0;
  let link = '';
  if (type === 'categories') {
    typeId = Number(input.category_id || input.type_id || 0);
    if (!typeId) throw new Error('Category is required.');
  } else if (type === 'products') {
    typeId = Number(input.product_id || input.type_id || 0);
    if (!typeId) throw new Error('Product is required.');
  } else if (type === 'offer_url') {
    link = String(input.link || '').trim();
    if (!link) throw new Error('Offer URL is required.');
  }
  return { type, typeId, link, image };
}

export async function createOffer(input) {
  const { type, typeId, link, image } = normalizeInput(input);
  const r = await query(
    'INSERT INTO offers (type, type_id, link, image) VALUES (?, ?, ?, ?)',
    [type, typeId, link, image]
  );
  return r.insertId;
}

export async function updateOffer(id, input) {
  const { type, typeId, link, image } = normalizeInput(input);
  const r = await query(
    'UPDATE offers SET type = ?, type_id = ?, link = ?, image = ? WHERE id = ?',
    [type, typeId, link, image, id]
  );
  return r.affectedRows > 0;
}

export async function deleteOffer(id) {
  const r = await query('DELETE FROM offers WHERE id = ?', [id]);
  return r.affectedRows > 0;
}