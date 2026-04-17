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

const [tables] = await c.query("SHOW TABLES LIKE '%track%'");
console.log('=== tracking-like tables ===', tables);

for (const t of ['order_tracking', 'order_history']) {
  try {
    const [rows] = await c.query(`SHOW COLUMNS FROM \`${t}\``);
    console.log(`\n=== ${t} ===`);
    console.log(rows.map(r => `${r.Field} (${r.Type})`).join('\n'));
  } catch (e) { console.log(`${t}: not found`); }
}

const [notif] = await c.query("SHOW TABLES LIKE '%notif%'");
console.log('\n=== notification tables ===', notif);

await c.end();