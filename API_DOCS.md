# E-Commerce API Reference

Reference for client integration (web storefront, mobile app, partner tools) against the Next.js backend in this repo.

---

## 1. Conventions

### Base URL

All endpoints are served by the same Next.js app under `/api/...`. In development this is typically `http://localhost:3000/api/...`. Replace the host as appropriate per environment.

### Authentication

- Session is stored in an **httpOnly cookie** named `session` containing a signed JWT (`{ uid, role }`).
- Cookie attributes: `httpOnly`, `sameSite=lax`, `secure` in production, `path=/`, lifetime 30 days.
- Web clients: cookies are sent automatically (same origin). Use `credentials: 'include'` for cross-origin fetches.
- Mobile clients: persist the `Set-Cookie` value returned by `POST /api/v1/auth/login` and send it back as a `Cookie: session=...` header on subsequent requests, **OR** manage the cookie via a native cookie jar (recommended).
- Roles seen in the system: `admin`, `seller`, `delivery_boy`, `affiliate`, `members` (a.k.a. customer).

### Standard response envelope

Success (HTTP 200):
```json
{ "error": false, "message": "success", "data": { /* payload */ } }
```

Some endpoints add an extra top-level field (e.g. `redirect`, `adminId`) alongside `data`.

Failure (HTTP 4xx/5xx):
```json
{ "error": true, "message": "Human-readable reason", "data": [] }
```

Common status codes:
- `200` — success
- `401` — not authenticated (no/invalid session cookie)
- `403` — authenticated but role not allowed (or account inactive)
- `404` — record not found
- `409` — conflict (duplicate email/mobile, FK constraint)
- `422` — validation error
- `501` — feature not implemented (a few stubs)
- `503` — server config missing (e.g. no admin user configured for chat)

### Content types

- Default request/response is `application/json`.
- File uploads, bulk imports, and the Firebase service-account upload use `multipart/form-data`.
- Sample/template/export endpoints stream `text/csv` with `Content-Disposition: attachment`.

### Pagination

List endpoints (currently only `/api/admin/wallet-transactions` and `/api/admin/media`) accept `page` and `perPage` query params. Most list pages in this app are server-rendered and read directly from the database — there is no public REST list endpoint for resources like products, brands, categories, etc. Mobile/web clients should consume the public storefront APIs (where exposed) or use the admin endpoints below for back-office tooling only.

> ⚠️ The repo currently exposes very few public storefront read APIs (just auth and chat). All product/category/brand/order browsing happens via server-rendered Next.js pages. Mobile clients will need additional public REST endpoints to be added as the storefront API layer grows. The admin endpoints below are **not** intended for end users.

---

## 2. Auth — `/api/v1/auth/*`

### `POST /api/v1/auth/login`
- **Auth:** public
- **Description:** Authenticate by email or mobile + password and set the session cookie.
- **Body:** `{ identity: string, password: string }` — `identity` is email (contains `@`) or mobile.
- **Returns:** `{ user, role, redirect }` plus `Set-Cookie: session=...`. `redirect` is the role-appropriate landing path (`/admin`, `/seller`, `/delivery`, `/affiliate`, `/account`).
- **Errors:** `422` missing fields, `401` wrong credentials, `403` account inactive / role status not approved, "Please verify your email/mobile…" if unverified.

### `POST /api/v1/auth/register`
- **Auth:** public
- **Description:** Register a new customer (`members` role) and set the session cookie.
- **Body:** `{ name: string, email: string, mobile?: string, password: string (min 6), country_code?: number }`
- **Returns:** `{ user, role: 'members', redirect: '/account' }`.
- **Errors:** `422` invalid field, `409` email/mobile already registered.

### `GET /api/v1/auth/me`
- **Auth:** session-required (any role)
- **Description:** Return the currently authenticated user.
- **Returns:** `{ user, role }`.

### `POST /api/v1/auth/logout`
- **Auth:** session-required
- **Description:** Clear the session cookie.

### `POST /api/v1/auth/forgot-password`
- **Auth:** public
- **Description:** Generate a password-reset selector + hashed code and store on the user. Always returns the same generic success message regardless of whether the account exists (avoids account enumeration).
- **Body:** `{ identity: string }` — email or mobile.

