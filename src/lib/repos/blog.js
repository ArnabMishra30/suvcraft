import { query } from '@/lib/db';

function slugify(text) {
  return String(text || '').toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200) || 'blog';
}

async function uniqueSlug(base, excludeId = null) {
  let slug = base; let n = 1;
  while (true) {
    const rows = excludeId
      ? await query('SELECT id FROM blogs WHERE slug = ? AND id != ? LIMIT 1', [slug, excludeId])
      : await query('SELECT id FROM blogs WHERE slug = ? LIMIT 1', [slug]);
    if (!rows.length) return slug;
    n += 1; slug = `${base}-${n}`;
    if (n > 1000) return `${base}-${Date.now()}`;
  }
}

export async function listBlogs({ page = 1, perPage = 20, search = '', categoryId = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(b.id = ? OR b.title LIKE ? OR c.name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like);
  }
  if (categoryId) { where.push('b.category_id = ?'); params.push(Number(categoryId)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT b.id, b.category_id, b.title, b.description, b.image, b.slug, b.status, b.date_added,
              c.name AS category_name
         FROM blogs b
         LEFT JOIN blog_categories c ON c.id = b.category_id
         ${whereSql}
         ORDER BY b.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM blogs b LEFT JOIN blog_categories c ON c.id = b.category_id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getBlog(id) {
  const rows = await query('SELECT * FROM blogs WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

function validateInput(input) {
  const title = String(input.title || '').trim();
  if (!title) throw new Error('Title is required.');
  const categoryId = Number(input.category_id || 0);
  if (!categoryId) throw new Error('Category is required.');
  const image = String(input.image || '').trim();
  if (!image) throw new Error('Main image is required.');
  const description = String(input.description || '').trim();
  if (!description) throw new Error('Description is required.');
  return { title, categoryId, image, description };
}

export async function createBlog(input) {
  const { title, categoryId, image, description } = validateInput(input);
  const slug = await uniqueSlug(slugify(title));
  const r = await query(
    'INSERT INTO blogs (category_id, title, description, image, slug, status) VALUES (?, ?, ?, ?, ?, ?)',
    [categoryId, title, description, image, slug, 1]
  );
  return r.insertId;
}

export async function updateBlog(id, input) {
  const { title, categoryId, image, description } = validateInput(input);
  const slug = await uniqueSlug(slugify(title), id);
  const r = await query(
    'UPDATE blogs SET category_id = ?, title = ?, description = ?, image = ?, slug = ? WHERE id = ?',
    [categoryId, title, description, image, slug, id]
  );
  return r.affectedRows > 0;
}

export async function setBlogStatus(id, status) {
  const r = await query('UPDATE blogs SET status = ? WHERE id = ?', [Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function deleteBlog(id) {
  const r = await query('DELETE FROM blogs WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function listBlogCategoriesForFilter() {
  return query('SELECT id, name FROM blog_categories WHERE status = 1 ORDER BY name LIMIT 1000');
}