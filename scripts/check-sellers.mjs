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

const [rows] = await c.query('SHOW COLUMNS FROM sellers');
console.log('=== sellers ===');
console.log(rows.map(r => `${r.Field} (${r.Type})`).join('\n'));

await c.end();
