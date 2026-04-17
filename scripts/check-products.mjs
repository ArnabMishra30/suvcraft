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

for (const t of ['categories', 'brands', 'taxes']) {
  try {
    const [rows] = await c.query(`SHOW COLUMNS FROM \`${t}\``);
    console.log(`\n=== ${t} ===`);
    rows.forEach(r => console.log(`${r.Field} (${r.Type}) ${r.Null === 'NO' && r.Default === null && r.Extra !== 'auto_increment' ? '[REQ]' : ''}`));
  } catch (e) { console.log(`${t}: ${e.message}`); }
}

const [stat] = await c.query("SELECT DISTINCT status FROM products LIMIT 10");
console.log('\n=== distinct product statuses ===', stat);

const [count] = await c.query('SELECT COUNT(*) AS c FROM products');
console.log('\n=== product count ===', count[0].c);

await c.end();
