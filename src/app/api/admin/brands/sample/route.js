import { requireRole } from '@/lib/auth/require';

export async function GET(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const kind = new URL(req.url).searchParams.get('kind') || 'upload';
  const headers = kind === 'update' ? ['id', 'name', 'image'] : ['name', 'image'];
  const example = kind === 'update' ? ['1', 'Apple', 'uploads/media/2024/apple.jpg'] : ['Apple', 'uploads/media/2024/apple.jpg'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = `${headers.join(',')}\n${example.map(esc).join(',')}\n`;
  const filename = kind === 'update' ? 'brand-bulk-update-sample.csv' : 'brand-bulk-upload-sample.csv';
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}