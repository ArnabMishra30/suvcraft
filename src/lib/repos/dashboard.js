import { query } from '@/lib/db';
import { ROLE } from '@/lib/repos/user';

export async function getDashboardStats() {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sinceStr = since30.toISOString().slice(0, 19).replace('T', ' ');

  const [orders, revenue, products, customers, sellers] = await Promise.all([
    query('SELECT COUNT(*) AS c FROM orders WHERE date_added >= ?', [sinceStr]),
    query('SELECT COALESCE(SUM(final_total), 0) AS s FROM orders WHERE date_added >= ?', [sinceStr]),
    query('SELECT COUNT(*) AS c FROM products WHERE status = 1'),
    query('SELECT COUNT(DISTINCT u.id) AS c FROM users u JOIN users_groups ug ON ug.user_id = u.id WHERE ug.group_id = ?', [ROLE.members]),
    query('SELECT COUNT(DISTINCT u.id) AS c FROM users u JOIN users_groups ug ON ug.user_id = u.id WHERE ug.group_id = ?', [ROLE.seller]),
  ]);

  return {
    orders_30d: Number(orders[0].c),
    revenue_30d: Number(revenue[0].s),
    products: Number(products[0].c),
    customers: Number(customers[0].c),
    sellers: Number(sellers[0].c),
  };
}

export async function getRecentOrders(limit = 5) {
  return query(
    `SELECT o.id, o.final_total, o.status, o.payment_method, o.date_added,
            u.username AS customer
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.date_added DESC
       LIMIT ${Number(limit)}`
  );
}