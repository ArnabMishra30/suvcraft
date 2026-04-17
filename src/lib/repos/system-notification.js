import { query } from '@/lib/db';

export async function listSystemNotifications({ page = 1, perPage = 20, search = '', readBy = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR title LIKE ? OR message LIKE ? OR type LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  if (readBy === '0' || readBy === '1') {
    where.push('read_by = ?');
    params.push(Number(readBy));
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT id, title, message, type, type_id, read_by, date_sent
         FROM system_notification
         ${whereSql}
         ORDER BY id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM system_notification ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function deleteSystemNotification(id) {
  const r = await query('DELETE FROM system_notification WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function markAllSystemNotificationsRead() {
  const r = await query('UPDATE system_notification SET read_by = 1 WHERE read_by = 0');
  return r.affectedRows;
}

export async function markSystemNotificationRead(id, readBy = 1) {
  const r = await query('UPDATE system_notification SET read_by = ? WHERE id = ?', [Number(readBy), id]);
  return r.affectedRows > 0;
}