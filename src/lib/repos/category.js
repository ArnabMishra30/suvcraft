import { query } from '@/lib/db';

function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200) || 'category';
}

async function uniqueCategorySlug(base, ignoreId = null) {
  let slug = base;
  let n = 1;
  while (true) {
    const params = ignoreId ? [slug, ignoreId] : [slug];
    const sql = ignoreId
      ? 'SELECT id FROM categories WHERE slug = ? AND id != ? LIMIT 1'
      : 'SELECT id FROM categories WHERE slug = ? LIMIT 1';
    const rows = await query(sql, params);
    if (!rows.length) return slug;
    n += 1;
    slug = `${base}-${n}`;
    if (n > 1000) return `${base}-${Date.now()}`;
  }
}

export async function listCategories({ page = 1, perPage = 20, search = '', status = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(c.id = ? OR c.name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`);
  }
  if (status === '0' || status === '1') { where.push('c.status = ?'); params.push(Number(status)); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT c.id, c.name, c.slug, c.parent_id, c.image, c.row_order, c.status,
              p.name AS parent_name
         FROM categories c
         LEFT JOIN categories p ON p.id = c.parent_id
         ${whereSql}
         ORDER BY c.row_order, c.id
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM categories c ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function listAllCategoriesForTree() {
  return query(
    `SELECT id, name, parent_id, image, status, row_order
       FROM categories
       ORDER BY row_order, name`
  );
}

export async function listAllCategoriesForParentSelect(excludeId = null) {
  const rows = await query('SELECT id, name, parent_id FROM categories ORDER BY name');
  if (!excludeId) return rows;
  const exId = Number(excludeId);
  const descendants = new Set([exId]);
  let added = true;
  while (added) {
    added = false;
    for (const r of rows) {
      if (r.parent_id != null && descendants.has(r.parent_id) && !descendants.has(r.id)) {
        descendants.add(r.id);
        added = true;
      }
    }
  }
  return rows.filter((r) => !descendants.has(r.id));
}

export async function getCategory(id) {
  const rows = await query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function createCategory(input) {
  const name = String(input.name || '').trim();
  if (!name) throw new Error('Name is required.');
  const image = String(input.image || '').trim();
  if (!image) throw new Error('Main image is required.');

  const slug = await uniqueCategorySlug(slugify(name));
  const data = {
    name,
    parent_id: input.parent_id ? Number(input.parent_id) : 0,
    slug,
    image,
    banner: input.banner || '',
    row_order: input.row_order != null ? Number(input.row_order) : 0,
    status: input.status != null ? Number(input.status) : 1,
    is_in_affiliate: input.is_in_affiliate ? 1 : 0,
    affiliate_commission: Number(input.affiliate_commission || 0),
    clicks: 0,
    seo_page_title: input.seo_page_title || null,
    seo_meta_keywords: input.seo_meta_keywords || null,
    seo_meta_description: input.seo_meta_description || null,
    seo_og_image: input.seo_og_image || null,
  };
  const cols = Object.keys(data);
  const values = cols.map((k) => data[k]);
  const r = await query(
    `INSERT INTO categories (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
    values
  );
  return r.insertId;
}

export async function updateCategory(id, input) {
  const name = String(input.name || '').trim();
  if (!name) throw new Error('Name is required.');
  const image = String(input.image || '').trim();
  if (!image) throw new Error('Main image is required.');

  let slug = String(input.slug || '').trim();
  if (!slug) slug = await uniqueCategorySlug(slugify(name), id);

  const data = {
    name,
    parent_id: input.parent_id ? Number(input.parent_id) : 0,
    slug,
    image,
    status: input.status != null ? Number(input.status) : 1,
    seo_page_title: input.seo_page_title || null,
    seo_meta_keywords: input.seo_meta_keywords || null,
    seo_meta_description: input.seo_meta_description || null,
    seo_og_image: input.seo_og_image || null,
  };
  const setSql = Object.keys(data).map((k) => `\`${k}\` = ?`).join(', ');
  const r = await query(`UPDATE categories SET ${setSql} WHERE id = ?`, [...Object.values(data), id]);
  return r.affectedRows > 0;
}

export async function deleteCategory(id) {
  const childrenRows = await query('SELECT COUNT(*) AS c FROM categories WHERE parent_id = ?', [id]);
  if (Number(childrenRows[0].c) > 0) {
    throw new Error('Cannot delete: this category has subcategories. Reassign or delete them first.');
  }
  const productRows = await query('SELECT COUNT(*) AS c FROM products WHERE category_id = ?', [id]);
  if (Number(productRows[0].c) > 0) {
    throw new Error(`Cannot delete: ${productRows[0].c} product(s) belong to this category.`);
  }
  const r = await query('DELETE FROM categories WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function setCategoryStatus(id, status) {
  const r = await query('UPDATE categories SET status = ? WHERE id = ?', [Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function bulkUpdateCategoryOrder(items) {
  let updated = 0;
  for (const it of items) {
    const id = Number(it.id);
    const order = Number(it.row_order);
    if (!id || !Number.isFinite(order)) continue;
    const r = await query('UPDATE categories SET row_order = ? WHERE id = ?', [order, id]);
    if (r.affectedRows) updated += 1;
  }
  return updated;
}

export async function listCategoriesForOrdering() {
  return query('SELECT id, name, image, row_order FROM categories ORDER BY row_order, id');
}

export async function bulkInsertCategories(rows) {
  let created = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      await createCategory({
        name: r.name,
        image: r.image,
        seo_page_title: r.seo_page_title,
        seo_meta_keywords: r.seo_meta_keywords,
        seo_meta_description: r.seo_meta_description,
        seo_og_image: r.seo_og_image,
      });
      created += 1;
    } catch (e) {
      errors.push({ row: i + 2, message: e.message });
    }
  }
  return { created, total: rows.length, errors };
}

export async function bulkUpdateCategories(rows) {
  let updated = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.id) { errors.push({ row: i + 2, message: 'id is required for update' }); continue; }
    const exists = await query('SELECT id, slug FROM categories WHERE id = ? LIMIT 1', [Number(r.id)]);
    if (!exists.length) { errors.push({ row: i + 2, message: `Category ${r.id} not found` }); continue; }
    try {
      await updateCategory(Number(r.id), {
        name: r.name,
        image: r.image,
        slug: exists[0].slug,
        seo_page_title: r.seo_page_title,
        seo_meta_keywords: r.seo_meta_keywords,
        seo_meta_description: r.seo_meta_description,
        seo_og_image: r.seo_og_image,
      });
      updated += 1;
    } catch (e) {
      errors.push({ row: i + 2, message: e.message });
    }
  }
  return { updated, total: rows.length, errors };
}

export async function exportCategoriesCsv() {
  const rows = await query('SELECT id, name, image, seo_page_title, seo_meta_keywords, seo_meta_description, seo_og_image FROM categories ORDER BY id');
  const headers = ['id', 'name', 'image', 'seo_page_title', 'seo_meta_keywords', 'seo_meta_description', 'seo_og_image'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
  return csv;
}