import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const ident = process.argv[2];
const pw = process.argv[3];

const c = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

if (!ident) {
  const [rows] = await c.execute(
    "SELECT id, username, email, mobile, active, email_verified, mobile_verified, LEFT(password, 7) AS pw_prefix FROM users LIMIT 10"
  );
  console.table(rows);
} else {
  const isEmail = /@/.test(ident);
  const col = isEmail ? 'email' : 'mobile';
  const [rows] = await c.execute(
    `SELECT id, username, email, mobile, active, email_verified, mobile_verified, password FROM users WHERE ${col} = ? LIMIT 1`,
    [ident]
  );
  if (!rows.length) {
    console.log(`No user with ${col}=${ident}`);
  } else {
    const u = rows[0];
    console.log({ id: u.id, username: u.username, email: u.email, mobile: u.mobile, active: u.active, email_verified: u.email_verified, mobile_verified: u.mobile_verified, pw_prefix: u.password.slice(0, 7) });
    if (pw) {
      const norm = u.password.startsWith('$2y$') ? '$2a$' + u.password.slice(4) : u.password;
      const ok = await bcrypt.compare(pw, norm);
      console.log('password match:', ok);
    }
  }
}
await c.end();