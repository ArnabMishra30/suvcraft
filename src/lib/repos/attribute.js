import { query } from '@/lib/db';

export async function listAttributes({ page = 1, perPage = 20, search = '', attributeSetId = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(a.id = ? OR a.name LIKE ? OR s.name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`, `%${search}%`);
  }
  if (attributeSetId) { where.push('a.attribute_set_id = ?'); params.push(Number(attributeSetId)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT a.id, a.name, a.attribute_set_id, a.status, s.name AS attribute_set_name
         FROM attributes a
         LEFT JOIN attribute_set s ON s.id = a.attribute_set_id
         ${whereSql}
         ORDER BY a.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM attributes a LEFT JOIN attribute_set s ON s.id = a.attribute_set_id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getAttribute(id) {
  const rows = await query('SELECT id, name, attribute_set_id, status FROM attributes WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function createAttribute({ name, attribute_set_id, status = 1, values = [] }) {
  const trimmed = String(name || '').trim();
  if (!trimmed) throw new Error('Name is required.');
  if (!attribute_set_id) throw new Error('Attribute set is required.');
  const r = await query(
    'INSERT INTO attributes (name, attribute_set_id, status) VALUES (?, ?, ?)',
    [trimmed, Number(attribute_set_id), Number(status) ? 1 : 0]
  );
  const attrId = r.insertId;
  for (const v of values) {
    const val = String(v.value || '').trim();
    if (!val) continue;
    await query(
      'INSERT INTO attribute_values (attribute_id, value, swatche_type, swatche_value, filterable, status) VALUES (?, ?, ?, ?, ?, ?)',
      [attrId, val, Number(v.swatche_type || 0), v.swatche_value || '', 1, 1]
    );
  }
  return attrId;
}

export async function getAttributeWithValues(id) {
  const rows = await query('SELECT id, name, attribute_set_id, status FROM attributes WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) return null;
  const values = await query(
    'SELECT id, value, swatche_type, swatche_value FROM attribute_values WHERE attribute_id = ? ORDER BY id',
    [id]
  );
  return { ...rows[0], values };
}

export async function replaceAttributeValues(attribute_id, values = []) {
  await query('DELETE FROM attribute_values WHERE attribute_id = ?', [attribute_id]);
  for (const v of values) {
    const val = String(v.value || '').trim();
    if (!val) continue;
    await query(
      'INSERT INTO attribute_values (attribute_id, value, swatche_type, swatche_value, filterable, status) VALUES (?, ?, ?, ?, ?, ?)',
      [attribute_id, val, Number(v.swatche_type || 0), v.swatche_value || '', 1, 1]
    );
  }
}

export async function updateAttribute(id, { name, attribute_set_id, status }) {
  const trimmed = String(name || '').trim();
  if (!trimmed) throw new Error('Name is required.');
  if (!attribute_set_id) throw new Error('Attribute set is required.');
  const r = await query(
    'UPDATE attributes SET name = ?, attribute_set_id = ?, status = ? WHERE id = ?',
    [trimmed, Number(attribute_set_id), Number(status) ? 1 : 0, id]
  );
  return r.affectedRows > 0;
}

export async function deleteAttribute(id) {
  const r = await query('DELETE FROM attributes WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function setAttributeStatus(id, status) {
  const r = await query('UPDATE attributes SET status = ? WHERE id = ?', [Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function listAttributeSetsForFilter() {
  return query('SELECT id, name FROM attribute_set ORDER BY name LIMIT 500');
}