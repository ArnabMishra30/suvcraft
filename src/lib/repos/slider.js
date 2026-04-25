import { query } from '@/lib/db';

export const SLIDER_TYPES = [
  { value: 'default', label: 'Default' },
  { value: 'categories', label: 'Category' },
  { value: 'products', label: 'Product' },
  { value: 'sliderurl', label: 'Slider URL' },
];

export const SLIDER_TYPE_LABEL = Object.fromEntries(SLIDER_TYPES.map((t) => [t.value, t.label]));

export async function listSliders({ page = 1, perPage = 20, search = '', type = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(s.id = ? OR s.type LIKE ? OR s.link LIKE ? OR p.name LIKE ? OR c.name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like, like);
  }
  if (type) { where.push('s.type = ?'); params.push(type); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT s.id, s.type, s.type_id, s.link, s.image, s.date_added,
              p.name AS product_name,
              c.name AS category_name
         FROM sliders s
         LEFT JOIN products p ON p.id = s.type_id AND s.type = 'products'
         LEFT JOIN categories c ON c.id = s.type_id AND s.type = 'categories'
         ${whereSql}
         ORDER BY s.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(
      `SELECT COUNT(DISTINCT s.id) AS c
         FROM sliders s
         LEFT JOIN products p ON p.id = s.type_id AND s.type = 'products'
         LEFT JOIN categories c ON c.id = s.type_id AND s.type = 'categories'
         ${whereSql}`,
      params
    ),
  ]);

  return {
    rows: rows.map((r) => ({ ...r, name: r.product_name || r.category_name || (r.type === 'sliderurl' ? r.link : '') })),
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getSlider(id) {
  const rows = await query('SELECT * FROM sliders WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

function normalizeInput(input) {
  let type = String(input.type || '').toLowerCase().trim();
  if (type === 'category') type = 'categories';
  if (type === 'product') type = 'products';
  if (type === 'slider_url' || type === 'slider url') type = 'sliderurl';
  if (!['default', 'categories', 'products', 'sliderurl'].includes(type)) throw new Error('Type is required.');

  const image = String(input.image || '').trim();
  if (!image) throw new Error('Slider image is required.');

  let typeId = 0;
  let link = '';
  if (type === 'categories') {
    typeId = Number(input.category_id || input.type_id || 0);
    if (!typeId) throw new Error('Category is required.');
  } else if (type === 'products') {
    typeId = Number(input.product_id || input.type_id || 0);
    if (!typeId) throw new Error('Product is required.');
  } else if (type === 'sliderurl') {
    link = String(input.link || '').trim();
    if (!link) throw new Error('Slider URL is required.');
  }
  return { type, typeId, link, image };
}

export async function createSlider(input) {
  const { type, typeId, link, image } = normalizeInput(input);
  const r = await query(
    'INSERT INTO sliders (type, type_id, link, image) VALUES (?, ?, ?, ?)',
    [type, typeId, link, image]
  );
  return r.insertId;
}

export async function updateSlider(id, input) {
  const { type, typeId, link, image } = normalizeInput(input);
  const r = await query(
    'UPDATE sliders SET type = ?, type_id = ?, link = ?, image = ? WHERE id = ?',
    [type, typeId, link, image, id]
  );
  return r.affectedRows > 0;
}

export async function deleteSlider(id) {
  const r = await query('DELETE FROM sliders WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function listCategoriesForSlider() {
  return query('SELECT id, name FROM categories WHERE status = 1 ORDER BY name LIMIT 1000');
}

export async function listProductsForSlider() {
  return query('SELECT id, name FROM products WHERE status = 1 ORDER BY name LIMIT 2000');
}