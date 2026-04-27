import { query } from '@/lib/db';

// Each entry maps the order's payment_method value (left) to the toggle key
// in the `payment_method` settings blob (right) that gates whether it's enabled.
export const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash On Delivery', flag: 'cod_method' },
  { value: 'paypal', label: 'Paypal', flag: 'paypal_payment_method' },
  { value: 'razorpay', label: 'RazorPay', flag: 'razorpay_payment_method' },
  { value: 'paystack', label: 'Paystack', flag: 'paystack_payment_method' },
  { value: 'flutterwave', label: 'Flutterwave', flag: 'flutterwave_payment_method' },
  { value: 'stripe', label: 'Stripe', flag: 'stripe_payment_method' },
  { value: 'paytm', label: 'Paytm', flag: 'paytm_payment_method' },
  { value: 'midtrans', label: 'Midtrans', flag: 'midtrans_payment_method' },
  { value: 'myfatoorah', label: 'Myfatoorah', flag: 'myfatoorah_payment_method' },
  { value: 'instamojo', label: 'Instamojo', flag: 'instamojo_payment_method' },
  { value: 'phonepe', label: 'PhonePe', flag: 'phonepe_payment_method' },
  { value: 'bank_transfer', label: 'Bank Transfer', flag: 'direct_bank_transfer' },
];

// Returns the subset of PAYMENT_METHODS whose flag is enabled in the given settings blob.
// If no settings are present at all (e.g. fresh install), every method is shown so the filter
// isn't accidentally empty.
export function enabledPaymentMethods(settings) {
  if (!settings || typeof settings !== 'object') return PAYMENT_METHODS;
  const enabled = PAYMENT_METHODS.filter((m) => Number(settings[m.flag]) === 1);
  return enabled.length ? enabled : PAYMENT_METHODS;
}

export const ORDER_STATUSES = [
  { value: '', label: 'All' },
  { value: 'received', label: 'Received' },
  { value: 'processed', label: 'Processed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

function lastStatus(value) {
  if (!value) return '';
  try {
    const v = JSON.parse(value);
    if (Array.isArray(v) && v.length) {
      const last = v[v.length - 1];
      if (Array.isArray(last)) return String(last[0] || '');
      return String(last || '');
    }
  } catch { /* fall through */ }
  return String(value || '');
}

export async function listSalesReport({ page = 1, perPage = 20, search = '', from = '', to = '', paymentMethod = '', status = '', sellerId = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(oi.id = ? OR oi.product_name LIKE ? OR o.id = ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`, idGuess);
  }
  if (from) { where.push('oi.date_added >= ?'); params.push(`${from} 00:00:00`); }
  if (to) { where.push('oi.date_added <= ?'); params.push(`${to} 23:59:59`); }
  if (paymentMethod) { where.push('o.payment_method = ?'); params.push(paymentMethod); }
  if (sellerId) { where.push('oi.seller_id = ?'); params.push(Number(sellerId)); }
  if (status) { where.push('oi.status LIKE ?'); params.push(`%"${status}"%`); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows, totalRow] = await Promise.all([
    query(
      `SELECT oi.id AS item_id, oi.product_name, oi.quantity, oi.sub_total, oi.status, oi.date_added,
              o.id AS order_id, o.payment_method, o.user_id,
              COALESCE(NULLIF(su.company, ''), su.username) AS store_name,
              COALESCE(db.username, '—') AS sales_representative
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         LEFT JOIN users su ON su.id = oi.seller_id
         LEFT JOIN users db ON db.id = oi.delivery_boy_id
         ${whereSql}
         ORDER BY oi.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(
      `SELECT COUNT(*) AS c
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         ${whereSql}`,
      params
    ),
    query(
      `SELECT COALESCE(SUM(oi.sub_total), 0) AS s
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         ${whereSql}`,
      params
    ),
  ]);

  return {
    rows: rows.map((r) => ({ ...r, last_status: lastStatus(r.status) })),
    total: Number(countRows[0].c),
    totalValue: Number(totalRow[0].s),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}