> Note: actual reset-token email/SMS delivery is not implemented in this endpoint — it stores the token only.

---

## 3. Storefront chat — `/api/v1/chat/*`

Direct-message channel between any logged-in non-admin user and the admin user.

### `GET /api/v1/chat/messages`
- **Auth:** roles `members` | `seller` | `delivery_boy` | `affiliate`
- **Description:** Fetch messages between the current user and the admin; marks the conversation as read.
- **Query:** `?since=<lastMessageId>` — optional; only returns messages with id > since.
- **Returns:** `{ messages, adminId }`.

### `POST /api/v1/chat/messages`
- **Auth:** roles `members` | `seller` | `delivery_boy` | `affiliate`
- **Description:** Send a message to the admin user.
- **Body:** `{ message: string }`
- **Returns:** `{ id, adminId }`.

---

## 4. Health — `/api/health`

### `GET /api/health`
- **Auth:** public
- **Description:** Liveness probe; verifies DB connectivity.
- **Returns:** `{ status: 'ok', db: { ok: 1 } }` or `500 { status: 'error', message }`.

---

## 5. Admin APIs — `/api/admin/**`

All endpoints in this section require `role=admin`. Unauthorized callers receive `401` (no session) or `403` (wrong role).

### 5.1 Attribute Sets

#### `POST /api/admin/attribute-sets`
- **Body:** `{ name: string, status?: 0|1 }`
- **Description:** Create an attribute set.

#### `GET /api/admin/attribute-sets/list`
- **Description:** Lightweight list (id, name) for selectors/dropdowns.

#### `GET /api/admin/attribute-sets/:id`
- **Description:** Fetch a single attribute set.

#### `PUT /api/admin/attribute-sets/:id`
- **Body:** `{ name: string, status?: 0|1 }`
- **Description:** Update an attribute set.

#### `PATCH /api/admin/attribute-sets/:id`
- **Body:** `{ status: 0|1 }`
- **Description:** Toggle status.

#### `DELETE /api/admin/attribute-sets/:id`
- **Description:** Delete the attribute set.

### 5.2 Attributes

#### `POST /api/admin/attributes`
- **Body:** `{ name: string, attribute_set_id: number, status?: 0|1, values?: string[] }`
- **Description:** Create an attribute and its values.

#### `GET /api/admin/attributes/:id`
- **Description:** Fetch attribute with its values.

#### `PUT /api/admin/attributes/:id`
- **Body:** `{ name: string, attribute_set_id: number, status?: 0|1, values?: string[] }`
- **Description:** Update attribute and replace values.

#### `PATCH /api/admin/attributes/:id`
- **Body:** `{ status: 0|1 }`

#### `DELETE /api/admin/attributes/:id`

### 5.3 Attribute Values

#### `POST /api/admin/attribute-values`
- **Body:** attribute_value fields (`attribute_id`, `value`, `slug`, etc.)

#### `GET /api/admin/attribute-values/:id`

#### `PUT /api/admin/attribute-values/:id`
- **Body:** attribute_value fields.

#### `PATCH /api/admin/attribute-values/:id`
- **Body:** `{ status: 0|1 }`

#### `DELETE /api/admin/attribute-values/:id`

### 5.4 Brands

#### `POST /api/admin/brands`
- **Body:** `{ name: string, image?: string, status?: 0|1 }`

#### `GET /api/admin/brands/:id`

#### `PUT /api/admin/brands/:id`
- **Body:** brand fields.

#### `PATCH /api/admin/brands/:id`
- **Body:** `{ status: 0|1 }`

#### `DELETE /api/admin/brands/:id`

#### `POST /api/admin/brands/bulk-upload`
- **Content-Type:** `multipart/form-data`
- **Body:** FormData `{ file: <csv>, type: 'upload'|'update' }`

#### `GET /api/admin/brands/sample`
- **Query:** `?kind=upload|update`
- **Returns:** CSV template file.

#### `GET /api/admin/brands/export`
- **Returns:** CSV export of all brands.

### 5.5 Categories

#### `GET /api/admin/categories`
- **Description:** Tree-friendly list of all categories.

