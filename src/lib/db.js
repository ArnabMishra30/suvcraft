import mysql from 'mysql2/promise';

const globalForDb = globalThis;

export function getPool() {
  if (!globalForDb.__mysqlPool) {
    globalForDb.__mysqlPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return globalForDb.__mysqlPool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}