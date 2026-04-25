import { requireRole } from '@/lib/auth/require';
import { listAllCountriesForExport } from '@/lib/repos/country';

function escape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const rows = await listAllCountriesForExport();
  const headers = ['ID', 'Numeric Code', 'Name', 'Capital', 'Phonecode', 'Currency', 'Currency Name', 'Currency Symbol', 'ISO2', 'ISO3'];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      r.id, r.numeric_code, r.name, r.capital, r.phonecode,
      r.currency, r.currency_name, r.currency_symbol, r.iso2, r.iso3,
    ].map(escape).join(','));
  }
  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="countries.csv"',
    },
  });
}