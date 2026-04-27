import { query } from '@/lib/db';

export async function listLanguages({ search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR language LIKE ? OR code LIKE ? OR native_language LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return query(`SELECT id, language, code, native_language, is_rtl, is_default, created_on FROM languages ${whereSql} ORDER BY id ASC`, params);
}

export async function getLanguage(id) {
  const rows = await query('SELECT * FROM languages WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

function validateInput(input) {
  const language = String(input.language || input.name || '').trim().toLowerCase();
  const code = String(input.code || '').trim().toLowerCase();
  const native = String(input.native_language || '').trim();
  if (!language) throw new Error('Language name is required.');
  if (!code) throw new Error('Code is required.');
  if (!/^[a-z]{2,8}(-[a-z]{2,8})?$/i.test(code)) throw new Error('Code must be 2–8 letters, optionally with a region (e.g., en, en-us).');
  return { language, code, native, is_rtl: Number(input.is_rtl) ? 1 : 0 };
}

export async function createLanguage(input) {
  const { language, code, native, is_rtl } = validateInput(input);
  const dupe = await query('SELECT id FROM languages WHERE code = ? LIMIT 1', [code]);
  if (dupe.length) throw new Error('A language with this code already exists.');
  const r = await query(
    'INSERT INTO languages (language, code, native_language, is_rtl, is_default) VALUES (?, ?, ?, ?, 0)',
    [language, code, native, is_rtl]
  );
  return r.insertId;
}

export async function updateLanguage(id, input) {
  const { language, code, native, is_rtl } = validateInput(input);
  const dupe = await query('SELECT id FROM languages WHERE code = ? AND id != ? LIMIT 1', [code, id]);
  if (dupe.length) throw new Error('Another language already uses this code.');
  const r = await query(
    'UPDATE languages SET language = ?, code = ?, native_language = ?, is_rtl = ? WHERE id = ?',
    [language, code, native, is_rtl, id]
  );
  return r.affectedRows > 0;
}

export async function setDefaultLanguage(id) {
  await query('UPDATE languages SET is_default = 0');
  const r = await query('UPDATE languages SET is_default = 1 WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function deleteLanguage(id) {
  const lang = await getLanguage(id);
  if (!lang) throw new Error('Language not found.');
  if (Number(lang.is_default) === 1) throw new Error('Cannot delete the default language.');
  const r = await query('DELETE FROM languages WHERE id = ?', [id]);
  return r.affectedRows > 0;
}