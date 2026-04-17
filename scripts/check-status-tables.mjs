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

const [t] = await c.query("SHOW TABLES LIKE '%seller%'");
console.log('seller-like:', t);
const [t2] = await c.query("SHOW TABLES LIKE '%deliver%'");
console.log('delivery-like:', t2);
const [t3] = await c.query("SHOW TABLES LIKE '%affiliate%'");
console.log('affiliate-like:', t3);

const [users] = await c.query("SELECT id, username, status FROM users WHERE id IN (1,2)");
console.log('users id 1 + 2 status col:', users);

await c.end();
