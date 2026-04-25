import { query } from '@/lib/db';

export async function listAttributeSets({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(`SELECT id, name, status FROM attribute_set ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM attribute_set ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getAttributeSet(id) {
  const rows = await query('SELECT id, name, status FROM attribute_set WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function createAttributeSet({ name, status = 1 }) {
  const trimmed = String(name || '').trim();
  if (!trimmed) throw new Error('Name is required.');
  const r = await query('INSERT INTO attribute_set (name, status) VALUES (?, ?)', [trimmed, Number(status) ? 1 : 0]);
  return r.insertId;
}

export async function updateAttributeSet(id, { name, status }) {
  const trimmed = String(name || '').trim();
  if (!trimmed) throw new Error('Name is required.');
  const r = await query('UPDATE attribute_set SET name = ?, status = ? WHERE id = ?', [trimmed, Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function deleteAttributeSet(id) {
  const r = await query('DELETE FROM attribute_set WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function setAttributeSetStatus(id, status) {
  const r = await query('UPDATE attribute_set SET status = ? WHERE id = ?', [Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}