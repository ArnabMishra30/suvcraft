import { query } from '@/lib/db';

export async function listFaqs({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR question LIKE ? OR answer LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));
  const [rows, countRows] = await Promise.all([
    query(`SELECT id, question, answer, status FROM faqs ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM faqs ${whereSql}`, params),
  ]);
  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getFaq(id) {
  const rows = await query('SELECT * FROM faqs WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

function validateInput(input) {
  const question = String(input.question || '').trim();
  const answer = String(input.answer || '').trim();
  if (!question) throw new Error('Question is required.');
  if (!answer) throw new Error('Answer is required.');
  return { question, answer };
}

export async function createFaq(input) {
  const { question, answer } = validateInput(input);
  const r = await query('INSERT INTO faqs (question, answer, status) VALUES (?, ?, "1")', [question, answer]);
  return r.insertId;
}

export async function updateFaq(id, input) {
  const { question, answer } = validateInput(input);
  const r = await query('UPDATE faqs SET question = ?, answer = ? WHERE id = ?', [question, answer, id]);
  return r.affectedRows > 0;
}

export async function setFaqStatus(id, status) {
  const r = await query('UPDATE faqs SET status = ? WHERE id = ?', [String(Number(status) ? '1' : '0'), id]);
  return r.affectedRows > 0;
}

export async function deleteFaq(id) {
  const r = await query('DELETE FROM faqs WHERE id = ?', [id]);
  return r.affectedRows > 0;
}