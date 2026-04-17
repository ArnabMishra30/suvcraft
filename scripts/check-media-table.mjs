import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mysql from 'mysql2/promise';
const c = await mysql.createConnection({
  host: process.env.DB_HOST, port: 3306, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
});
const [t] = await c.query("SHOW TABLES LIKE '%media%'");
console.log('media tables:', t);
for (const row of t) {
  const name = Object.values(row)[0];
  const [cols] = await c.query(`SHOW COLUMNS FROM \`${name}\``);
  console.log(`\n=== ${name} ===`);
  cols.forEach((r) => console.log(`  ${r.Field} (${r.Type})`));
}
await c.end();
