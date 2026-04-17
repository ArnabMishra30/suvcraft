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

const [rows] = await c.query('SHOW COLUMNS FROM products');
console.log('=== required (NOT NULL, no default) ===');
rows.filter(r => r.Null === 'NO' && r.Default === null && r.Extra !== 'auto_increment').forEach(r => console.log(`  ${r.Field} (${r.Type})`));

console.log('\n=== all columns ===');
rows.forEach(r => console.log(`  ${r.Field} (${r.Type}) ${r.Null === 'NO' ? 'NOT NULL' : 'NULL'} default=${JSON.stringify(r.Default)}`));

const [t] = await c.query("SHOW TABLES LIKE 'countries'");
console.log('\ncountries table:', t.length ? 'YES' : 'NO');
const [pl] = await c.query("SHOW TABLES LIKE 'pickup_locations'");
console.log('pickup_locations table:', pl.length ? 'YES' : 'NO');

await c.end();
