import { query } from '@/lib/db';

const MIN_NODE = '18.18.0';
const MAX_NODE = '24.99.0';

function parseSemver(v) {
  const m = String(v || '').replace(/^v/, '').split('.').map((n) => Number(n) || 0);
  return [m[0] || 0, m[1] || 0, m[2] || 0];
}

function cmp(a, b) {
  const [a1, a2, a3] = parseSemver(a);
  const [b1, b2, b3] = parseSemver(b);
  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2 - b2;
  return a3 - b3;
}

async function checkModule(name) {
  try { await import(name); return true; } catch { return false; }
}

export async function getSystemHealth() {
  const nodeVersion = process.version.replace(/^v/, '');
  const minOk = cmp(nodeVersion, MIN_NODE) >= 0;
  const maxOk = cmp(nodeVersion, MAX_NODE) <= 0;

  const [hasMysql2, hasSharp, hasJwt] = await Promise.all([
    checkModule('mysql2/promise'),
    checkModule('sharp'),
    checkModule('jose'),
  ]);

  const hasFetch = typeof fetch === 'function';
  const hasWebCrypto = typeof crypto?.subtle?.sign === 'function';
  const hasFs = (() => { try { require('node:fs'); return true; } catch { return false; } })();

  let dbOk = false;
  let dbMessage = 'Not connected.';
  try {
    const rows = await query('SELECT 1 AS ok');
    dbOk = rows?.[0]?.ok === 1;
    dbMessage = dbOk ? 'Connected.' : 'Connection responded but query failed.';
  } catch (e) {
    dbMessage = e.message || 'Connection failed.';
  }

  const checks = [
    { name: 'mysql2 (Database driver)', desc: 'Required to talk to MySQL/MariaDB. Bundled via npm install.', ok: hasMysql2 },
    { name: 'Web Crypto API', desc: 'Used for JWT signing & verifying in Edge & Node runtimes.', ok: hasWebCrypto },
    { name: 'Global fetch', desc: 'Used by upload, payment, and notification API calls.', ok: hasFetch },
    { name: 'node:fs module', desc: 'Required to write uploaded media to disk.', ok: hasFs },
    { name: 'sharp (Image processing)', desc: 'Optional. Speeds up thumbnail generation.', ok: hasSharp, optional: true },
    { name: 'jose (JWT helpers)', desc: 'Optional. Provides extra JWT features.', ok: hasJwt, optional: true },
  ];

  return {
    node: {
      current: nodeVersion,
      min: MIN_NODE,
      max: MAX_NODE,
      minOk,
      maxOk,
    },
    database: { ok: dbOk, message: dbMessage },
    checks,
  };
}