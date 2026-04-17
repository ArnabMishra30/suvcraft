import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createProduct } from '@/lib/repos/product';
import { csvToObjects } from '@/lib/csv';

export const runtime = 'nodejs';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;

  let fd;
  try { fd = await req.formData(); } catch { return fail('Invalid multipart body.', 400); }

  const file = fd.get('file');
  const type = String(fd.get('type') || 'upload');
  if (!file || typeof file === 'string') return fail('No file uploaded.', 422);
  if (!['upload', 'update'].includes(type)) return fail('Invalid type.', 422);
  if (!/\.csv$/i.test(file.name || '')) return fail('Only .csv files are accepted.', 415);

  const text = new TextDecoder('utf-8').decode(await file.arrayBuffer());
  const rows = csvToObjects(text);
  if (!rows.length) return fail('CSV is empty or has no data rows.', 422);

  if (type === 'update') {
    return fail('Bulk update is not implemented yet — only "upload" is supported in this build.', 501);
  }

  const errors = [];
  let created = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      if ((r.type || r.product_type) && (r.type || r.product_type) !== 'simple_product') {
        errors.push({ row: i + 2, message: `Variable products are not supported via bulk upload yet. Use simple_product.` });
        continue;
      }
      await createProduct({
        name: r.name,
        seller_id: r.seller_id,
        category_id: r.category_id,
        brand: r.brand,
        tax: r.tax || '0',
        type: 'simple_product',
        short_description: r.short_description,
        indicator: r.indicator,
        cod_allowed: ['1', 1, true, 'true', 'yes'].includes(r.cod_allowed),
        minimum_order_quantity: r.minimum_order_quantity || 1,
        quantity_step_size: r.quantity_step_size || 1,
        total_allowed_quantity: r.total_allowed_quantity || null,
        is_prices_inclusive_tax: r.is_prices_inclusive_tax === '1',
        is_returnable: r.is_returnable === '1',
        is_cancelable: r.is_cancelable === '1',
        is_attachment_required: r.is_attachment_required === '1',
        low_stock_limit: r.low_stock_limit || 0,
        image: r.image,
        other_images: r.other_images,
        video_type: r.video_type,
        video: r.video,
        tags: r.tags,
        warranty_period: r.warranty_period,
        guarantee_period: r.guarantee_period,
        made_in: r.made_in,
        hsn_code: r.hsn_code,
        description: r.description,
        extra_description: r.extra_description || 'NULL',
        deliverable_city_type: r.deliverable_city_type || 1,
        deliverable_cities: r.deliverable_cities,
        pickup_location: r.pickup_location,
      });
      created += 1;
    } catch (e) {
      errors.push({ row: i + 2, message: e.message });
    }
  }

  return ok({ created, total: rows.length, errors }, { message: `${created} of ${rows.length} product(s) created.` });
}