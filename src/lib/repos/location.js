import { query } from '@/lib/db';

export async function listPickupLocations({ page = 1, perPage = 20, search = '', verified = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(pl.id = ? OR pl.pickup_location LIKE ? OR pl.name LIKE ? OR pl.email LIKE ? OR pl.phone LIKE ? OR pl.city LIKE ? OR pl.pin_code LIKE ? OR u.username LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like, like, like, like, like, like);
  }
  if (verified === '1' || verified === '0') { where.push('pl.status = ?'); params.push(Number(verified)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT pl.id, pl.seller_id, pl.pickup_location, pl.name, pl.email, pl.phone,
              pl.address, pl.address_2, pl.city, pl.state, pl.country, pl.pin_code,
              pl.latitude, pl.longitude, pl.status, pl.date_added,
              u.username AS seller_username,
              sd.store_name AS seller_store
         FROM pickup_locations pl
         LEFT JOIN users u ON u.id = pl.seller_id
         LEFT JOIN seller_data sd ON sd.user_id = pl.seller_id
         ${whereSql}
         ORDER BY pl.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(
      `SELECT COUNT(*) AS c
         FROM pickup_locations pl
         LEFT JOIN users u ON u.id = pl.seller_id
         ${whereSql}`,
      params
    ),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function setPickupLocationStatus(id, status) {
  const r = await query('UPDATE pickup_locations SET status = ? WHERE id = ?', [Number(status), id]);
  return r.affectedRows > 0;
}

export async function deletePickupLocation(id) {
  const r = await query('DELETE FROM pickup_locations WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function listZipcodes({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(z.id = ? OR z.zipcode LIKE ? OR c.name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    const like = `%${search}%`;
    params.push(idGuess, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT z.id, z.zipcode, z.city_id, z.minimum_free_delivery_order_amount, z.delivery_charges, z.date_created,
              c.name AS city_name
         FROM zipcodes z
         LEFT JOIN cities c ON c.id = z.city_id
         ${whereSql}
         ORDER BY z.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM zipcodes z LEFT JOIN cities c ON c.id = z.city_id ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getZipcode(id) {
  const rows = await query('SELECT * FROM zipcodes WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

function validateZipcodeInput(input) {
  const zipcode = String(input.zipcode || '').trim();
  const cityId = Number(input.city || input.city_id || 0);
  const minAmount = Number(input.minimum_free_delivery_order_amount ?? 0);
  const charges = Number(input.delivery_charges ?? 0);
  if (!zipcode) throw new Error('Zipcode is required.');
  if (!cityId) throw new Error('City is required.');
  if (Number.isNaN(minAmount) || minAmount < 0) throw new Error('Minimum free delivery amount must be a non-negative number.');
  if (Number.isNaN(charges) || charges < 0) throw new Error('Delivery charges must be a non-negative number.');
  return { zipcode, cityId, minAmount, charges };
}

export async function createZipcode(input) {
  const { zipcode, cityId, minAmount, charges } = validateZipcodeInput(input);
  const dupe = await query('SELECT id FROM zipcodes WHERE zipcode = ? AND city_id = ? LIMIT 1', [zipcode, cityId]);
  if (dupe.length) throw new Error('This zipcode already exists for the selected city.');
  const r = await query(
    'INSERT INTO zipcodes (zipcode, city_id, minimum_free_delivery_order_amount, delivery_charges) VALUES (?, ?, ?, ?)',
    [zipcode, cityId, minAmount, charges]
  );
  return r.insertId;
}

export async function updateZipcode(id, input) {
  const { zipcode, cityId, minAmount, charges } = validateZipcodeInput(input);
  const dupe = await query('SELECT id FROM zipcodes WHERE zipcode = ? AND city_id = ? AND id != ? LIMIT 1', [zipcode, cityId, id]);
  if (dupe.length) throw new Error('This zipcode already exists for the selected city.');
  const r = await query(
    'UPDATE zipcodes SET zipcode = ?, city_id = ?, minimum_free_delivery_order_amount = ?, delivery_charges = ? WHERE id = ?',
    [zipcode, cityId, minAmount, charges, id]
  );
  return r.affectedRows > 0;
}

export async function deleteZipcode(id) {
  const r = await query('DELETE FROM zipcodes WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function deleteZipcodes(ids = []) {
  const list = ids.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0);
  if (!list.length) return 0;
  const placeholders = list.map(() => '?').join(',');
  const r = await query(`DELETE FROM zipcodes WHERE id IN (${placeholders})`, list);
  return r.affectedRows;
}

export async function listCitiesForSelect() {
  return query('SELECT id, name FROM cities ORDER BY name LIMIT 5000');
}

export async function listCities({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(id = ? OR name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));
  const [rows, countRows] = await Promise.all([
    query(`SELECT id, name, minimum_free_delivery_order_amount, delivery_charges FROM cities ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS c FROM cities ${whereSql}`, params),
  ]);
  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getCity(id) {
  const rows = await query('SELECT * FROM cities WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

function validateCityInput(input) {
  const name = String(input.name || '').trim();
  if (!name) throw new Error('City name is required.');
  const minAmount = Number(input.minimum_free_delivery_order_amount ?? 0);
  const charges = Number(input.delivery_charges ?? 0);
  if (Number.isNaN(minAmount) || minAmount < 0) throw new Error('Minimum free delivery amount must be a non-negative number.');
  if (Number.isNaN(charges) || charges < 0) throw new Error('Delivery charges must be a non-negative number.');
  return { name, minAmount, charges };
}

export async function createCity(input) {
  const { name, minAmount, charges } = validateCityInput(input);
  const dupe = await query('SELECT id FROM cities WHERE name = ? LIMIT 1', [name]);
  if (dupe.length) return Number(dupe[0].id);
  const r = await query(
    'INSERT INTO cities (name, minimum_free_delivery_order_amount, delivery_charges) VALUES (?, ?, ?)',
    [name, minAmount, charges]
  );
  return r.insertId;
}

export async function updateCity(id, input) {
  const { name, minAmount, charges } = validateCityInput(input);
  const dupe = await query('SELECT id FROM cities WHERE name = ? AND id != ? LIMIT 1', [name, id]);
  if (dupe.length) throw new Error('Another city with this name already exists.');
  const r = await query(
    'UPDATE cities SET name = ?, minimum_free_delivery_order_amount = ?, delivery_charges = ? WHERE id = ?',
    [name, minAmount, charges, id]
  );
  return r.affectedRows > 0;
}

export async function deleteCity(id) {
  const r = await query('DELETE FROM cities WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function listZipcodesForSelect() {
  return query(`SELECT z.id, z.zipcode, c.name AS city_name
                  FROM zipcodes z LEFT JOIN cities c ON c.id = z.city_id
                  ORDER BY z.zipcode LIMIT 5000`);
}

export async function listZipcodeGroups({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(zg.id = ? OR zg.group_name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT zg.id, zg.group_name, zg.delivery_charges, zg.created_at,
              GROUP_CONCAT(z.zipcode ORDER BY z.zipcode SEPARATOR ', ') AS zipcodes
         FROM zipcode_groups zg
         LEFT JOIN zipcode_group_items zgi ON zgi.group_id = zg.id
         LEFT JOIN zipcodes z ON z.id = zgi.zipcode_id
         ${whereSql}
         GROUP BY zg.id, zg.group_name, zg.delivery_charges, zg.created_at
         ORDER BY zg.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM zipcode_groups zg ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getZipcodeGroup(id) {
  const rows = await query('SELECT * FROM zipcode_groups WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  const items = await query('SELECT zipcode_id FROM zipcode_group_items WHERE group_id = ?', [id]);
  return { ...rows[0], zipcode_ids: items.map((i) => Number(i.zipcode_id)) };
}

function validateZipcodeGroupInput(input) {
  const name = String(input.group_name || input.name || '').trim();
  if (!name) throw new Error('Group name is required.');
  const charges = Number(input.delivery_charges ?? 0);
  if (Number.isNaN(charges) || charges < 0) throw new Error('Delivery charges must be a non-negative number.');
  const ids = Array.isArray(input.zipcode_ids) ? input.zipcode_ids.map((n) => Number(n)).filter(Boolean) : [];
  if (!ids.length) throw new Error('Select at least one deliverable zipcode.');
  return { name, charges, ids };
}

async function replaceZipcodeGroupItems(groupId, ids) {
  await query('DELETE FROM zipcode_group_items WHERE group_id = ?', [groupId]);
  if (!ids.length) return;
  const values = ids.map(() => '(?, ?, NOW(), NOW())').join(', ');
  const params = ids.flatMap((id) => [groupId, id]);
  await query(`INSERT INTO zipcode_group_items (group_id, zipcode_id, created_at, updated_at) VALUES ${values}`, params);
}

export async function createZipcodeGroup(input) {
  const { name, charges, ids } = validateZipcodeGroupInput(input);
  const dupe = await query('SELECT id FROM zipcode_groups WHERE group_name = ? LIMIT 1', [name]);
  if (dupe.length) throw new Error('A zipcode group with this name already exists.');
  const r = await query(
    'INSERT INTO zipcode_groups (group_name, delivery_charges, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
    [name, charges]
  );
  await replaceZipcodeGroupItems(r.insertId, ids);
  return r.insertId;
}

export async function updateZipcodeGroup(id, input) {
  const { name, charges, ids } = validateZipcodeGroupInput(input);
  const dupe = await query('SELECT id FROM zipcode_groups WHERE group_name = ? AND id != ? LIMIT 1', [name, id]);
  if (dupe.length) throw new Error('Another zipcode group with this name already exists.');
  await query(
    'UPDATE zipcode_groups SET group_name = ?, delivery_charges = ?, updated_at = NOW() WHERE id = ?',
    [name, charges, id]
  );
  await replaceZipcodeGroupItems(id, ids);
  return true;
}

export async function deleteZipcodeGroup(id) {
  await query('DELETE FROM zipcode_group_items WHERE group_id = ?', [id]);
  const r = await query('DELETE FROM zipcode_groups WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function listCityGroups({ page = 1, perPage = 20, search = '' } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(cg.id = ? OR cg.group_name LIKE ?)');
    const idGuess = /^\d+$/.test(search) ? Number(search) : 0;
    params.push(idGuess, `%${search}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = Math.max(0, (Number(page) - 1) * Number(perPage));
  const limit = Math.min(100, Math.max(1, Number(perPage)));

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT cg.id, cg.group_name, cg.delivery_charges, cg.created_at,
              GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ', ') AS cities
         FROM city_groups cg
         LEFT JOIN city_group_items cgi ON cgi.group_id = cg.id
         LEFT JOIN cities c ON c.id = cgi.city_id
         ${whereSql}
         GROUP BY cg.id, cg.group_name, cg.delivery_charges, cg.created_at
         ORDER BY cg.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query(`SELECT COUNT(*) AS c FROM city_groups cg ${whereSql}`, params),
  ]);

  return {
    rows,
    total: Number(countRows[0].c),
    page: Number(page),
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0].c) / limit)),
  };
}

export async function getCityGroup(id) {
  const rows = await query('SELECT * FROM city_groups WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  const items = await query('SELECT city_id FROM city_group_items WHERE group_id = ?', [id]);
  return { ...rows[0], city_ids: items.map((i) => Number(i.city_id)) };
}

function validateCityGroupInput(input) {
  const name = String(input.group_name || input.name || '').trim();
  if (!name) throw new Error('Group name is required.');
  const charges = Number(input.delivery_charges ?? 0);
  if (Number.isNaN(charges) || charges < 0) throw new Error('Delivery charges must be a non-negative number.');
  const ids = Array.isArray(input.city_ids) ? input.city_ids.map((n) => Number(n)).filter(Boolean) : [];
  if (!ids.length) throw new Error('Select at least one deliverable city.');
  return { name, charges, ids };
}

async function replaceCityGroupItems(groupId, ids) {
  await query('DELETE FROM city_group_items WHERE group_id = ?', [groupId]);
  if (!ids.length) return;
  const values = ids.map(() => '(?, ?, NOW(), NOW())').join(', ');
  const params = ids.flatMap((id) => [groupId, id]);
  await query(`INSERT INTO city_group_items (group_id, city_id, created_at, updated_at) VALUES ${values}`, params);
}

export async function createCityGroup(input) {
  const { name, charges, ids } = validateCityGroupInput(input);
  const dupe = await query('SELECT id FROM city_groups WHERE group_name = ? LIMIT 1', [name]);
  if (dupe.length) throw new Error('A cities group with this name already exists.');
  const r = await query(
    'INSERT INTO city_groups (group_name, delivery_charges, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
    [name, charges]
  );
  await replaceCityGroupItems(r.insertId, ids);
  return r.insertId;
}

export async function updateCityGroup(id, input) {
  const { name, charges, ids } = validateCityGroupInput(input);
  const dupe = await query('SELECT id FROM city_groups WHERE group_name = ? AND id != ? LIMIT 1', [name, id]);
  if (dupe.length) throw new Error('Another cities group with this name already exists.');
  await query(
    'UPDATE city_groups SET group_name = ?, delivery_charges = ?, updated_at = NOW() WHERE id = ?',
    [name, charges, id]
  );
  await replaceCityGroupItems(id, ids);
  return true;
}

export async function deleteCityGroup(id) {
  await query('DELETE FROM city_group_items WHERE group_id = ?', [id]);
  const r = await query('DELETE FROM city_groups WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

async function lookupCityIdByName(name) {
  if (!name) return null;
  const rows = await query('SELECT id FROM cities WHERE name = ? LIMIT 1', [name.trim()]);
  return rows[0] ? Number(rows[0].id) : null;
}

export async function bulkInsertZipcodes(rows) {
  let created = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      let cityId = null;
      if (r.city_id) cityId = Number(r.city_id);
      else if (r.city_name) cityId = await lookupCityIdByName(r.city_name);
      if (!cityId) throw new Error(`Unknown city "${r.city_name || r.city_id || ''}".`);
      await createZipcode({
        zipcode: r.zipcode,
        city: cityId,
        minimum_free_delivery_order_amount: r.minimum_free_delivery_order_amount,
        delivery_charges: r.delivery_charges,
      });
      created++;
    } catch (e) {
      errors.push({ row: i + 2, message: e.message });
    }
  }
  return { total: rows.length, created, errors };
}

export async function bulkUpdateZipcodes(rows) {
  let updated = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      const id = Number(r.id);
      if (!id) throw new Error('Missing or invalid id.');
      let cityId = r.city_id ? Number(r.city_id) : null;
      if (!cityId && r.city_name) cityId = await lookupCityIdByName(r.city_name);
      if (!cityId) {
        const existing = await getZipcode(id);
        if (!existing) throw new Error('Zipcode not found.');
        cityId = Number(existing.city_id);
      }
      await updateZipcode(id, {
        zipcode: r.zipcode,
        city: cityId,
        minimum_free_delivery_order_amount: r.minimum_free_delivery_order_amount,
        delivery_charges: r.delivery_charges,
      });
      updated++;
    } catch (e) {
      errors.push({ row: i + 2, message: e.message });
    }
  }
  return { total: rows.length, updated, errors };
}

export async function bulkInsertCities(rows) {
  let created = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      await createCity({
        name: r.name,
        minimum_free_delivery_order_amount: r.minimum_free_delivery_order_amount,
        delivery_charges: r.delivery_charges,
      });
      created++;
    } catch (e) {
      errors.push({ row: i + 2, message: e.message });
    }
  }
  return { total: rows.length, created, errors };
}

export async function bulkUpdateCities(rows) {
  let updated = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      const id = Number(r.id);
      if (!id) throw new Error('Missing or invalid id.');
      await updateCity(id, {
        name: r.name,
        minimum_free_delivery_order_amount: r.minimum_free_delivery_order_amount,
        delivery_charges: r.delivery_charges,
      });
      updated++;
    } catch (e) {
      errors.push({ row: i + 2, message: e.message });
    }
  }
  return { total: rows.length, updated, errors };
}

export async function listAllZipcodesForExport() {
  return query(`SELECT z.id, z.zipcode, z.city_id, c.name AS city_name,
                       z.minimum_free_delivery_order_amount, z.delivery_charges
                  FROM zipcodes z LEFT JOIN cities c ON c.id = z.city_id
                  ORDER BY z.id`);
}

export async function listAllCitiesForExport() {
  return query(`SELECT id, name, minimum_free_delivery_order_amount, delivery_charges
                  FROM cities ORDER BY id`);
}