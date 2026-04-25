import { requireRole } from '@/lib/auth/require';
import { listAllZipcodesForExport, listAllCitiesForExport } from '@/lib/repos/location';

const esc = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function toCsv(headers, rows) {
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(r.map(esc).join(','));
  return lines.join('\n') + '\n';
}

function csvResponse(filename, body) {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const kind = new URL(req.url).searchParams.get('kind') || '';

  switch (kind) {
    case 'zipcode-upload':
      return csvResponse(
        'zipcode-bulk-upload-template.csv',
        toCsv(
          ['zipcode', 'city_name', 'minimum_free_delivery_order_amount', 'delivery_charges'],
          [['400001', 'Mumbai', '500', '40']]
        )
      );

    case 'zipcode-update':
      return csvResponse(
        'zipcode-bulk-update-template.csv',
        toCsv(
          ['id', 'zipcode', 'city_id', 'city_name', 'minimum_free_delivery_order_amount', 'delivery_charges'],
          [['1', '400001', '1', 'Mumbai', '500', '40']]
        )
      );

    case 'zipcode-export': {
      const rows = await listAllZipcodesForExport();
      return csvResponse(
        'zipcodes.csv',
        toCsv(
          ['id', 'zipcode', 'city_id', 'city_name', 'minimum_free_delivery_order_amount', 'delivery_charges'],
          rows.map((r) => [r.id, r.zipcode, r.city_id, r.city_name, r.minimum_free_delivery_order_amount, r.delivery_charges])
        )
      );
    }

    case 'city-upload':
      return csvResponse(
        'city-bulk-upload-template.csv',
        toCsv(
          ['name', 'minimum_free_delivery_order_amount', 'delivery_charges'],
          [['Mumbai', '500', '40']]
        )
      );

    case 'city-update':
      return csvResponse(
        'city-bulk-update-template.csv',
        toCsv(
          ['id', 'name', 'minimum_free_delivery_order_amount', 'delivery_charges'],
          [['1', 'Mumbai', '500', '40']]
        )
      );

    case 'city-export': {
      const rows = await listAllCitiesForExport();
      return csvResponse(
        'cities.csv',
        toCsv(
          ['id', 'name', 'minimum_free_delivery_order_amount', 'delivery_charges'],
          rows.map((r) => [r.id, r.name, r.minimum_free_delivery_order_amount, r.delivery_charges])
        )
      );
    }

    default:
      return new Response('Unknown template kind', { status: 400 });
  }
}