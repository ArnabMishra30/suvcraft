import { query } from '@/lib/db';

export async function listConversations(adminUserId) {
  const aid = Number(adminUserId);
  return query(
    `SELECT u.id AS user_id,
            COALESCE(NULLIF(u.username,''), CONCAT('User #', u.id)) AS user_name,
            u.email,
            (SELECT m2.message FROM messages m2
              WHERE (m2.from_id = u.id AND m2.to_id = ?) OR (m2.from_id = ? AND m2.to_id = u.id)
              ORDER BY m2.id DESC LIMIT 1) AS last_message,
            (SELECT m2.date_created FROM messages m2
              WHERE (m2.from_id = u.id AND m2.to_id = ?) OR (m2.from_id = ? AND m2.to_id = u.id)
              ORDER BY m2.id DESC LIMIT 1) AS last_at,
            (SELECT COUNT(*) FROM messages m3
              WHERE m3.from_id = u.id AND m3.to_id = ? AND m3.is_read = 0) AS unread_count
       FROM users u
       WHERE u.id IN (
         SELECT DISTINCT CASE WHEN m.from_id = ? THEN m.to_id ELSE m.from_id END
           FROM messages m
           WHERE m.from_id = ? OR m.to_id = ?
       )
       ORDER BY last_at DESC
       LIMIT 200`,
    [aid, aid, aid, aid, aid, aid, aid, aid]
  );
}

export async function getMessagesBetween(adminUserId, otherUserId) {
  const a = Number(adminUserId);
  const b = Number(otherUserId);
  return query(
    `SELECT m.id, m.from_id, m.to_id, m.is_read, m.message, m.type, m.media, m.date_created
       FROM messages m
       WHERE (m.from_id = ? AND m.to_id = ?) OR (m.from_id = ? AND m.to_id = ?)
       ORDER BY m.id ASC`,
    [a, b, b, a]
  );
}

export async function sendMessage({ fromId, toId, message, type = 'person', media = '' }) {
  const msg = String(message || '').trim();
  if (!msg) throw new Error('Message is required.');
  const r = await query(
    'INSERT INTO messages (from_id, to_id, is_read, message, type, media) VALUES (?, ?, 0, ?, ?, ?)',
    [Number(fromId), Number(toId), msg, type, media]
  );
  return r.insertId;
}

export async function markConversationRead(adminUserId, otherUserId) {
  const a = Number(adminUserId);
  const b = Number(otherUserId);
  await query('UPDATE messages SET is_read = 1 WHERE from_id = ? AND to_id = ? AND is_read = 0', [b, a]);
  return true;
}

export async function getAdminUserId() {
  const rows = await query(
    `SELECT u.id FROM users u
       JOIN users_groups ug ON ug.user_id = u.id
       WHERE ug.group_id = 1 AND u.active = 1
       ORDER BY u.id ASC LIMIT 1`
  );
  return rows[0]?.id || null;
}