#### `POST /api/admin/categories`
- **Body:** category fields (`name`, `slug`, `parent_id`, `image`, etc.)

#### `GET /api/admin/categories/:id`

#### `PUT /api/admin/categories/:id`
- **Body:** category fields.

#### `PATCH /api/admin/categories/:id`
- **Body:** `{ status: 0|1 }`

#### `DELETE /api/admin/categories/:id`
- **Errors:** `409` if the category has children or products.

#### `POST /api/admin/categories/order`
- **Body:** `{ items: Array<{ id: number, order: number }> }`
- **Description:** Bulk update sort order.

#### `POST /api/admin/categories/bulk-upload`
- **Content-Type:** `multipart/form-data`
- **Body:** FormData `{ file: <csv>, type: 'upload'|'update' }`

#### `GET /api/admin/categories/sample`
- **Query:** `?kind=upload|update`
- **Returns:** CSV template.

#### `GET /api/admin/categories/export`
- **Returns:** CSV export.

### 5.6 Products

#### `POST /api/admin/products`
- **Body:** full product payload — see `createProduct` in `src/lib/repos/product.js` for the exact shape (includes simple/variant/digital/affiliate types, gallery, attributes, taxes, etc.).

#### `DELETE /api/admin/products/:id`

#### `PATCH /api/admin/products/:id/status`
- **Body:** `{ status: 0|1|2 }`

#### `POST /api/admin/products/bulk-delete`
- **Body:** `{ ids: number[] }`

#### `POST /api/admin/products/bulk-upload`
- **Content-Type:** `multipart/form-data`
- **Body:** FormData `{ file: <csv>, type: 'upload'|'update' }`
- **Notes:** Currently only `simple_product` rows + `type=upload` are supported. `type=update` returns `501`.

#### `PATCH /api/admin/products/affiliate/:id`
- **Body:** `{ is_in_affiliate: 0|1 }`

#### `POST /api/admin/products/affiliate/bulk`
- **Body:** `{ ids: number[], is_in_affiliate: 0|1 }`

### 5.7 Product FAQs

#### `POST /api/admin/product-faqs`
- **Body:** `{ product_id: number, question: string, answer: string }` (user_id/answered_by come from session)

#### `GET /api/admin/product-faqs/:id`

#### `PUT /api/admin/product-faqs/:id`
- **Body:** `{ question: string, answer: string }`

#### `DELETE /api/admin/product-faqs/:id`

### 5.8 Product Ratings

#### `DELETE /api/admin/product-ratings/:id`
- **Description:** Delete a product rating.

### 5.9 Stock

#### `PATCH /api/admin/stock/product/:id`
- **Body:** `{ stock: number }`
- **Description:** Update simple-product stock.

#### `PATCH /api/admin/stock/variant/:id`
- **Body:** `{ stock: number }`
- **Description:** Update variant stock.

### 5.10 Taxes

#### `POST /api/admin/taxes`
- **Body:** `{ title: string, percentage: number, status?: 0|1 }`

#### `GET /api/admin/taxes/:id`

#### `PUT /api/admin/taxes/:id`
- **Body:** `{ title: string, percentage: number, status?: 0|1 }`

#### `PATCH /api/admin/taxes/:id`
- **Body:** `{ status: 0|1 }`

#### `DELETE /api/admin/taxes/:id`

### 5.11 Offers

#### `POST /api/admin/offers`
- **Body:** offer fields (title, type, value, dates, etc.)

#### `GET /api/admin/offers/:id`

#### `PUT /api/admin/offers/:id`

#### `DELETE /api/admin/offers/:id`

### 5.12 Sliders

#### `POST /api/admin/sliders`
- **Body:** slider fields.

#### `GET /api/admin/sliders/:id`

#### `PUT /api/admin/sliders/:id`

#### `DELETE /api/admin/sliders/:id`

### 5.13 Blogs

#### `POST /api/admin/blogs`
- **Body:** blog fields.

#### `GET /api/admin/blogs/:id`

#### `PUT /api/admin/blogs/:id`

#### `PATCH /api/admin/blogs/:id`
- **Body:** `{ status: 0|1 }`

