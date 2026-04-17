import { query } from '@/lib/db';

export function mediaUrl(row) {
  if (!row) return '';
  let sub = String(row.sub_directory || '').replace(/^\/+|\/+$/g, '');
  if (!/^uploads(\/|$)/i.test(sub)) sub = `uploads/${sub}`;
  let name = String(row.name || '');
  const ext = String(row.extension || '').replace(/^\./, '');
  if (ext && !name.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) name = `${name}.${ext}`;
  return `/${sub}/${name}`.replace(/\/+/g, '/');
}

export async function listMedia({ page = 1, perPage = 20, search = '', kind = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR name LIKE ? OR title LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like);
  }
  if (kind === 'image') where.push("type IN ('image','jpg','jpeg','png','gif','webp','avif','svg')");
  else if (kind === 'video') where.push("type IN ('video','mp4','webm','ogg','mov')");

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, count] = await Promise.all([
    query(
      `SELECT id, seller_id, title, name, extension, type, sub_directory, size, date_created
         FROM media ${whereSql}
         ORDER BY id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM media ${whereSql}`, params),
  ]);

  return {
    rows: rows.map((r) => ({ ...r, url: mediaUrl(r) })),
    total: Number(count[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(count[0].c) / limit)),
  };
}

export async function insertMedia({ seller_id = 0, title, name, extension, type, sub_directory, size }) {
  const r = await query(
    `INSERT INTO media (seller_id, title, name, extension, type, sub_directory, size)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [Number(seller_id) || 0, title || name, name, extension, type, sub_directory, String(size)]
  );
  return r.insertId;
}

export async function deleteMedia(id) {
  const rows = await query('SELECT * FROM media WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) return null;
  await query('DELETE FROM media WHERE id = ?', [id]);
  return rows[0];
}