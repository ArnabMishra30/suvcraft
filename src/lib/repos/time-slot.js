import { query } from '@/lib/db';

export async function listTimeSlots({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR title LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));
  const [rows, countRows] = await Promise.all([
    query(`SELECT id, title, from_time, to_time, last_order_time, status FROM time_slots ${whereSql} ORDER BY from_time ASC, id ASC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM time_slots ${whereSql}`, params),
  ]);
  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getTimeSlot(id) {
  const rows = await query('SELECT * FROM time_slots WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

function normalizeTime(t) {
  const s = String(t || '').trim();
  if (!s) return '';
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) throw new Error('Time must be HH:MM (24-hour).');
  const h = Number(m[1]);
  const min = Number(m[2]);
  const sec = m[3] ? Number(m[3]) : 0;
  if (h > 23 || min > 59 || sec > 59) throw new Error('Invalid time value.');
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function validateInput(input) {
  const title = String(input.title || '').trim();
  if (!title) throw new Error('Title is required.');
  const fromTime = normalizeTime(input.from_time);
  const toTime = normalizeTime(input.to_time);
  const lastOrderTime = normalizeTime(input.last_order_time);
  if (!fromTime || !toTime || !lastOrderTime) throw new Error('From, To, and Last Order time are required.');
  const status = Number(input.status);
  if (![0, 1].includes(status)) throw new Error('Status is required.');
  return { title, fromTime, toTime, lastOrderTime, status };
}

export async function createTimeSlot(input) {
  const { title, fromTime, toTime, lastOrderTime, status } = validateInput(input);
  const r = await query(
    'INSERT INTO time_slots (title, from_time, to_time, last_order_time, status) VALUES (?, ?, ?, ?, ?)',
    [title, fromTime, toTime, lastOrderTime, status]
  );
  return r.insertId;
}

export async function updateTimeSlot(id, input) {
  const { title, fromTime, toTime, lastOrderTime, status } = validateInput(input);
  const r = await query(
    'UPDATE time_slots SET title = ?, from_time = ?, to_time = ?, last_order_time = ?, status = ? WHERE id = ?',
    [title, fromTime, toTime, lastOrderTime, status, id]
  );
  return r.affectedRows > 0;
}

export async function deleteTimeSlot(id) {
  const r = await query('DELETE FROM time_slots WHERE id = ?', [id]);
  return r.affectedRows > 0;
}