#### `DELETE /api/admin/blogs/:id`

### 5.14 Blog Categories

#### `POST /api/admin/blog-categories`

#### `GET /api/admin/blog-categories/:id`

#### `PUT /api/admin/blog-categories/:id`

#### `PATCH /api/admin/blog-categories/:id`
- **Body:** `{ status: 0|1 }`

#### `DELETE /api/admin/blog-categories/:id`

### 5.15 Customers

#### `GET /api/admin/customers/:id`

#### `PATCH /api/admin/customers/:id`
- **Body:** `{ active: 0|1 }`

#### `DELETE /api/admin/customers/:id`

### 5.16 Sellers

#### `POST /api/admin/sellers`
- **Body:** seller fields.

#### `GET /api/admin/sellers/:id`

#### `PUT /api/admin/sellers/:id`

#### `PATCH /api/admin/sellers/:id`
- **Body:** `{ status: 0|1|2|7 }`

#### `DELETE /api/admin/sellers/:id`

#### `POST /api/admin/sellers/settle-commission`
- **Description:** Settle pending seller commissions. Currently a no-op stub returning `{ settled: 0 }`.

### 5.17 Delivery Boys

#### `POST /api/admin/delivery-boys`

#### `GET /api/admin/delivery-boys/:id`

#### `PUT /api/admin/delivery-boys/:id`

#### `PATCH /api/admin/delivery-boys/:id`
- **Body:** `{ status: 0|1|7 }`

#### `DELETE /api/admin/delivery-boys/:id`

### 5.18 Orders

#### `POST /api/admin/orders/:id/status`
- **Body:** `{ status: string }` — must match an entry in `ORDER_STATUSES`.

#### `POST /api/admin/orders/:id/items/:itemId/status`
- **Body:** `{ status: string }`
- **Description:** Append a status entry to a specific order line item.

#### `POST /api/admin/orders/settle`
- **Body:** `{ kind: 'promo'|'user_cashback'|'referral_cashback' }`
- **Description:** Trigger settlement (currently a no-op stub).

### 5.19 Order Tracking

#### `POST /api/admin/orders/tracking`
- **Body:** `{ order_id: number, tracking_id: string, order_item_id?: number, courier_agency?: string, url?: string }`
- **Description:** Upsert a tracking record.

#### `GET /api/admin/orders/tracking/:id`

#### `PUT /api/admin/orders/tracking/:id`
- **Body:** same as POST.

#### `DELETE /api/admin/orders/tracking/:id`

### 5.20 Pickup Locations

#### `PATCH /api/admin/pickup-locations/:id`
- **Body:** `{ status: 0|1 }`

#### `DELETE /api/admin/pickup-locations/:id`

### 5.21 Return Reasons

#### `POST /api/admin/return-reasons`

#### `GET /api/admin/return-reasons/:id`

#### `PUT /api/admin/return-reasons/:id`

#### `DELETE /api/admin/return-reasons/:id`

### 5.22 Return Requests

#### `PATCH /api/admin/return-requests/:id`
- **Body:** `{ status: 0|1|2|3|4, remarks?: string }`

#### `DELETE /api/admin/return-requests/:id`

### 5.23 Tickets

#### `GET /api/admin/tickets/:id`
- **Description:** Returns ticket plus its messages.

#### `PATCH /api/admin/tickets/:id`
- **Body:** `{ status: number|string }`

#### `DELETE /api/admin/tickets/:id`

#### `POST /api/admin/tickets/:id/messages`
- **Body:** `{ message: string, attachments?: string }`
- **Description:** Admin reply (`user_type='admin'`).

### 5.24 Ticket Types

#### `POST /api/admin/ticket-types`

#### `GET /api/admin/ticket-types/:id`

#### `PUT /api/admin/ticket-types/:id`

#### `DELETE /api/admin/ticket-types/:id`

### 5.25 Time Slots

#### `POST /api/admin/time-slots`

#### `GET /api/admin/time-slots/:id`

#### `PUT /api/admin/time-slots/:id`

#### `DELETE /api/admin/time-slots/:id`

### 5.26 Cities

#### `POST /api/admin/cities`

