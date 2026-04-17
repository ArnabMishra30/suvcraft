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

for (const t of ['order_items', 'addresses']) {
  try {
    const [rows] = await c.query(`SHOW COLUMNS FROM \`${t}\``);
    console.log(`\n=== ${t} ===`);
    console.log(rows.map(r => `${r.Field} (${r.Type})`).join('\n'));
  } catch (e) { console.log(`${t}: ${e.message}`); }
}

const [statuses] = await c.query("SELECT DISTINCT status FROM orders");
console.log('\n=== distinct order statuses ===');
console.log(statuses);

const [pm] = await c.query("SELECT DISTINCT payment_method FROM orders");
console.log('\n=== distinct payment_methods ===');
console.log(pm);

await c.end();