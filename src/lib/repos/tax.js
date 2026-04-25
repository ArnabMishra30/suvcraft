import { query } from '@/lib/db';

export async function listTaxes({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR title LIKE ? OR percentage LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`, `%${search}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(`SELECT id, title, percentage, status FROM taxes ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM taxes ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getTax(id) {
  const rows = await query('SELECT id, title, percentage, status FROM taxes WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function createTax({ title, percentage, status = 1 }) {
  const t = String(title || '').trim();
  if (!t) throw new Error('Title is required.');
  const p = String(percentage ?? '').trim();
  if (p === '' || isNaN(Number(p))) throw new Error('Percentage is required and must be a number.');
  const r = await query('INSERT INTO taxes (title, percentage, status) VALUES (?, ?, ?)', [t, p, Number(status) ? 1 : 0]);
  return r.insertId;
}

export async function updateTax(id, { title, percentage, status = 1 }) {
  const t = String(title || '').trim();
  if (!t) throw new Error('Title is required.');
  const p = String(percentage ?? '').trim();
  if (p === '' || isNaN(Number(p))) throw new Error('Percentage is required and must be a number.');
  const r = await query('UPDATE taxes SET title = ?, percentage = ?, status = ? WHERE id = ?', [t, p, Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function deleteTax(id) {
  const r = await query('DELETE FROM taxes WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function setTaxStatus(id, status) {
  const r = await query('UPDATE taxes SET status = ? WHERE id = ?', [Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}