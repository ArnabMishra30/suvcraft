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

for (const t of ['attribute_set', 'attributes', 'attribute_values', 'product_attributes']) {
  try {
    const [rows] = await c.query(`SHOW COLUMNS FROM \`${t}\``);
    console.log(`\n=== ${t} ===`);
    rows.forEach(r => console.log(`  ${r.Field} (${r.Type}) ${r.Null === 'NO' && r.Default === null && r.Extra !== 'auto_increment' ? '[REQ]' : ''}`));
  } catch (e) { console.log(`${t}: ${e.message}`); }
}
const [data] = await c.query('SELECT * FROM attribute_set LIMIT 5');
console.log('\nsample:', data);
await c.end();