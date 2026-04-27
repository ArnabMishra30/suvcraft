import { query } from '@/lib/db';

export const TICKET_STATUS = {
  1: { label: 'Pending', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  2: { label: 'Opened', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  3: { label: 'Resolved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  4: { label: 'Closed', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
  5: { label: 'Reopened', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
};

export async function listTickets({ page = 1, perPage = 20, search = '', typeId = '', status = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(t.id = ? OR t.subject LIKE ? OR t.email LIKE ? OR u.username LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  if (typeId) { where.push('t.ticket_type_id = ?'); params.push(Number(typeId)); }
  if (status !== '' && status != null) { where.push('t.status = ?'); params.push(Number(status)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT t.id, t.ticket_type_id, t.user_id, t.subject, t.email, t.description, t.status,
              t.last_updated, t.date_created,
              tt.title AS ticket_type_title,
              u.username AS user_name
         FROM tickets t
         LEFT JOIN ticket_types tt ON tt.id = t.ticket_type_id
         LEFT JOIN users u ON u.id = t.user_id
         ${whereSql}
         ORDER BY t.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM tickets t LEFT JOIN users u ON u.id = t.user_id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getTicket(id) {
  const rows = await query(
    `SELECT t.*, tt.title AS ticket_type_title, u.username AS user_name, u.email AS user_email
       FROM tickets t
       LEFT JOIN ticket_types tt ON tt.id = t.ticket_type_id
       LEFT JOIN users u ON u.id = t.user_id
       WHERE t.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function getTicketMessages(ticketId) {
  return query(
    `SELECT tm.id, tm.user_type, tm.user_id, tm.message, tm.attachments, tm.date_created,
            u.username AS user_name
       FROM ticket_messages tm
       LEFT JOIN users u ON u.id = tm.user_id
       WHERE tm.ticket_id = ?
       ORDER BY tm.id ASC`,
    [ticketId]
  );
}

export async function addTicketMessage({ ticketId, userId, userType = 'admin', message, attachments = '' }) {
  const msg = String(message || '').trim();
  if (!msg) throw new Error('Message is required.');
  await query(
    'INSERT INTO ticket_messages (ticket_id, user_id, user_type, message, attachments) VALUES (?, ?, ?, ?, ?)',
    [Number(ticketId), Number(userId) || 0, userType, msg, attachments || '']
  );
  await query('UPDATE tickets SET last_updated = NOW() WHERE id = ?', [ticketId]);
  return true;
}

export async function setTicketStatus(id, status) {
  const s = Number(status);
  if (![1, 2, 3, 4, 5].includes(s)) throw new Error('Invalid status.');
  const r = await query('UPDATE tickets SET status = ?, last_updated = NOW() WHERE id = ?', [s, id]);
  return r.affectedRows > 0;
}

export async function deleteTicket(id) {
  await query('DELETE FROM ticket_messages WHERE ticket_id = ?', [id]);
  const r = await query('DELETE FROM tickets WHERE id = ?', [id]);
  return r.affectedRows > 0;
}