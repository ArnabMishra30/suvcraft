import { query } from '@/lib/db';

function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200) || 'brand';
}

async function uniqueBrandSlug(base, ignoreId = null) {
  let slug = base;
  let n = 1;
  while (true) {
    const params = ignoreId ? [slug, ignoreId] : [slug];
    const sql = ignoreId
      ? 'SELECT id FROM brands WHERE slug = ? AND id != ? LIMIT 1'
      : 'SELECT id FROM brands WHERE slug = ? LIMIT 1';
    const rows = await query(sql, params);
    if (!rows.length) return slug;
    n += 1;
    slug = `${base}-${n}`;
    if (n > 1000) return `${base}-${Date.now()}`;
  }
}

export async function listBrands({ page = 1, perPage = 20, search = '', status = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`);
  }
  if (status === '0' || status === '1') { where.push('status = ?'); params.push(Number(status)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(`SELECT id, name, slug, image, status FROM brands ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM brands ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getBrand(id) {
  const rows = await query('SELECT id, name, slug, image, status FROM brands WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function createBrand({ name, image, status = 1 }) {
  const n = String(name || '').trim();
  if (!n) throw new Error('Name is required.');
  const img = String(image || '').trim();
  if (!img) throw new Error('Main image is required.');
  const slug = await uniqueBrandSlug(slugify(n));
  const r = await query(
    'INSERT INTO brands (name, slug, image, status) VALUES (?, ?, ?, ?)',
    [n, slug, img, Number(status) ? 1 : 0]
  );
  return r.insertId;
}

export async function updateBrand(id, { name, image, status = 1 }) {
  const n = String(name || '').trim();
  if (!n) throw new Error('Name is required.');
  const img = String(image || '').trim();
  if (!img) throw new Error('Main image is required.');
  const slug = await uniqueBrandSlug(slugify(n), id);
  const r = await query(
    'UPDATE brands SET name = ?, slug = ?, image = ?, status = ? WHERE id = ?',
    [n, slug, img, Number(status) ? 1 : 0, id]
  );
  return r.affectedRows > 0;
}

export async function deleteBrand(id) {
  const productRows = await query('SELECT COUNT(*) AS c FROM products WHERE brand = ?', [id]);
  if (Number(productRows[0].c) > 0) {
    throw new Error(`Cannot delete: ${productRows[0].c} product(s) reference this brand.`);
  }
  const r = await query('DELETE FROM brands WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function setBrandStatus(id, status) {
  const r = await query('UPDATE brands SET status = ? WHERE id = ?', [Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function bulkInsertBrands(rows) {
  let created = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    try { await createBrand({ name: rows[i].name, image: rows[i].image, status: 1 }); created += 1; }
    catch (e) { errors.push({ row: i + 2, message: e.message }); }
  }
  return { created, total: rows.length, errors };
}

export async function bulkUpdateBrands(rows) {
  let updated = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.id) { errors.push({ row: i + 2, message: 'id is required' }); continue; }
    try { await updateBrand(Number(r.id), { name: r.name, image: r.image, status: 1 }); updated += 1; }
    catch (e) { errors.push({ row: i + 2, message: e.message }); }
  }
  return { updated, total: rows.length, errors };
}

export async function exportBrandsCsv() {
  const rows = await query('SELECT id, name, image FROM brands ORDER BY id');
  const headers = ['id', 'name', 'image'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
}