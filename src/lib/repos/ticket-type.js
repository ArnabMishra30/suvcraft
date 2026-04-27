import { query } from '@/lib/db';

export async function listTicketTypes({ page = 1, perPage = 20, search = '', typeId = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR title LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`);
  }
  if (typeId) { where.push('id = ?'); params.push(Number(typeId)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));
  const [rows, countRows] = await Promise.all([
    query(`SELECT id, title, date_created FROM ticket_types ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM ticket_types ${whereSql}`, params),
  ]);
  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function listAllTicketTypes() {
  return query('SELECT id, title AS name FROM ticket_types ORDER BY title LIMIT 500');
}

export async function getTicketType(id) {
  const rows = await query('SELECT * FROM ticket_types WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function createTicketType(input) {
  const title = String(input.title || '').trim();
  if (!title) throw new Error('Title is required.');
  const dupe = await query('SELECT id FROM ticket_types WHERE title = ? LIMIT 1', [title]);
  if (dupe.length) throw new Error('A ticket type with this title already exists.');
  const r = await query('INSERT INTO ticket_types (title) VALUES (?)', [title]);
  return r.insertId;
}

export async function updateTicketType(id, input) {
  const title = String(input.title || '').trim();
  if (!title) throw new Error('Title is required.');
  const dupe = await query('SELECT id FROM ticket_types WHERE title = ? AND id != ? LIMIT 1', [title, id]);
  if (dupe.length) throw new Error('Another ticket type with this title already exists.');
  const r = await query('UPDATE ticket_types SET title = ? WHERE id = ?', [title, id]);
  return r.affectedRows > 0;
}

export async function deleteTicketType(id) {
  const r = await query('DELETE FROM ticket_types WHERE id = ?', [id]);
  return r.affectedRows > 0;
}