import { query } from '@/lib/db';

export async function listThemes({ search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR name LIKE ? OR slug LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return query(`SELECT id, name, slug, image, is_default, status, created_on FROM themes ${whereSql} ORDER BY id DESC`, params);
}

export async function getTheme(id) {
  const rows = await query('SELECT * FROM themes WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function setThemeStatus(id, status) {
  const r = await query('UPDATE themes SET status = ? WHERE id = ?', [Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function setDefaultTheme(id) {
  await query('UPDATE themes SET is_default = 0');
  const r = await query('UPDATE themes SET is_default = 1, status = 1 WHERE id = ?', [id]);
  return r.affectedRows > 0;
}