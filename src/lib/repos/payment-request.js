import { query } from '@/lib/db';

export const STATUS_LABEL = { 0: 'Pending', 1: 'Approved', 2: 'Rejected' };

export const USER_TYPE_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'seller', label: 'Seller' },
  { value: 'delivery_boy', label: 'Delivery Boy' },
  { value: 'affiliate', label: 'Affiliate User' },
];

export async function listPaymentRequests({ page = 1, perPage = 20, search = '', userType = '', status = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(pr.id = ? OR u.username LIKE ? OR u.email LIKE ? OR u.mobile LIKE ? OR pr.payment_address LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like, like);
  }
  if (userType) { where.push('pr.payment_type = ?'); params.push(userType); }
  if (status === '0' || status === '1' || status === '2') {
    where.push('pr.status = ?'); params.push(Number(status));
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT pr.id, pr.user_id, pr.payment_type, pr.payment_address, pr.amount_requested,
              pr.remarks, pr.status, pr.date_created,
              u.username, u.email, u.mobile
         FROM payment_requests pr
         LEFT JOIN users u ON u.id = pr.user_id
         ${whereSql}
         ORDER BY pr.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM payment_requests pr LEFT JOIN users u ON u.id = pr.user_id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getPaymentRequest(id) {
  const rows = await query(
    `SELECT pr.*, u.username, u.email, u.mobile
       FROM payment_requests pr
       LEFT JOIN users u ON u.id = pr.user_id
       WHERE pr.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function updatePaymentRequest(id, { status, remarks } = {}) {
  const newStatus = Number(status);
  if (![0, 1, 2].includes(newStatus)) throw new Error('Invalid status.');
  const existing = await getPaymentRequest(id);
  if (!existing) throw new Error('Payment request not found.');
  const prev = Number(existing.status);
  if (prev === 1 && newStatus === 1) throw new Error('This request is already approved.');
  if (prev === 2 && newStatus === 2) throw new Error('This request is already rejected.');
  if (prev === 2 && newStatus === 1) throw new Error('You cannot approve a request that has been rejected.');
  if (prev === 1 && newStatus === 2) throw new Error('You cannot reject a request that has been approved.');

  const r = await query(
    'UPDATE payment_requests SET status = ?, remarks = ? WHERE id = ?',
    [newStatus, remarks || null, id]
  );
  return r.affectedRows > 0;
}