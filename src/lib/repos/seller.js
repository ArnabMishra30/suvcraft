import { query, getPool } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

const STATUS_LABELS = { 0: 'Disabled', 1: 'Approved', 2: 'Not Approved', 7: 'Removed' };
export function sellerStatusLabel(s) { return STATUS_LABELS[Number(s)] || '—'; }
export function sellerStatusBadgeClass(s) {
  const n = Number(s);
  if (n === 1) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
  if (n === 2) return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
  if (n === 7) return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

export async function listSellers({ page = 1, perPage = 20, search = '', status = '' } = {}) {
  const where = ['ug.group_id = 4'];
  const params = [];
  if (search) {
    where.push('(u.id = ? OR u.username LIKE ? OR u.email LIKE ? OR u.mobile LIKE ? OR sd.store_name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like, like);
  }
  if (status !== '' && status != null) { where.push('u.status = ?'); params.push(Number(status)); }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT u.id, u.username AS name, u.email, u.mobile, u.address, u.balance, u.status, u.created_on,
              u.latitude, u.longitude,
              sd.store_name, sd.store_url, sd.store_description, sd.logo, sd.rating, sd.no_of_ratings,
              sd.commission, sd.tax_name, sd.tax_number, sd.permissions, sd.id AS seller_data_id,
              sd.category_ids, sd.address_proof
         FROM users u
         JOIN users_groups ug ON ug.user_id = u.id
         LEFT JOIN seller_data sd ON sd.user_id = u.id
         ${whereSql}
         ORDER BY u.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM users u JOIN users_groups ug ON ug.user_id = u.id LEFT JOIN seller_data sd ON sd.user_id = u.id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getSeller(id) {
  const rows = await query(
    `SELECT u.id, u.username, u.email, u.mobile, u.address, u.status, u.balance, u.country_code, u.latitude, u.longitude,
            sd.store_name, sd.store_url, sd.store_description, sd.logo, sd.commission,
            sd.deliverable_city_type, sd.tax_name, sd.tax_number, sd.permissions,
            sd.low_stock_limit, sd.authorized_signature, sd.address_proof,
            sd.seo_page_title, sd.seo_meta_keywords, sd.seo_meta_description, sd.seo_og_image
       FROM users u
       LEFT JOIN seller_data sd ON sd.user_id = u.id
       WHERE u.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

function buildSlug(text) {
  return String(text || '').toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    .substring(0, 200) || 'seller';
}

async function generateReferralCode() {
  const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function syncCategoryCommissions(sellerId, items) {
  if (!Array.isArray(items)) return;
  await replaceSellerCategoryCommissions(sellerId, items);
}

export async function createSeller(input) {
  const username = String(input.name || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const mobile = String(input.mobile || '').trim();
  const password = String(input.password || '');
  if (!username) throw new Error('Name is required.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Valid email is required.');
  if (!mobile) throw new Error('Mobile is required.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  if (input.confirm_password != null && input.confirm_password !== password) throw new Error('Passwords do not match.');

  const dupe = await query('SELECT id FROM users WHERE email = ? OR mobile = ? LIMIT 1', [email, mobile]);
  if (dupe.length) throw new Error('A user with this email or mobile already exists.');

  const hashed = await hashPassword(password);
  const referral = await generateReferralCode();
  const now = Math.floor(Date.now() / 1000);

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.execute(
      `INSERT INTO users (username, password, email, mobile, address, country_code, latitude, longitude, active, status, mobile_verified, email_verified, referral_code, created_on, type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1, 1, ?, ?, 'phone')`,
      [username, hashed, email, mobile, input.address || '', Number(input.country_code || 0), input.latitude || '', input.longitude || '', Number(input.status ?? 2), referral, now]
    );
    const userId = r.insertId;
    await conn.execute('INSERT INTO users_groups (user_id, group_id) VALUES (?, 4)', [userId]);

    const slug = buildSlug(input.store_name || username);
    const permJson = JSON.stringify({
      require_product_approval: input.require_product_approval ? 1 : 0,
      view_customer_details: input.view_customer_details ? 1 : 0,
    });
    await conn.execute(
      `INSERT INTO seller_data
        (user_id, slug, store_name, store_url, store_description, logo, commission,
         deliverable_city_type, tax_name, tax_number, permissions, low_stock_limit,
         authorized_signature, address_proof, status,
         seo_page_title, seo_meta_keywords, seo_meta_description, seo_og_image,
         category_ids, deliverable_zipcode_type, deliverable_zipcodes_group_ids,
         zipcode_delivery_method, deliverable_cities_group_ids, city_delivery_method,
         serviceable_zipcodes, serviceable_cities,
         bank_name, bank_code, account_name, account_number,
         national_identity_card, pan_number)
       VALUES (?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?,
               ?, ?, ?,
               ?, ?, ?, ?,
               '', 1, '',
               1, '', 1,
               '', '',
               '', '', '', '',
               '', '')`,
      [
        userId, slug, input.store_name || username, input.store_url || '', input.store_description || '', input.logo || '',
        Number(input.commission || 0),
        Number(input.deliverable_city_type || 1),
        input.tax_name || '', input.tax_number || '', permJson, Number(input.low_stock_limit || 0),
        input.authorized_signature || '', input.address_proof || '', Number(input.status ?? 2),
        input.seo_page_title || '', input.seo_meta_keywords || '', input.seo_meta_description || '', input.seo_og_image || '',
      ]
    );
    await conn.commit();
    if (Array.isArray(input.category_commissions)) {
      await syncCategoryCommissions(userId, input.category_commissions);
    }
    return userId;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function updateSeller(id, input) {
  const username = String(input.name || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const mobile = String(input.mobile || '').trim();
  if (!username) throw new Error('Name is required.');
  if (!email) throw new Error('Email is required.');
  if (!mobile) throw new Error('Mobile is required.');

  const dupe = await query('SELECT id FROM users WHERE (email = ? OR mobile = ?) AND id != ? LIMIT 1', [email, mobile, id]);
  if (dupe.length) throw new Error('Another user already has this email or mobile.');

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const userFields = ['username = ?', 'email = ?', 'mobile = ?', 'address = ?', 'latitude = ?', 'longitude = ?', 'status = ?'];
    const userParams = [username, email, mobile, input.address || '', input.latitude || '', input.longitude || '', Number(input.status ?? 2)];
    if (input.password) {
      userFields.push('password = ?');
      userParams.push(await hashPassword(input.password));
    }
    userParams.push(id);
    await conn.execute(`UPDATE users SET ${userFields.join(', ')} WHERE id = ?`, userParams);

    const permJson = JSON.stringify({
      require_product_approval: input.require_product_approval ? 1 : 0,
      view_customer_details: input.view_customer_details ? 1 : 0,
    });
    const slug = buildSlug(input.store_name || username);
    const exists = await conn.execute('SELECT id FROM seller_data WHERE user_id = ? LIMIT 1', [id]);
    if (exists[0].length) {
      await conn.execute(
        `UPDATE seller_data SET store_name = ?, slug = ?, store_url = ?, store_description = ?, logo = ?,
                commission = ?, deliverable_city_type = ?, tax_name = ?, tax_number = ?, permissions = ?,
                low_stock_limit = ?, authorized_signature = ?, address_proof = ?, status = ?,
                seo_page_title = ?, seo_meta_keywords = ?, seo_meta_description = ?, seo_og_image = ?
           WHERE user_id = ?`,
        [
          input.store_name || username, slug, input.store_url || '', input.store_description || '', input.logo || '',
          Number(input.commission || 0), Number(input.deliverable_city_type || 1),
          input.tax_name || '', input.tax_number || '', permJson,
          Number(input.low_stock_limit || 0), input.authorized_signature || '', input.address_proof || '',
          Number(input.status ?? 2),
          input.seo_page_title || '', input.seo_meta_keywords || '', input.seo_meta_description || '', input.seo_og_image || '',
          id,
        ]
      );
    }
    await conn.commit();
    if (Array.isArray(input.category_commissions)) {
      await syncCategoryCommissions(id, input.category_commissions);
    }
    return true;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function deleteSeller(id) {
  const productRows = await query('SELECT COUNT(*) AS c FROM products WHERE seller_id = ?', [id]);
  if (Number(productRows[0].c) > 0) {
    throw new Error(`Cannot delete: ${productRows[0].c} product(s) belong to this seller.`);
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM seller_data WHERE user_id = ?', [id]);
    await conn.execute('DELETE FROM users_groups WHERE user_id = ? AND group_id = 4', [id]);
    await conn.execute('DELETE FROM users WHERE id = ?', [id]);
    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function setSellerStatus(id, status) {
  const r = await query('UPDATE users SET status = ? WHERE id = ?', [Number(status), id]);
  await query('UPDATE seller_data SET status = ? WHERE user_id = ?', [Number(status), id]).catch(() => {});
  return r.affectedRows > 0;
}

export async function getSellerCategoryCommissions(sellerId) {
  return query(
    'SELECT id, category_id, commission FROM seller_commission WHERE seller_id = ? ORDER BY id',
    [sellerId]
  );
}

export async function replaceSellerCategoryCommissions(sellerId, items) {
  await query('DELETE FROM seller_commission WHERE seller_id = ?', [sellerId]);
  for (const it of items) {
    if (!it.category_id) continue;
    await query(
      'INSERT INTO seller_commission (seller_id, category_id, commission) VALUES (?, ?, ?)',
      [sellerId, Number(it.category_id), Number(it.commission || 0)]
    );
  }
}