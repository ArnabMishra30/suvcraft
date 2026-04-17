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

const [rows] = await c.query('SHOW COLUMNS FROM order_tracking');
const required = rows.filter((r) => r.Null === 'NO' && r.Default === null && r.Extra !== 'auto_increment');
console.log('=== columns requiring explicit value ===');
required.forEach((r) => console.log(`${r.Field} (${r.Type})`));

await c.end();
