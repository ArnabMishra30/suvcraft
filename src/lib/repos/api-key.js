import { query } from '@/lib/db';
import crypto from 'node:crypto';

export async function listApiKeys({ page = 1, perPage = 20, search = '' } = {}) {
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
    query(`SELECT id, name, secret, status FROM client_api_keys ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM client_api_keys ${whereSql}`, params),
  ]);
  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function createApiKey(input) {
  const name = String(input.name || '').trim();
  if (!name) throw new Error('Client name is required.');
  const secret = crypto.randomBytes(20).toString('hex');
  const r = await query('INSERT INTO client_api_keys (name, secret, status) VALUES (?, ?, 1)', [name, secret]);
  return { id: r.insertId, name, secret };
}

export async function setApiKeyStatus(id, status) {
  const r = await query('UPDATE client_api_keys SET status = ? WHERE id = ?', [Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function deleteApiKey(id) {
  const r = await query('DELETE FROM client_api_keys WHERE id = ?', [id]);
  return r.affectedRows > 0;
}