import { query } from '@/lib/db';

function slugify(text) {
  return String(text || '').toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200) || 'category';
}

async function uniqueSlug(base, excludeId = null) {
  let slug = base; let n = 1;
  while (true) {
    const rows = excludeId
      ? await query('SELECT id FROM blog_categories WHERE slug = ? AND id != ? LIMIT 1', [slug, excludeId])
      : await query('SELECT id FROM blog_categories WHERE slug = ? LIMIT 1', [slug]);
    if (!rows.length) return slug;
    n += 1; slug = `${base}-${n}`;
    if (n > 1000) return `${base}-${Date.now()}`;
  }
}

export async function listBlogCategories({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR name LIKE ? OR slug LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(`SELECT id, name, slug, image, banner, status FROM blog_categories ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM blog_categories ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getBlogCategory(id) {
  const rows = await query('SELECT * FROM blog_categories WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

function validateInput(input) {
  const name = String(input.name || '').trim();
  if (!name) throw new Error('Name is required.');
  const image = String(input.image || '').trim();
  if (!image) throw new Error('Main image is required.');
  const banner = String(input.banner || '').trim();
  return { name, image, banner };
}

export async function createBlogCategory(input) {
  const { name, image, banner } = validateInput(input);
  const slug = await uniqueSlug(slugify(name));
  const r = await query(
    'INSERT INTO blog_categories (name, slug, image, banner, status) VALUES (?, ?, ?, ?, ?)',
    [name, slug, image, banner, 1]
  );
  return r.insertId;
}

export async function updateBlogCategory(id, input) {
  const { name, image, banner } = validateInput(input);
  const slug = await uniqueSlug(slugify(name), id);
  const r = await query(
    'UPDATE blog_categories SET name = ?, slug = ?, image = ?, banner = ? WHERE id = ?',
    [name, slug, image, banner, id]
  );
  return r.affectedRows > 0;
}

export async function setBlogCategoryStatus(id, status) {
  const r = await query('UPDATE blog_categories SET status = ? WHERE id = ?', [Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function deleteBlogCategory(id) {
  const r = await query('DELETE FROM blog_categories WHERE id = ?', [id]);
  return r.affectedRows > 0;
}