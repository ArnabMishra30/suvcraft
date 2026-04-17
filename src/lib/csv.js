export function parseCsv(text) {
  const rows = [];
  let cur = [''];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur[cur.length - 1] += '"'; i++; }
        else inQuotes = false;
      } else {
        cur[cur.length - 1] += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') cur.push('');
      else if (c === '\n') { rows.push(cur); cur = ['']; }
      else if (c === '\r') { /* skip */ }
      else cur[cur.length - 1] += c;
    }
  }
  if (cur.length > 1 || cur[0] !== '') rows.push(cur);
  return rows;
}

export function csvToObjects(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim().replace(/\s+/g, '_').toLowerCase());
  return rows.slice(1).filter((r) => r.some((c) => String(c).trim() !== '')).map((r) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[i] ?? ''; });
    return obj;
  });
}