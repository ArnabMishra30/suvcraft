import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mysql from 'mysql2/promise';

const c = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

try {
  const [r] = await c.execute(
    `INSERT INTO order_tracking
       (order_id, order_item_id, courier_agency, tracking_id, url,
        shiprocket_order_id, shipment_id, courier_company_id, pickup_status, status, is_canceled, consignment_id)
     VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0)`,
    [1, '', 'DHL', 'TEST-123', 'https://dhl.com/track/TEST-123']
  );
  console.log('insert ok, id =', r.insertId);
  await c.execute('DELETE FROM order_tracking WHERE id = ?', [r.insertId]);
  console.log('cleanup done');
} catch (e) {
  console.log('insert FAILED:', e.code, e.sqlMessage);
}

await c.end();
