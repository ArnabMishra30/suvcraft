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
  const [rows] = await c.execute(
    'SELECT g.id, g.name FROM users_groups ug JOIN groups g ON g.id = ug.group_id WHERE ug.user_id = ?',
    [1]
  );
  console.log('unquoted ok:', rows);
} catch (e) {
  console.log('unquoted FAILED:', e.code, e.sqlMessage);
}

try {
  const [rows] = await c.execute(
    'SELECT g.id, g.name FROM users_groups ug JOIN `groups` g ON g.id = ug.group_id WHERE ug.user_id = ?',
    [1]
  );
  console.log('quoted ok:', rows);
} catch (e) {
  console.log('quoted FAILED:', e.code, e.sqlMessage);
}

await c.end();