#### `GET /api/admin/cities/:id`

#### `PUT /api/admin/cities/:id`

#### `DELETE /api/admin/cities/:id`

### 5.27 City Groups

#### `POST /api/admin/city-groups`

#### `GET /api/admin/city-groups/:id`

#### `PUT /api/admin/city-groups/:id`

#### `DELETE /api/admin/city-groups/:id`

### 5.28 Zipcodes

#### `POST /api/admin/zipcodes`
- **Body:** zipcode fields.

#### `DELETE /api/admin/zipcodes`
- **Body:** `{ ids: number[] }`
- **Description:** Bulk delete.

#### `GET /api/admin/zipcodes/:id`

#### `PUT /api/admin/zipcodes/:id`

#### `DELETE /api/admin/zipcodes/:id`

### 5.29 Zipcode Groups

#### `POST /api/admin/zipcode-groups`

#### `GET /api/admin/zipcode-groups/:id`

#### `PUT /api/admin/zipcode-groups/:id`

#### `DELETE /api/admin/zipcode-groups/:id`

### 5.30 Countries

#### `GET /api/admin/countries/download`
- **Returns:** CSV of all countries.

### 5.31 Location Bulk Tools

#### `GET /api/admin/location/templates`
- **Query:** `?kind=zipcode-upload|zipcode-update|zipcode-export|city-upload|city-update|city-export`
- **Returns:** CSV template / export file.

#### `POST /api/admin/location/bulk-upload`
- **Content-Type:** `multipart/form-data`
- **Body:** FormData `{ file: <csv>, type: 'upload'|'update', locationType: 'zipcodes'|'cities' }`

### 5.32 Notifications

#### `POST /api/admin/notifications`
- **Body:** notification fields (title, body, target, etc.)

#### `DELETE /api/admin/notifications/:id`

### 5.33 Custom Notifications

#### `POST /api/admin/custom-notifications`

#### `GET /api/admin/custom-notifications/:id`

#### `PUT /api/admin/custom-notifications/:id`

#### `DELETE /api/admin/custom-notifications/:id`

### 5.34 Custom SMS

#### `POST /api/admin/custom-sms`

#### `GET /api/admin/custom-sms/:id`

#### `PUT /api/admin/custom-sms/:id`

#### `DELETE /api/admin/custom-sms/:id`

### 5.35 System Notifications

#### `PATCH /api/admin/system-notifications/:id`
- **Body:** `{ read_by?: number }` (defaults to `1`)

#### `DELETE /api/admin/system-notifications/:id`

#### `POST /api/admin/system-notifications/mark-all-read`
- **Returns:** `{ updated: <count> }`.

### 5.36 Payment Requests

#### `GET /api/admin/payment-requests/:id`

#### `PATCH /api/admin/payment-requests/:id`
- **Body:** `{ status?: string, remarks?: string }`

### 5.37 Wallet Transactions

#### `GET /api/admin/wallet-transactions`
- **Query:** `?page&perPage&q&status&sellerId`
- **Description:** Paginated list of seller wallet transactions.

### 5.38 Chat (Admin side)

#### `GET /api/admin/chat/conversations`
- **Description:** List conversations the admin participates in.

#### `GET /api/admin/chat/messages`
- **Query:** `?userId=<n>&since=<lastMessageId>`
- **Description:** Fetch messages with a given user; marks read.

#### `POST /api/admin/chat/messages`
- **Body:** `{ toId: number, message: string }`

### 5.39 Media Library

#### `GET /api/admin/media`
- **Query:** `?page&perPage&q&kind&from&to`

#### `DELETE /api/admin/media`
- **Body:** `{ ids: number[] }`
- **Description:** Bulk delete (DB rows + files on disk).

#### `DELETE /api/admin/media/:id`
- **Description:** Delete one media item (DB + file).

### 5.40 Uploads

#### `POST /api/admin/uploads`
- **Content-Type:** `multipart/form-data`
- **Body:** FormData `{ file: <File>, kind?: 'image'|'audio'|'video'|'archive'|'spreadsheet'|'document'|'any' }`
- **Description:** Upload a single file to the media library; auto-detects/validates extension and size; writes to `uploads/<folder>/<year>/`; inserts a media row.
- **Returns:** `{ id, path, url, name, size, type }`.

