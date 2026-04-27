import { query } from '@/lib/db';

export const PROMO_DISCOUNT_TYPE = {
  percentage: { label: 'Percentage', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  amount: { label: 'Amount', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
};

export async function listPromoCodes({ page = 1, perPage = 20, search = '', discountType = '', status = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR promo_code LIKE ? OR message LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like);
  }
  if (discountType === 'percentage' || discountType === 'amount') {
    where.push('discount_type = ?'); params.push(discountType);
  }
  if (status === '0' || status === '1') { where.push('status = ?'); params.push(Number(status)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(`SELECT id, promo_code, message, image, start_date, end_date, no_of_users,
                  minimum_order_amount, discount, discount_type, max_discount_amount,
                  repeat_usage, no_of_repeat_usage, status, is_cashback, list_promocode, date_created
             FROM promo_codes ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM promo_codes ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getPromoCode(id) {
  const rows = await query('SELECT * FROM promo_codes WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

function validateInput(input) {
  const code = String(input.promo_code || '').trim().toUpperCase();
  if (!code) throw new Error('Promo code is required.');
  const message = String(input.message || '').trim();
  const start = String(input.start_date || '').trim();
  const end = String(input.end_date || '').trim();
  if (!start || !end) throw new Error('Start date and End date are required.');
  if (new Date(end) < new Date(start)) throw new Error('End date must be on or after start date.');
  const noOfUsers = Number(input.no_of_users || 0);
  const minAmount = Number(input.minimum_order_amount || 0);
  const discount = Number(input.discount || 0);
  if (!Number.isFinite(discount) || discount < 0) throw new Error('Discount must be a non-negative number.');
  const discountType = String(input.discount_type || '').toLowerCase();
  if (!['percentage', 'amount'].includes(discountType)) throw new Error('Discount type must be Percentage or Amount.');
  if (discountType === 'percentage' && discount > 100) throw new Error('Percentage discount cannot exceed 100.');
  const maxDiscount = Number(input.max_discount_amount || 0);
  const repeatUsage = Number(input.repeat_usage) ? 1 : 0;
  const noOfRepeatUsage = Number(input.no_of_repeat_usage || 0);
  const image = String(input.image || '').trim();
  if (!image) throw new Error('Main image is required.');
  const status = Number(input.status) ? 1 : 0;
  const isCashback = Number(input.is_cashback) ? 1 : 0;
  const listPromocode = Number(input.list_promocode) ? 1 : 0;
  return { code, message, start, end, noOfUsers, minAmount, discount, discountType, maxDiscount, repeatUsage, noOfRepeatUsage, image, status, isCashback, listPromocode };
}

export async function createPromoCode(input) {
  const v = validateInput(input);
  const dupe = await query('SELECT id FROM promo_codes WHERE promo_code = ? LIMIT 1', [v.code]);
  if (dupe.length) throw new Error('A promo code with this title already exists.');
  const r = await query(
    `INSERT INTO promo_codes
       (promo_code, message, start_date, end_date, no_of_users, minimum_order_amount,
        discount, discount_type, max_discount_amount, repeat_usage, no_of_repeat_usage,
        image, status, is_cashback, list_promocode)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [v.code, v.message, v.start, v.end, v.noOfUsers, v.minAmount,
     v.discount, v.discountType, v.maxDiscount, v.repeatUsage, v.noOfRepeatUsage,
     v.image, v.status, v.isCashback, v.listPromocode]
  );
  return r.insertId;
}

export async function updatePromoCode(id, input) {
  const v = validateInput(input);
  const dupe = await query('SELECT id FROM promo_codes WHERE promo_code = ? AND id != ? LIMIT 1', [v.code, id]);
  if (dupe.length) throw new Error('Another promo code with this title already exists.');
  const r = await query(
    `UPDATE promo_codes SET
       promo_code = ?, message = ?, start_date = ?, end_date = ?, no_of_users = ?,
       minimum_order_amount = ?, discount = ?, discount_type = ?, max_discount_amount = ?,
       repeat_usage = ?, no_of_repeat_usage = ?, image = ?, status = ?, is_cashback = ?, list_promocode = ?
     WHERE id = ?`,
    [v.code, v.message, v.start, v.end, v.noOfUsers, v.minAmount, v.discount, v.discountType, v.maxDiscount,
     v.repeatUsage, v.noOfRepeatUsage, v.image, v.status, v.isCashback, v.listPromocode, id]
  );
  return r.affectedRows > 0;
}

export async function setPromoCodeStatus(id, status) {
  const r = await query('UPDATE promo_codes SET status = ? WHERE id = ?', [Number(status) ? 1 : 0, id]);
  return r.affectedRows > 0;
}

export async function deletePromoCode(id) {
  const r = await query('DELETE FROM promo_codes WHERE id = ?', [id]);
  return r.affectedRows > 0;
}