import { query } from '@/lib/db';

export async function listAttributeValues({ page = 1, perPage = 20, search = '', attributeId = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(av.id = ? OR av.value LIKE ? OR a.name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`, `%${search}%`);
  }
  if (attributeId) { where.push('av.attribute_id = ?'); params.push(Number(attributeId)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT av.id, av.value, av.swatche_type, av.swatche_value, av.status, av.attribute_id, av.filterable,
              a.name AS attribute_name, s.name AS attribute_set_name
         FROM attribute_values av
         LEFT JOIN attributes a ON a.id = av.attribute_id
         LEFT JOIN attribute_set s ON s.id = a.attribute_set_id
         ${whereSql}
         ORDER BY av.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM attribute_values av LEFT JOIN attributes a ON a.id = av.attribute_id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getAttributeValue(id) {
  const rows = await query('SELECT * FROM attribute_values WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function createAttributeValue({ attribute_id, value, swatche_type = 0, swatche_value = '', filterable = 1, status = 1 }) {
  const v = String(value || '').trim();
  if (!v) throw new Error('Value is required.');
  if (!attribute_id) throw new Error('Attribute is required.');
  const r = await query(
    'INSERT INTO attribute_values (attribute_id, value, swatche_type, swatche_value, filterable, status) VALUES (?, ?, ?, ?, ?, ?)',
    [Number(attribute_id), v, Number(swatche_type) || 0, swatche_value || '', Number(filterable) ? 1 : 0, Number(status) ? 1 : 0]
  );
  return r.insertId;
}

export async function updateAttributeValue(id, { attribute_id, value, swatche_type = 0, swatche_value = '', filterable = 1, status = 1 }) {
  const v = String(value || '').trim();
  if (!v) throw new Error('Value is required.');
  if (!attribute_id) throw new Error('Attribute is required.');
  const r = await query(
    'UPDATE attribute_values SET attribute_id = ?, value = ?, swatche_type = ?, swatche_value = ?, filterable = ?, status = ? WHERE id = ?',
    [Number(attribute_id), v, Number(swatche_type) || 0, swatche_value || '', Number(filterable) ? 1 : 0, Number(status) ? 1 : 0, id]
  );
  return r.affectedRows > 0;
}

export async function deleteAttributeValue(id) {
  const r = await query('DELETE FROM attribute_values WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function setAttributeValueStatus(id, status) {
  const r = await query('UPDATE attribute_values SET status = ? WHERE id = ?', [Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function listAttributesForFilter() {
  return query(
    `SELECT a.id, a.name, s.name AS attribute_set_name
       FROM attributes a
       LEFT JOIN attribute_set s ON s.id = a.attribute_set_id
       ORDER BY s.name, a.name LIMIT 1000`
  );
}