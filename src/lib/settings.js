import { query } from '@/lib/db';

const cache = new Map();

export async function getSettings(type, parseJson = true) {
  if (cache.has(type)) return cache.get(type);
  const rows = await query('SELECT value FROM settings WHERE variable = ?', [type]);
  if (!rows.length) return null;
  const value = parseJson ? safeJson(rows[0].value) : rows[0].value;
  cache.set(type, value);
  return value;
}

export function clearSettingsCache(type) {
  if (type) cache.delete(type); else cache.clear();
}

function safeJson(v) {
  try { return JSON.parse(v); } catch { return v; }
}