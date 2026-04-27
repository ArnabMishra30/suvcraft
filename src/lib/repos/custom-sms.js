import { query } from '@/lib/db';
import { CUSTOM_NOTIFICATION_TYPES } from '@/lib/notification-types';

export async function listCustomSms({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR title LIKE ? OR message LIKE ? OR type LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));
  const [rows, countRows] = await Promise.all([
    query(`SELECT id, title, message, type, date_sent FROM custom_sms ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM custom_sms ${whereSql}`, params),
  ]);
  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getCustomSms(id) {
  const rows = await query('SELECT * FROM custom_sms WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

function validateInput(input) {
  const type = String(input.type || '').trim();
  if (!type) throw new Error('Type is required.');
  const allowed = new Set(CUSTOM_NOTIFICATION_TYPES.map((t) => t.value));
  if (!allowed.has(type)) throw new Error('Invalid type.');
  const title = String(input.title || '').trim();
  if (!title) throw new Error('Title is required.');
  const message = String(input.message || '').trim();
  if (!message) throw new Error('Message is required.');
  return { type, title, message };
}

export async function createCustomSms(input) {
  const { type, title, message } = validateInput(input);
  const dupe = await query('SELECT id FROM custom_sms WHERE type = ? LIMIT 1', [type]);
  if (dupe.length) throw new Error('A custom SMS for this type already exists. Edit it instead.');
  const r = await query('INSERT INTO custom_sms (type, title, message) VALUES (?, ?, ?)', [type, title, message]);
  return r.insertId;
}

export async function updateCustomSms(id, input) {
  const { type, title, message } = validateInput(input);
  const dupe = await query('SELECT id FROM custom_sms WHERE type = ? AND id != ? LIMIT 1', [type, id]);
  if (dupe.length) throw new Error('Another custom SMS already uses this type.');
  const r = await query('UPDATE custom_sms SET type = ?, title = ?, message = ? WHERE id = ?', [type, title, message, id]);
  return r.affectedRows > 0;
}

export async function deleteCustomSms(id) {
  const r = await query('DELETE FROM custom_sms WHERE id = ?', [id]);
  return r.affectedRows > 0;
}