### 5.41 Settings

All settings endpoints are `PUT` (no GET — current values are loaded server-side from `system_settings` row by Next.js pages).

#### `PUT /api/admin/settings/store`
- **Body:** `{ system_settings?: object, logo?: string, favicon?: string, currency?: string }`

#### `PUT /api/admin/settings/email`
- **Body:** `{ email, password, smtp_host, smtp_port, mail_content_type?: 'html'|'plain', smtp_encryption?: 'ssl'|'tls'|'none' }`

#### `POST /api/admin/settings/smtp-test`
- **Body:** `{ to: string }`
- **Description:** Send a test email using the saved SMTP settings.

#### `PUT /api/admin/settings/payment-methods`
- **Body:** arbitrary payment-method config object (merged into `payment_method` blob).

#### `PUT /api/admin/settings/shipping`
- **Body:** `{ local_shipping_method: 0|1, shiprocket_shipping_method: 0|1, email?: string, password?: string, ... }`

#### `PUT /api/admin/settings/time-slot-config`
- **Body:** `{ is_time_slots_enabled: 0|1, delivery_starts_from: string|number, allowed_days: string|number }`

#### `PUT /api/admin/settings/authentication`
- **Body:** `{ authentication_method: 'firebase'|'custom_sms' }`

#### `PUT /api/admin/settings/firebase`
- **Body:** `{ apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId, measurementId }`

#### `PUT /api/admin/settings/notification-matrix`
- **Body:** arbitrary `send_notification_settings` matrix object.

#### `PUT /api/admin/settings/notifications`
- **Content-Type:** `multipart/form-data`
- **Body:** FormData `{ vap_id_key: string, firebase_project_id: string, service_account_file?: <json> }`
- **Notes:** the JSON file is written to `uploads/firebase/`.

#### `PUT /api/admin/settings/sms-gateway`
- **Body:** `{ base_url, sms_gateway_method, account_sid, auth_token, text_format_data, header_key[], header_value[], body_key[], body_value[], params_key[], params_value[] }`

---

## 6. Client integration notes

### Web (Next.js storefront)

Same-origin requests pick up the session cookie automatically:

```js
const r = await fetch('/api/v1/auth/me');
const { error, data } = await r.json();
```

### Mobile (React Native / Flutter / native)

Cross-origin — explicitly persist the session cookie:

```js
// On login
const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity, password }),
});
const setCookie = res.headers.get('set-cookie'); // store securely

// On every other call
await fetch(`${BASE_URL}/api/v1/auth/me`, {
  headers: { Cookie: storedSessionCookie },
});
```

A cookie jar (e.g. `react-native-cookies`, `dio_cookie_manager`) is strongly recommended over manual header management.

### Multipart uploads

```js
const fd = new FormData();
fd.append('file', file);
fd.append('kind', 'image');
await fetch(`${BASE_URL}/api/admin/uploads`, { method: 'POST', body: fd, credentials: 'include' });
```

Do **not** set `Content-Type` manually — the browser/RN runtime adds the multipart boundary.

### Error handling pattern

```js
const { error, message, data } = await res.json();
if (error || !res.ok) throw new Error(message);
return data;
```

---

## 7. Known gaps / TODO for mobile + web storefront

The current API surface is **admin-heavy** — mobile / customer storefront flows will need additional public endpoints. None of the following exist as REST APIs yet (currently only consumed via Next.js server components):

- Public product listing / search / detail
- Public categories / brands / sliders / banners
- Cart (add / update / remove / list)
- Checkout (addresses, shipping methods, payment, place order)
- Order history / order detail / cancel / return
- Wishlist
- Customer addresses CRUD
- Customer profile update + change password
- Reviews & ratings (write)
- Coupons / offers (apply)
- Wallet balance & transactions (customer-facing)
- Notifications (customer-facing list, mark-read)
- OTP send / verify (the auth backend supports `firebase` / `custom_sms` modes but no REST endpoints exist for OTP flows yet)

These should be added under `/api/v1/...` following the same response envelope and cookie-session pattern.
