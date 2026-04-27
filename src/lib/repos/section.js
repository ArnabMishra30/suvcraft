import { query } from '@/lib/db';
import { FEATURED_PRODUCT_TYPES, FEATURED_STYLES } from '@/lib/featured-types';

const ALLOWED_TYPES = new Set(FEATURED_PRODUCT_TYPES.map((t) => t.value));
const ALLOWED_STYLES = new Set(FEATURED_STYLES.map((s) => s.value));

function slugify(text) {
  return String(text || '').toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200) || 'section';
}

async function uniqueSlug(base, excludeId = null) {
  let slug = base; let n = 1;
  while (true) {
    const rows = excludeId
      ? await query('SELECT id FROM sections WHERE slug = ? AND id != ? LIMIT 1', [slug, excludeId])
      : await query('SELECT id FROM sections WHERE slug = ? LIMIT 1', [slug]);
    if (!rows.length) return slug;
    n += 1; slug = `${base}-${n}`;
    if (n > 1000) return `${base}-${Date.now()}`;
  }
}

export async function listSections({ page = 1, perPage = 20, search = '', productType = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(s.id = ? OR s.title LIKE ? OR s.short_description LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like);
  }
  if (productType) { where.push('s.product_type = ?'); params.push(productType); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(`SELECT s.id, s.title, s.slug, s.short_description, s.style, s.categories, s.product_ids,
                  s.product_type, s.row_order, s.date_added,
                  s.seo_page_title, s.seo_meta_keywords, s.seo_meta_description, s.seo_og_image
             FROM sections s ${whereSql}
             ORDER BY s.row_order ASC, s.id ASC
             LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM sections s ${whereSql}`, params),
  ]);

  // Resolve category names + product names for display.
  const catIds = new Set();
  const prodIds = new Set();
  for (const r of rows) {
    String(r.categories || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((id) => catIds.add(Number(id)));
    String(r.product_ids || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((id) => prodIds.add(Number(id)));
  }
  const catNameMap = new Map();
  if (catIds.size) {
    const ph = Array.from(catIds).map(() => '?').join(',');
    const cs = await query(`SELECT id, name FROM categories WHERE id IN (${ph})`, Array.from(catIds));
    for (const c of cs) catNameMap.set(Number(c.id), c.name);
  }
  const prodNameMap = new Map();
  if (prodIds.size) {
    const ph = Array.from(prodIds).map(() => '?').join(',');
    const ps = await query(`SELECT id, name FROM products WHERE id IN (${ph})`, Array.from(prodIds));
    for (const p of ps) prodNameMap.set(Number(p.id), p.name);
  }

  return {
    rows: rows.map((r) => ({
      ...r,
      category_names: String(r.categories || '').split(',').map((s) => s.trim()).filter(Boolean)
        .map((id) => catNameMap.get(Number(id))).filter(Boolean),
      product_names: String(r.product_ids || '').split(',').map((s) => s.trim()).filter(Boolean)
        .map((id) => prodNameMap.get(Number(id))).filter(Boolean),
    })),
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getSection(id) {
  const rows = await query('SELECT * FROM sections WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

function validateInput(input) {
  const title = String(input.title || '').trim();
  if (!title) throw new Error('Title is required.');
  const shortDesc = String(input.short_description || '').trim();
  if (!shortDesc) throw new Error('Short description is required.');
  const style = String(input.style || '').toLowerCase();
  if (!ALLOWED_STYLES.has(style)) throw new Error('Style is required.');
  const productType = String(input.product_type || '').toLowerCase();
  if (!ALLOWED_TYPES.has(productType)) throw new Error('Product type is required.');
  const categories = (Array.isArray(input.categories) ? input.categories : String(input.categories || '').split(','))
    .map((s) => Number(String(s).trim())).filter(Boolean);
  if (!categories.length) throw new Error('Select at least one category.');
  const productIds = (Array.isArray(input.product_ids) ? input.product_ids : String(input.product_ids || '').split(','))
    .map((s) => Number(String(s).trim())).filter(Boolean);
  if (productType === 'custom_products' && !productIds.length) {
    throw new Error('Custom Products requires at least one product.');
  }
  return {
    title, shortDesc, style, productType,
    categories: categories.join(','),
    productIds: productIds.join(','),
    seo_page_title: String(input.seo_page_title || ''),
    seo_meta_keywords: String(input.seo_meta_keywords || ''),
    seo_meta_description: String(input.seo_meta_description || ''),
    seo_og_image: String(input.seo_og_image || ''),
  };
}

export async function createSection(input) {
  const v = validateInput(input);
  const slug = await uniqueSlug(slugify(v.title));
  const orderRow = await query('SELECT COALESCE(MAX(row_order), 0) + 1 AS next FROM sections');
  const next = Number(orderRow[0].next);
  const r = await query(
    `INSERT INTO sections
       (title, slug, short_description, style, product_ids, row_order, categories, product_type,
        seo_page_title, seo_meta_keywords, seo_meta_description, seo_og_image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [v.title, slug, v.shortDesc, v.style, v.productIds, next, v.categories, v.productType,
     v.seo_page_title, v.seo_meta_keywords, v.seo_meta_description, v.seo_og_image]
  );
  return r.insertId;
}

export async function updateSection(id, input) {
  const v = validateInput(input);
  const slug = await uniqueSlug(slugify(v.title), id);
  const r = await query(
    `UPDATE sections SET
       title = ?, slug = ?, short_description = ?, style = ?, product_ids = ?, categories = ?,
       product_type = ?, seo_page_title = ?, seo_meta_keywords = ?, seo_meta_description = ?, seo_og_image = ?
     WHERE id = ?`,
    [v.title, slug, v.shortDesc, v.style, v.productIds, v.categories, v.productType,
     v.seo_page_title, v.seo_meta_keywords, v.seo_meta_description, v.seo_og_image, id]
  );
  return r.affectedRows > 0;
}

export async function deleteSection(id) {
  const r = await query('DELETE FROM sections WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function reorderSections(orderedIds = []) {
  for (let i = 0; i < orderedIds.length; i++) {
    await query('UPDATE sections SET row_order = ? WHERE id = ?', [i + 1, Number(orderedIds[i])]);
  }
  return true;
}