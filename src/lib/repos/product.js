import { query } from '@/lib/db';

export async function listProducts({
  page = 1, perPage = 20, search = '',
  categoryId = '', status = '',
  sellerId = '', brandId = '',
} = {}) {
  const where = [];
  const params = [];

  if (search) {
    where.push('(p.id = ? OR p.name LIKE ? OR p.sku LIKE ? OR p.product_identity LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like);
  }
  if (categoryId) { where.push('p.category_id = ?'); params.push(Number(categoryId)); }
  if (status === '0' || status === '1' || status === '2') { where.push('p.status = ?'); params.push(Number(status)); }
  if (sellerId) { where.push('p.seller_id = ?'); params.push(Number(sellerId)); }
  if (brandId) { where.push('p.brand = ?'); params.push(Number(brandId)); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT p.id, p.name, p.slug, p.image, p.status, p.rating, p.no_of_ratings,
              p.stock, p.availability, p.sku, p.product_identity, p.type, p.row_order,
              c.name AS category_name,
              b.name AS brand_name,
              COALESCE(NULLIF(su.company, ''), su.username) AS seller_name
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         LEFT JOIN brands b ON b.id = p.brand
         LEFT JOIN users su ON su.id = p.seller_id
         ${whereSql}
         ORDER BY p.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM products p ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getProduct(id) {
  const rows = await query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function deleteProducts(ids) {
  if (!ids?.length) return 0;
  const placeholders = ids.map(() => '?').join(',');
  const r = await query(`DELETE FROM products WHERE id IN (${placeholders})`, ids.map(Number));
  return r.affectedRows || 0;
}

export async function setProductStatus(id, status) {
  const r = await query('UPDATE products SET status = ? WHERE id = ?', [Number(status), id]);
  return r.affectedRows > 0;
}

export async function listCategoriesForFilter() {
  return query('SELECT id, name FROM categories WHERE status = 1 ORDER BY name LIMIT 1000');
}

export async function listBrandsForFilter() {
  return query('SELECT id, name FROM brands WHERE status = 1 ORDER BY name LIMIT 1000');
}

export async function listTaxesForForm() {
  return query('SELECT id, title, percentage FROM taxes WHERE status = 1 ORDER BY title LIMIT 500');
}

export async function listCountriesForForm() {
  return query('SELECT name FROM countries ORDER BY name LIMIT 1000');
}

export async function listPickupLocationsForForm() {
  return query('SELECT id, pickup_location FROM pickup_locations WHERE status = 1 ORDER BY pickup_location LIMIT 500');
}

export async function listAllCategoriesForForm() {
  return query('SELECT id, name FROM categories WHERE status = 1 ORDER BY name LIMIT 1000');
}

function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200) || 'product';
}

async function uniqueSlug(base) {
  let slug = base;
  let n = 1;
  while (true) {
    const rows = await query('SELECT id FROM products WHERE slug = ? LIMIT 1', [slug]);
    if (!rows.length) return slug;
    n += 1;
    slug = `${base}-${n}`;
    if (n > 1000) return `${base}-${Date.now()}`;
  }
}

export async function createProduct(input) {
  const name = String(input.name || '').trim();
  if (!name) throw new Error('Product name is required.');
  if (!input.seller_id) throw new Error('Seller is required.');
  if (!input.category_id) throw new Error('Category is required.');

  const slug = await uniqueSlug(slugify(name));
  const image = String(input.image || '').trim();

  const data = {
    product_identity: input.product_identity || null,
    category_id: Number(input.category_id),
    brand: input.brand ? Number(input.brand) : null,
    seller_id: Number(input.seller_id),
    tax: String(input.tax || '0'),
    type: input.type || 'simple_product',
    stock_type: input.stock_type || null,
    name,
    short_description: input.short_description || null,
    slug,
    indicator: input.indicator != null ? Number(input.indicator) : null,
    cod_allowed: input.cod_allowed ? 1 : 0,
    download_allowed: 0,
    minimum_order_quantity: Number(input.minimum_order_quantity || 1),
    quantity_step_size: Number(input.quantity_step_size || 1),
    total_allowed_quantity: input.total_allowed_quantity ? Number(input.total_allowed_quantity) : null,
    is_prices_inclusive_tax: input.is_prices_inclusive_tax ? 1 : 0,
    is_returnable: input.is_returnable ? 1 : 0,
    is_cancelable: input.is_cancelable ? 1 : 0,
    is_attachment_required: input.is_attachment_required ? 1 : 0,
    image,
    other_images: input.other_images || null,
    video_type: input.video_type || null,
    video: input.video || null,
    tags: input.tags || null,
    warranty_period: input.warranty_period || null,
    guarantee_period: input.guarantee_period || null,
    made_in: input.made_in || null,
    hsn_code: input.hsn_code || null,
    sku: input.sku || null,
    description: input.description || null,
    extra_description: input.extra_description || 'NULL',
    deliverable_city_type: Number(input.deliverable_city_type || 1),
    deliverable_cities: input.deliverable_cities || null,
    pickup_location: input.pickup_location ? Number(input.pickup_location) : null,
    status: input.status != null ? Number(input.status) : 1,
    is_in_affiliate: input.is_in_affiliate ? 1 : 0,
    low_stock_limit: Number(input.low_stock_limit || 0),
    seo_page_title: input.seo_page_title || null,
    seo_meta_keywords: input.seo_meta_keywords || null,
    seo_meta_description: input.seo_meta_description || null,
    seo_og_image: input.seo_og_image || null,
  };

  const cols = Object.keys(data);
  const placeholders = cols.map(() => '?').join(', ');
  const values = cols.map((k) => data[k]);

  const r = await query(
    `INSERT INTO products (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${placeholders})`,
    values
  );
  return r.insertId;
}