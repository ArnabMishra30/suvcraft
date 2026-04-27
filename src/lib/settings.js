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

export async function setSetting(variable, value) {
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  const rows = await query('SELECT id FROM settings WHERE variable = ? LIMIT 1', [variable]);
  if (rows.length) {
    await query('UPDATE settings SET value = ? WHERE variable = ?', [v, variable]);
  } else {
    await query('INSERT INTO settings (variable, value) VALUES (?, ?)', [variable, v]);
  }
  clearSettingsCache(variable);
  return true;
}

export async function mergeSetting(variable, partial) {
  const current = (await getSettings(variable)) || {};
  const merged = { ...current, ...partial };
  await setSetting(variable, merged);
  return merged;
}