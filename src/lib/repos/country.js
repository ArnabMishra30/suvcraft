import { query } from '@/lib/db';

export async function listCountries({ page = 1, perPage = 25, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR name LIKE ? OR iso2 LIKE ? OR iso3 LIKE ? OR numeric_code LIKE ? OR capital LIKE ? OR currency LIKE ? OR currency_name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like, like, like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(500, Math.max(1, Number(perPage)));
  const [rows, countRows] = await Promise.all([
    query(`SELECT id, name, iso2, iso3, numeric_code, phonecode, capital, currency, currency_name, currency_symbol
             FROM countries ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM countries ${whereSql}`, params),
  ]);
  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function listAllCountriesForExport() {
  return query(`SELECT id, numeric_code, name, capital, phonecode, currency, currency_name, currency_symbol, iso2, iso3
                  FROM countries ORDER BY name`);
}