import { requireRole } from '@/lib/auth/require';

export async function GET(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  const kind = new URL(req.url).searchParams.get('kind') || 'upload';
  const headers = kind === 'update'
    ? ['id', 'name', 'image', 'seo_page_title', 'seo_meta_keywords', 'seo_meta_description', 'seo_og_image']
    : ['name', 'image', 'seo_page_title', 'seo_meta_keywords', 'seo_meta_description', 'seo_og_image'];

  const exampleRow = kind === 'update'
    ? ['1', 'Mobile', 'uploads/media/2024/mobile.jpg', 'Mobiles', 'phones,smartphones', 'Latest mobiles', 'uploads/media/2024/og.jpg']
    : ['Mobile', 'uploads/media/2024/mobile.jpg', 'Mobiles', 'phones,smartphones', 'Latest mobiles', 'uploads/media/2024/og.jpg'];

  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = `${headers.join(',')}\n${exampleRow.map(esc).join(',')}\n`;
  const filename = kind === 'update' ? 'category-bulk-update-sample.csv' : 'category-bulk-upload-sample.csv';
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}