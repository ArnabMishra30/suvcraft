# E-Commerce API Reference

Complete API reference for client integration (web storefront, mobile app, partner tools) against the Next.js backend in this repo.

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Auth](#2-auth)
3. [Storefront Chat](#3-storefront-chat)
4. [Health](#4-health)
5. [Admin — Attributes & Sets](#5-admin--attributes--sets)
6. [Admin — Brands](#6-admin--brands)
7. [Admin — Categories](#7-admin--categories)
8. [Admin — Products](#8-admin--products)
9. [Admin — Product FAQs / Ratings / Stock](#9-admin--product-faqs--ratings--stock)
10. [Admin — Orders & Tracking](#10-admin--orders--tracking)
11. [Admin — Customers / Sellers / Delivery Boys](#11-admin--customers--sellers--delivery-boys)
12. [Admin — Blogs / Sliders / Offers / Taxes](#12-admin--blogs--sliders--offers--taxes)
13. [Admin — Locations (Cities, Zipcodes, Groups, Countries)](#13-admin--locations)
14. [Admin — Time Slots](#14-admin--time-slots)
15. [Admin — Tickets / Returns](#15-admin--tickets--returns)
16. [Admin — Notifications & SMS Templates](#16-admin--notifications--sms-templates)
17. [Admin — System Notifications](#17-admin--system-notifications)
18. [Admin — Payment Requests / Wallet / Pickup Locations](#18-admin--payment-requests--wallet--pickup-locations)
19. [Admin — Chat](#19-admin--chat)
20. [Admin — Media & Uploads](#20-admin--media--uploads)
21. [Admin — Settings](#21-admin--settings)
22. [Client Integration Notes](#22-client-integration-notes)
23. [Known Gaps](#23-known-gaps)

---

## 1. Conventions

### Base URL

All endpoints are served by the same Next.js app under `/api/...`. In development this is typically `http://localhost:3000/api/...`. Replace the host as appropriate per environment.

### Authentication

- Session is stored in an **httpOnly cookie** named `session` containing a signed JWT (`{ uid, role }`).
- Cookie attributes: `httpOnly`, `sameSite=lax`, `secure` in production, `path=/`, lifetime 30 days.
- Web clients: cookies are sent automatically (same origin). Use `credentials: 'include'` for cross-origin fetches.
- Mobile clients: persist the `Set-Cookie` value returned by login and send it as a `Cookie: session=...` header on subsequent requests, OR use a native cookie jar (recommended).
- Roles: `admin`, `seller`, `delivery_boy`, `affiliate`, `members` (a.k.a. customer).

### Standard response envelope

Success (HTTP 200):
```json
{ "error": false, "message": "success", "data": { } }
```

Failure:
```json
{ "error": true, "message": "Human-readable reason", "data": [] }
```

The only endpoint that does NOT use this envelope is `GET /api/health` (returns `{ status, db }` directly).

### Common HTTP status codes

| Code | Meaning |
|---|---|
| 200 | success (also used for some `error:true` validation failures on auth — check `error` flag, not just status) |
| 400 | malformed body |
| 401 | not authenticated |
| 403 | authenticated but role not allowed / account inactive |
| 404 | not found |
| 409 | conflict (duplicate, FK constraint) |
| 415 | unsupported media type (CSV-only endpoint) |
| 422 | validation error |
| 500 | server error |
| 501 | feature not implemented |
| 502 | upstream/SMTP failure |
| 503 | server config missing |

### Content types

- Default request/response: `application/json`.
- File/CSV uploads: `multipart/form-data`.
- Sample/template/export endpoints stream `text/csv` with `Content-Disposition: attachment`.

---

## 2. Auth

### `POST /api/v1/auth/login`

**Request**
- Headers: none (public)
- Body (`application/json`):
  - `identity` (string, required) — email or mobile number
  - `password` (string, required) — plaintext password

```json
{
  "identity": "ramesh@sarvspl.com",
  "password": "S3cret!23"
}
```

**Response — 200**
```json
{
  "error": false,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": 42,
      "username": "Ramesh",
      "email": "ramesh@sarvspl.com",
      "mobile": "9876543210",
      "country_code": 91,
      "referral_code": "K7QH3X9P",
      "active": 1,
      "status": 1,
      "email_verified": 1,
      "mobile_verified": 1,
      "type": "email",
      "created_on": 1714200000
    },
    "role": "admin",
    "redirect": "/admin"
  }
}
```
`user` is the full `users` row minus `password`, `activation_code`, `forgotten_password_code`, `remember_code`, `apikey`. Possible `role` values: `admin`, `seller`, `delivery_boy`, `affiliate`, `members`. Possible `redirect` values: `/admin`, `/seller`, `/delivery`, `/affiliate`, `/account`.

**Errors**
- 422 — `Identity and password are required.`
- 401 — `Incorrect login.`
- 200 with `error:true` — `Please verify your email address before logging in.` / `Please verify your mobile number before logging in.`
- 403 — `Your account is not active.`, `No role assigned to this account.`, `Your account is deactivated.`, `Your account is not yet approved.`, `Your account has been removed by the admin. Contact admin for more information.`, `Account not active.`

---

### `POST /api/v1/auth/register`

**Request**
- Headers: none (public)
- Body (`application/json`):
  - `name` (string, required)
  - `email` (string, required) — must match `[^@\s]+@[^@\s]+\.[^@\s]+`
  - `mobile` (string, optional) — 5–16 digits
  - `password` (string, required) — min length 6
  - `country_code` (string|number, optional) — leading `+` allowed; defaults to `0`

```json
{
  "name": "Ramesh Kumar",
  "email": "ramesh@sarvspl.com",
  "mobile": "9876543210",
  "password": "S3cret!23",
  "country_code": "+91"
}
```

**Response — 200**
```json
{
  "error": false,
  "message": "Registered Successfully",
  "data": {
    "user": {
      "id": 102,
      "username": "Ramesh Kumar",
      "email": "ramesh@sarvspl.com",
      "mobile": "9876543210",
      "country_code": 91,
      "referral_code": "K7QH3X9P",
      "active": 1,
      "email_verified": 0,
      "mobile_verified": 0,
      "type": "email",
      "created_on": 1714200000
    },
    "role": "members",
    "redirect": "/account"
  }
}
```

**Errors**
- 422 — `Name is required.`, `Valid email is required.`, `Mobile number is invalid.`, `Password must be at least 6 characters.`
- 409 — `The email is already registered. Please login.`, `The mobile number is already registered. Please login.`

---

### `GET /api/v1/auth/me`

**Request**
- Headers: `Cookie: session=<jwt>`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "user": {
      "id": 42,
      "username": "Ramesh",
      "email": "ramesh@sarvspl.com",
      "mobile": "9876543210",
      "country_code": 91,
      "active": 1,
      "status": 1,
      "email_verified": 1,
      "mobile_verified": 1,
      "type": "email",
      "created_on": 1714200000
    },
    "role": "admin"
  }
}
```

**Errors**
- 401 — `Not authenticated.`
- 404 — `User not found.`

---

### `POST /api/v1/auth/logout`

**Request**
- Headers: `Cookie: session=<jwt>` (optional — clearing always succeeds)
- Body: none

**Response — 200**
```json
{ "error": false, "message": "Logged out", "data": {} }
```

---

### `POST /api/v1/auth/forgot-password`

**Request**
- Headers: none (public)
- Body (`application/json`):
  - `identity` (string, required) — email or mobile

```json
{ "identity": "ramesh@sarvspl.com" }
```

**Response — 200** (same envelope whether or not the account exists; intentional anti-enumeration)
```json
{
  "error": false,
  "message": "If the account exists, reset instructions have been sent.",
  "data": {}
}
```

**Errors**
- 422 — `Email or mobile is required.`

> Note: this endpoint stores the reset token only — it does NOT send the email/SMS. Delivery hookup is pending.

---

## 3. Storefront Chat

Direct-message channel between any logged-in non-admin user and the admin user.

### `GET /api/v1/chat/messages`

**Request**
- Headers: `Cookie: session=<jwt>`
- Roles allowed: `members`, `seller`, `delivery_boy`, `affiliate`
- Query: `since` (number, optional) — only return messages with `id > since`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "messages": [
      {
        "id": 901,
        "from_id": 1,
        "to_id": 42,
        "is_read": 1,
        "message": "Hi Ramesh, how can I help?",
        "type": "person",
        "media": "",
        "date_created": "2026-04-27 12:30:11"
      }
    ],
    "adminId": 1
  }
}
```

**Errors**
- 401 — `Not authenticated.`
- 403 — `Forbidden.`
- 503 — `No admin user is configured.`

---

### `POST /api/v1/chat/messages`

**Request**
- Headers: `Cookie: session=<jwt>`
- Roles allowed: `members`, `seller`, `delivery_boy`, `affiliate`
- Body (`application/json`):
  - `message` (string, required) — non-empty after trim

```json
{ "message": "Hello, I need help with order #12345" }
```

**Response — 200**
```json
{
  "error": false,
  "message": "Sent.",
  "data": { "id": 902, "adminId": 1 }
}
```

**Errors**
- 401 — `Not authenticated.`
- 403 — `Forbidden.`
- 422 — `Message is required.` / `Send failed.`
- 503 — `No admin user is configured.`

---

## 4. Health

### `GET /api/health`

Public; **not** the standard envelope.

**Response — 200**
```json
{ "status": "ok", "db": { "ok": 1 } }
```

**Response — 500**
```json
{ "status": "error", "message": "ER_ACCESS_DENIED_ERROR: ..." }
```

---

> **All endpoints below this point require `role=admin`.** Unauthorized callers get `401` (no session) or `403 Forbidden.` (wrong role). The `Cookie: session=<jwt>` header is required for every request and is omitted from each block for brevity.

---

## 5. Admin — Attributes & Sets

### `POST /api/admin/attribute-sets`

**Request body:**
- `name` (string, required)
- `status` (0|1, optional, default 1)

```json
{ "name": "Apparel", "status": 1 }
```

**Response — 200**
```json
{ "error": false, "message": "Attribute set created.", "data": { "id": 5 } }
```

**Errors:** 422 `Name is required.` / `Create failed.`

---

### `GET /api/admin/attribute-sets/list`

Lightweight selector list.

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "rows": [
      { "id": 1, "name": "Apparel" },
      { "id": 2, "name": "Electronics" }
    ]
  }
}
```

---

### `GET /api/admin/attribute-sets/:id`

**Response — 200**
```json
{ "error": false, "message": "success", "data": { "id": 5, "name": "Apparel", "status": 1 } }
```

**Errors:** 404 `Not found.`

---

### `PUT /api/admin/attribute-sets/:id`

**Request body:** same as POST.

**Response — 200**
```json
{ "error": false, "message": "Attribute set updated.", "data": {} }
```

**Errors:** 404 `Not found.`; 422 `Name is required.` / `Update failed.`

---

### `PATCH /api/admin/attribute-sets/:id`

**Request body:**
- `status` (0|1 or "0"|"1", required)

```json
{ "status": 1 }
```

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": { "id": 5, "status": 1 } }
```

**Errors:** 404 `Not found.`; 422 `status must be 0 or 1.`

---

### `DELETE /api/admin/attribute-sets/:id`

**Response — 200**
```json
{ "error": false, "message": "Attribute set deleted.", "data": { "id": 5 } }
```

**Errors:** 404 `Not found.`

---

### `POST /api/admin/attributes`

**Request body:**
- `name` (string, required)
- `attribute_set_id` (number, required)
- `status` (0|1, optional, default 1)
- `values` (array, optional) — items: `{ value: string, swatche_type?: number, swatche_value?: string }`

```json
{
  "name": "Color",
  "attribute_set_id": 3,
  "status": 1,
  "values": [
    { "value": "Red",  "swatche_type": 1, "swatche_value": "#ff0000" },
    { "value": "Blue", "swatche_type": 1, "swatche_value": "#0000ff" }
  ]
}
```

**Response — 200**
```json
{ "error": false, "message": "Attribute created.", "data": { "id": 17 } }
```

**Errors:** 422 `Name is required.` / `Attribute set is required.` / `Create failed.`

---

### `GET /api/admin/attributes/:id`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 17,
    "name": "Color",
    "attribute_set_id": 3,
    "status": 1,
    "values": [
      { "id": 51, "value": "Red",  "swatche_type": 1, "swatche_value": "#ff0000" },
      { "id": 52, "value": "Blue", "swatche_type": 1, "swatche_value": "#0000ff" }
    ]
  }
}
```

**Errors:** 404 `Not found.`

---

### `PUT /api/admin/attributes/:id`

**Request body:** same as POST. `values` replaces all existing values.

**Response — 200**
```json
{ "error": false, "message": "Attribute updated.", "data": {} }
```

**Errors:** 404 `Not found.`; 422 `Name is required.` / `Attribute set is required.` / `Update failed.`

---

### `PATCH /api/admin/attributes/:id`

**Request body:** `{ status: 0|1 }`.

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": { "id": 17, "status": 0 } }
```

**Errors:** 404 `Not found.`; 422 `status must be 0 or 1.`

---

### `DELETE /api/admin/attributes/:id`

**Response — 200**
```json
{ "error": false, "message": "Attribute deleted.", "data": { "id": 17 } }
```

**Errors:** 404 `Not found.`

---

### `POST /api/admin/attribute-values`

**Request body:**
- `attribute_id` (number, required)
- `value` (string, required)
- `swatche_type` (number, optional, default 0) — 0=none, 1=color, 2=image
- `swatche_value` (string, optional, default "") — hex color or image path
- `filterable` (0|1, optional, default 1)
- `status` (0|1, optional, default 1)

```json
{
  "attribute_id": 17,
  "value": "Red",
  "swatche_type": 1,
  "swatche_value": "#ff0000",
  "filterable": 1,
  "status": 1
}
```

**Response — 200**
```json
{ "error": false, "message": "Attribute value created.", "data": { "id": 51 } }
```

**Errors:** 422 `Value is required.` / `Attribute is required.` / `Create failed.`

---

### `GET /api/admin/attribute-values/:id`

**Response — 200** (full `attribute_values` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 51,
    "attribute_id": 17,
    "value": "Red",
    "swatche_type": 1,
    "swatche_value": "#ff0000",
    "filterable": 1,
    "status": 1
  }
}
```

**Errors:** 404 `Not found.`

---

### `PUT /api/admin/attribute-values/:id`

**Request body:** same as POST.

**Response — 200**
```json
{ "error": false, "message": "Attribute value updated.", "data": {} }
```

**Errors:** 404 `Not found.`; 422 `Value is required.` / `Attribute is required.` / `Update failed.`

---

### `PATCH /api/admin/attribute-values/:id`

**Request body:** `{ status: 0|1 }`.

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": { "id": 51, "status": 0 } }
```

**Errors:** 404 `Not found.`; 422 `status must be 0 or 1.`

---

### `DELETE /api/admin/attribute-values/:id`

**Response — 200**
```json
{ "error": false, "message": "Attribute value deleted.", "data": { "id": 51 } }
```

**Errors:** 404 `Not found.`

---

## 6. Admin — Brands

### `POST /api/admin/brands`

**Request body:**
- `name` (string, required)
- `image` (string, required) — relative media path
- `status` (0|1, optional, default 1)

```json
{ "name": "Nike", "image": "uploads/media/2024/nike.jpg", "status": 1 }
```

**Response — 200**
```json
{ "error": false, "message": "Brand created.", "data": { "id": 23 } }
```

**Errors:** 422 `Name is required.` / `Main image is required.` / `Create failed.`

---

### `GET /api/admin/brands/:id`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": { "id": 23, "name": "Nike", "slug": "nike", "image": "uploads/media/2024/nike.jpg", "status": 1 }
}
```

**Errors:** 404 `Not found.`

---

### `PUT /api/admin/brands/:id`

**Request body:** same as POST.

**Response — 200**
```json
{ "error": false, "message": "Brand updated.", "data": {} }
```

**Errors:** 404 `Not found.`; 422 `Name is required.` / `Main image is required.` / `Update failed.`

---

### `PATCH /api/admin/brands/:id`

**Request body:** `{ status: 0|1 }`.

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": { "id": 23, "status": 0 } }
```

**Errors:** 404 `Not found.`; 422 `status must be 0 or 1.`

---

### `DELETE /api/admin/brands/:id`

**Response — 200**
```json
{ "error": false, "message": "Brand deleted.", "data": { "id": 23 } }
```

**Errors:** 404 `Not found.`; 409 `Cannot delete: 5 product(s) reference this brand.`

---

### `POST /api/admin/brands/bulk-upload`

**Request body (`multipart/form-data`):**
- `file` (File, required) — `.csv`
- `type` (string, optional, default `upload`) — `upload` or `update`
- `upload` columns: `name, image`
- `update` columns: `id, name, image`

**Response — 200** (upload)
```json
{
  "error": false,
  "message": "8 of 10 brand(s) created.",
  "data": {
    "created": 8,
    "total": 10,
    "errors": [
      { "row": 4, "message": "Name is required." },
      { "row": 7, "message": "Main image is required." }
    ],
    "kind": "upload"
  }
}
```

**Response — 200** (update)
```json
{
  "error": false,
  "message": "9 of 10 brand(s) updated.",
  "data": {
    "updated": 9,
    "total": 10,
    "errors": [{ "row": 5, "message": "id is required" }],
    "kind": "update"
  }
}
```

**Errors:** 400 `Invalid multipart body.`; 415 `Only .csv files are accepted.`; 422 `No file uploaded.` / `Invalid type.` / `CSV is empty.`

---

### `GET /api/admin/brands/sample`

CSV template download.

- Query: `kind` (optional, default `upload`) — `upload` or `update`

**Response — 200**
- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="brand-bulk-upload-sample.csv"` (or `brand-bulk-update-sample.csv`)
- Body (upload):
  ```
  name,image
  "Apple","uploads/media/2024/apple.jpg"
  ```
- Body (update): adds `id` as first column.

---

### `GET /api/admin/brands/export`

CSV export.

**Response — 200**
- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="brands-export.csv"`
- Body columns: `id,name,image`

---

## 7. Admin — Categories

### `GET /api/admin/categories`

Active categories for form dropdowns.

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "categories": [
      { "id": 1, "name": "Mobile" },
      { "id": 2, "name": "Laptop" }
    ]
  }
}
```

---

### `POST /api/admin/categories`

**Request body:**
- `name` (string, required)
- `image` (string, required)
- `parent_id` (number, optional, default 0)
- `banner` (string, optional, default `""`)
- `row_order` (number, optional, default 0)
- `status` (0|1, optional, default 1)
- `is_in_affiliate` (0|1|boolean, optional, default 0)
- `affiliate_commission` (number, optional, default 0)
- `seo_page_title`, `seo_meta_keywords`, `seo_meta_description`, `seo_og_image` (string|null, optional)

```json
{
  "name": "Smartphones",
  "image": "uploads/media/2024/smartphones.jpg",
  "parent_id": 1,
  "banner": "uploads/media/2024/smartphones-banner.jpg",
  "row_order": 10,
  "status": 1,
  "is_in_affiliate": 1,
  "affiliate_commission": 5,
  "seo_page_title": "Buy Smartphones Online",
  "seo_meta_keywords": "smartphones,mobiles,phones",
  "seo_meta_description": "Latest smartphones at best prices.",
  "seo_og_image": "uploads/media/2024/smartphones-og.jpg"
}
```

**Response — 200**
```json
{ "error": false, "message": "Category created.", "data": { "id": 42 } }
```

**Errors:** 422 `Name is required.` / `Main image is required.` / `Create failed.`

---

### `GET /api/admin/categories/:id`

**Response — 200** (full `categories` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 42,
    "name": "Smartphones",
    "slug": "smartphones",
    "parent_id": 1,
    "image": "uploads/media/2024/smartphones.jpg",
    "banner": "uploads/media/2024/smartphones-banner.jpg",
    "row_order": 10,
    "status": 1,
    "is_in_affiliate": 1,
    "affiliate_commission": 5,
    "clicks": 0,
    "seo_page_title": "Buy Smartphones Online",
    "seo_meta_keywords": "smartphones,mobiles,phones",
    "seo_meta_description": "Latest smartphones at best prices.",
    "seo_og_image": "uploads/media/2024/smartphones-og.jpg"
  }
}
```

**Errors:** 404 `Not found.`

---

### `PUT /api/admin/categories/:id`

**Request body:**
- `name` (string, required)
- `image` (string, required)
- `slug` (string, optional) — derived from name if blank
- `parent_id` (number, optional, default 0)
- `status` (0|1, optional, default 1)
- `seo_*` (optional)

**Response — 200**
```json
{ "error": false, "message": "Category updated.", "data": {} }
```

**Errors:** 404 `Not found.`; 422 `Name is required.` / `Main image is required.` / `Update failed.`

---

### `PATCH /api/admin/categories/:id`

**Request body:** `{ status: 0|1 }`.

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": { "id": 42, "status": 0 } }
```

**Errors:** 404 `Not found.`; 422 `status must be 0 or 1.`

---

### `DELETE /api/admin/categories/:id`

**Response — 200**
```json
{ "error": false, "message": "Category deleted.", "data": { "id": 42 } }
```

**Errors:** 404 `Not found.`; 409 `Cannot delete: this category has subcategories. Reassign or delete them first.` / `Cannot delete: 12 product(s) belong to this category.`

---

### `POST /api/admin/categories/order`

**Request body:**
- `items` (array, required) — `[{ id: number, row_order: number }]`

```json
{
  "items": [
    { "id": 1, "row_order": 0 },
    { "id": 2, "row_order": 1 },
    { "id": 42, "row_order": 2 }
  ]
}
```

**Response — 200**
```json
{ "error": false, "message": "3 categories reordered.", "data": { "updated": 3 } }
```

**Errors:** 422 `items array is required.`

---

### `POST /api/admin/categories/bulk-upload`

**Request body (`multipart/form-data`):**
- `file` (File, required) — `.csv`
- `type` (string, optional, default `upload`) — `upload` or `update`
- `upload` columns: `name, image, seo_page_title, seo_meta_keywords, seo_meta_description, seo_og_image`
- `update` columns: `id, name, image, seo_page_title, seo_meta_keywords, seo_meta_description, seo_og_image`

**Response — 200**
```json
{
  "error": false,
  "message": "9 of 10 category(ies) created.",
  "data": {
    "created": 9,
    "total": 10,
    "errors": [{ "row": 4, "message": "Main image is required." }]
  }
}
```

**Errors:** 400 `Invalid multipart body.`; 415 `Only .csv files are accepted.`; 422 `No file uploaded.` / `Invalid type.` / `CSV is empty or has no data rows.`

---

### `GET /api/admin/categories/sample`

CSV template download.
- Query: `kind` (optional, default `upload`) — `upload` or `update`
- `Content-Disposition: attachment; filename="category-bulk-upload-sample.csv"` (or `-update-sample.csv`)

---

### `GET /api/admin/categories/export`

CSV export of all categories. Columns: `id, name, image, seo_page_title, seo_meta_keywords, seo_meta_description, seo_og_image`.

---

## 8. Admin — Products

### `POST /api/admin/products`

**Request body:** the full product payload (inserted into `products` table; see [src/lib/repos/product.js](src/lib/repos/product.js)).

```json
{
  "name": "iPhone 15 Pro",
  "seller_id": 12,
  "category_id": 3,
  "brand": 7,
  "tax": "18",
  "type": "simple_product",
  "stock_type": null,
  "product_identity": "IP15-PRO-001",
  "short_description": "Apple flagship 6.1\" titanium phone.",
  "indicator": 1,
  "cod_allowed": true,
  "minimum_order_quantity": 1,
  "quantity_step_size": 1,
  "total_allowed_quantity": 5,
  "is_prices_inclusive_tax": false,
  "is_returnable": true,
  "is_cancelable": true,
  "is_attachment_required": false,
  "image": "uploads/products/iphone15.jpg",
  "other_images": "uploads/products/iphone15-2.jpg,uploads/products/iphone15-3.jpg",
  "video_type": "youtube",
  "video": "https://youtu.be/abcd",
  "tags": "phone,apple,ios",
  "warranty_period": "1 year",
  "guarantee_period": "",
  "made_in": "USA",
  "hsn_code": "8517",
  "sku": "IPH15PRO",
  "description": "Full HTML description...",
  "extra_description": "",
  "deliverable_city_type": 1,
  "deliverable_cities": "",
  "pickup_location": 4,
  "status": 1,
  "is_in_affiliate": 0,
  "low_stock_limit": 5,
  "seo_page_title": "Buy iPhone 15 Pro",
  "seo_meta_keywords": "iphone, apple",
  "seo_meta_description": "Buy iPhone 15 Pro online.",
  "seo_og_image": "uploads/seo/iphone15.jpg"
}
```

**Response — 200**
```json
{ "error": false, "message": "Product created.", "data": { "id": 482 } }
```

**Errors:** 422 `Product name is required.` / `Seller is required.` / `Category is required.` / `Create failed.`

---

### `DELETE /api/admin/products/:id`

**Response — 200**
```json
{ "error": false, "message": "Product deleted.", "data": { "id": 482 } }
```

**Errors:** 404 `Product not found.`

---

### `PATCH /api/admin/products/:id/status`

**Request body:**
- `status` (number|string, required) — `0` Deactivated, `1` Approved, `2` Not Approved

```json
{ "status": 1 }
```

**Response — 200**
```json
{ "error": false, "message": "Status updated", "data": { "id": 482, "status": 1 } }
```

**Errors:** 422 `Invalid status.`; 404 `Product not found.`

---

### `POST /api/admin/products/bulk-delete`

**Request body:** `{ ids: number[] }`

```json
{ "ids": [482, 483, 510] }
```

**Response — 200**
```json
{ "error": false, "message": "3 product(s) deleted.", "data": { "removed": 3 } }
```

**Errors:** 422 `No products selected.`

---

### `POST /api/admin/products/bulk-upload`

**Request body (`multipart/form-data`):**
- `file` (File, required) — `.csv`. Each row may contain: `name, seller_id, category_id, brand, tax, type` (must be `simple_product`), `short_description, indicator, cod_allowed (1/0/true/yes), minimum_order_quantity, quantity_step_size, total_allowed_quantity, is_prices_inclusive_tax, is_returnable, is_cancelable, is_attachment_required, low_stock_limit, image, other_images, video_type, video, tags, warranty_period, guarantee_period, made_in, hsn_code, description, extra_description, deliverable_city_type, deliverable_cities, pickup_location`.
- `type` (string, optional, default `upload`) — only `upload` is implemented.

**Response — 200**
```json
{
  "error": false,
  "message": "12 of 13 product(s) created.",
  "data": {
    "created": 12,
    "total": 13,
    "errors": [
      { "row": 7, "message": "Variable products are not supported via bulk upload yet. Use simple_product." }
    ]
  }
}
```

**Errors:** 400 `Invalid multipart body.`; 415 `Only .csv files are accepted.`; 422 `No file uploaded.` / `Invalid type.` / `CSV is empty or has no data rows.`; 501 `Bulk update is not implemented yet — only "upload" is supported in this build.`

---

### `PATCH /api/admin/products/affiliate/:id`

**Request body:** `{ is_in_affiliate: 0|1 }`

**Response — 200**
```json
{ "error": false, "message": "Affiliate status updated.", "data": { "id": 482, "is_in_affiliate": 1 } }
```

**Errors:** 422 `is_in_affiliate must be 0 or 1.`; 404 `Product not found.`

---

### `POST /api/admin/products/affiliate/bulk`

**Request body:** `{ ids: number[], is_in_affiliate: 0|1 }`

```json
{ "ids": [482, 483, 510], "is_in_affiliate": 1 }
```

**Response — 200**
```json
{ "error": false, "message": "3 product(s) updated.", "data": { "updated": 3 } }
```

**Errors:** 422 `No products selected.` / `is_in_affiliate must be 0 or 1.`

---

## 9. Admin — Product FAQs / Ratings / Stock

### `POST /api/admin/product-faqs`

**Request body:**
- `product_id` (number, required)
- `question` (string, required, non-empty after trim)
- `answer` (string, optional)

`user_id` and `answered_by` come from the session.

```json
{
  "product_id": 482,
  "question": "Does this come with a charger?",
  "answer": "Yes, a 20W USB-C charger is included."
}
```

**Response — 200**
```json
{ "error": false, "message": "FAQ created.", "data": { "id": 91 } }
```

**Errors:** 422 `Product is required.` / `Question is required.` / `Create failed.`

---

### `GET /api/admin/product-faqs/:id`

**Response — 200** (full `product_faqs` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 91,
    "user_id": 12,
    "seller_id": 4,
    "product_id": 482,
    "votes": 0,
    "question": "Does this come with a charger?",
    "answer": "Yes, a 20W USB-C charger is included.",
    "answered_by": 1,
    "date_added": "2026-04-27 10:15:00"
  }
}
```

**Errors:** 404 `Not found.`

---

### `PUT /api/admin/product-faqs/:id`

**Request body:**
- `question` (string, required)
- `answer` (string, optional)

**Response — 200**
```json
{ "error": false, "message": "FAQ updated.", "data": {} }
```

**Errors:** 404 `Not found.`; 422 `Question is required.` / `Update failed.`

---

### `DELETE /api/admin/product-faqs/:id`

**Response — 200**
```json
{ "error": false, "message": "FAQ deleted.", "data": { "id": 91 } }
```

**Errors:** 404 `Not found.`

---

### `DELETE /api/admin/product-ratings/:id`

**Response — 200**
```json
{ "error": false, "message": "Rating deleted.", "data": { "id": 27 } }
```

**Errors:** 404 `Not found.`

---

### `PATCH /api/admin/stock/product/:id`

**Request body:**
- `stock` (number, required, ≥ 0) — `availability` is set to `1` when `stock > 0`, else `0`

```json
{ "stock": 25 }
```

**Response — 200**
```json
{ "error": false, "message": "Stock updated.", "data": {} }
```

**Errors:** 422 `stock is required.` / `Stock must be a non-negative number.` / `Update failed.`

---

### `PATCH /api/admin/stock/variant/:id`

**Request body:** `{ stock: number }` (≥ 0)

**Response — 200**
```json
{ "error": false, "message": "Stock updated.", "data": {} }
```

**Errors:** same as above.

---

## 10. Admin — Orders & Tracking

### `POST /api/admin/orders/:id/status`

**Request body:**
- `status` (string, required) — one of `received`, `processed`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`, `returned`

```json
{ "status": "shipped" }
```

**Response — 200**
```json
{ "error": false, "message": "Status updated", "data": { "id": 1023, "status": "shipped" } }
```

**Errors:** 422 `Invalid status.`; 500 `Update failed.` / `Unknown status: <status>`

---

### `POST /api/admin/orders/:id/items/:itemId/status`

Append a status entry to a specific order item.

**Request body:** same shape as order status.

```json
{ "status": "delivered" }
```

**Response — 200**
```json
{ "error": false, "message": "Item status updated", "data": { "item_id": 5567, "status": "delivered" } }
```

**Errors:** 422 `Invalid status.`; 500 `Order item not found` / `Update failed.`

---

### `POST /api/admin/orders/settle`

Stub — no-op currently.

**Request body:**
- `kind` (string, required) — `promo`, `user_cashback`, or `referral_cashback`

```json
{ "kind": "promo" }
```

**Response — 200**
```json
{
  "error": false,
  "message": "Settlement triggered (no pending items).",
  "data": { "kind": "promo", "settled": 0 }
}
```

**Errors:** 422 `Invalid settlement kind.`

---

### `POST /api/admin/orders/tracking`

**Request body:**
- `order_id` (number, required)
- `tracking_id` (string, required)
- `order_item_id` (string|number, optional) — empty string if not item-specific
- `courier_agency` (string, optional)
- `url` (string, optional)

```json
{
  "order_id": 1023,
  "order_item_id": "",
  "courier_agency": "BlueDart",
  "tracking_id": "BD123456789IN",
  "url": "https://www.bluedart.com/tracking?awb=BD123456789IN"
}
```

**Response — 200**
```json
{ "error": false, "message": "Tracking saved.", "data": { "id": 318 } }
```

**Errors:** 422 `order_id is required.` / `tracking_id is required.`

---

### `GET /api/admin/orders/tracking/:id`

**Response — 200** (full `order_tracking` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 318,
    "order_id": 1023,
    "order_item_id": "",
    "courier_agency": "BlueDart",
    "tracking_id": "BD123456789IN",
    "url": "https://www.bluedart.com/tracking?awb=BD123456789IN",
    "shiprocket_order_id": 0,
    "shipment_id": 0,
    "pickup_status": 0,
    "status": 0,
    "pickup_scheduled_date": "",
    "pickup_token_number": "",
    "others": "",
    "pickup_generated_date": "",
    "data": "",
    "date": "",
    "manifest_url": "",
    "label_url": "",
    "invoice_url": "",
    "awb_code": null,
    "is_canceled": 0,
    "date_created": "2026-04-27 11:00:00"
  }
}
```

**Errors:** 404 `Tracking entry not found.`

---

### `PUT /api/admin/orders/tracking/:id`

**Request body:** same as POST. Upsert is performed by `(order_id, order_item_id)`.

**Response — 200**
```json
{ "error": false, "message": "Tracking saved.", "data": {} }
```

**Errors:** 422 `order_id is required.` / `tracking_id is required.`

---

### `DELETE /api/admin/orders/tracking/:id`

**Response — 200**
```json
{ "error": false, "message": "Tracking entry deleted.", "data": { "id": 318 } }
```

**Errors:** 404 `Tracking entry not found.`

---

## 11. Admin — Customers / Sellers / Delivery Boys

### `GET /api/admin/customers/:id`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 87,
    "username": "ramesh",
    "email": "ramesh@sarvspl.com",
    "mobile": "9876543210",
    "balance": "150.00",
    "active": 1,
    "status": 1,
    "created_on": 1714112400
  }
}
```

**Errors:** 404 `Not found.`

---

### `PATCH /api/admin/customers/:id`

**Request body:** `{ active: 0|1 }`

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": { "id": 87, "active": 1 } }
```

**Errors:** 422 `active must be 0 or 1.`

---

### `DELETE /api/admin/customers/:id`

Removes customer's group membership, addresses, and `users` row.

**Response — 200**
```json
{ "error": false, "message": "Customer deleted.", "data": { "id": 87 } }
```

---

### `POST /api/admin/sellers`

**Request body:**
- `name` (string, required) — username
- `email` (string, required) — must match basic email regex
- `mobile` (string, required)
- `password` (string, required, min 6)
- `confirm_password` (string, optional) — must equal password if provided
- `address`, `country_code`, `latitude`, `longitude` (optional)
- `status` (number, optional, default `2`) — `0`, `1`, `2`, or `7`
- `store_name` (string, optional, defaults to name)
- `store_url`, `store_description`, `logo` (optional)
- `commission` (number, optional)
- `deliverable_city_type` (number, optional, default 1)
- `tax_name`, `tax_number` (optional)
- `low_stock_limit` (number, optional)
- `authorized_signature`, `address_proof` (optional)
- `require_product_approval`, `view_customer_details` (boolean, optional)
- `seo_page_title`, `seo_meta_keywords`, `seo_meta_description`, `seo_og_image` (optional)
- `category_commissions` (array, optional) — `[{ category_id: number, commission: number }]`

```json
{
  "name": "acme_store",
  "email": "owner@acme.com",
  "mobile": "9876543210",
  "password": "secret123",
  "confirm_password": "secret123",
  "address": "12 MG Road",
  "country_code": 91,
  "status": 1,
  "store_name": "Acme Store",
  "store_url": "acme",
  "commission": 10,
  "tax_name": "GST",
  "tax_number": "29ABCDE1234F1Z5",
  "require_product_approval": true,
  "view_customer_details": false,
  "category_commissions": [{ "category_id": 3, "commission": 10 }]
}
```

**Response — 200**
```json
{ "error": false, "message": "Seller created.", "data": { "id": 56 } }
```

**Errors:** 422 `Name is required.` / `Valid email is required.` / `Mobile is required.` / `Password must be at least 6 characters.` / `Passwords do not match.` / `Create failed.`; 409 `A user with this email or mobile already exists.`

---

### `GET /api/admin/sellers/:id`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 56,
    "username": "acme_store",
    "email": "owner@acme.com",
    "mobile": "9876543210",
    "address": "12 MG Road",
    "status": 1,
    "balance": "0.00",
    "country_code": 91,
    "latitude": "12.9716",
    "longitude": "77.5946",
    "store_name": "Acme Store",
    "store_url": "acme",
    "store_description": "",
    "logo": "",
    "commission": 10,
    "deliverable_city_type": 1,
    "tax_name": "GST",
    "tax_number": "29ABCDE1234F1Z5",
    "permissions": "{\"require_product_approval\":1,\"view_customer_details\":0}",
    "low_stock_limit": 5,
    "authorized_signature": "",
    "address_proof": "",
    "seo_page_title": "",
    "seo_meta_keywords": "",
    "seo_meta_description": "",
    "seo_og_image": ""
  }
}
```

**Errors:** 404 `Not found.`

---

### `PUT /api/admin/sellers/:id`

**Request body:** same as POST. `password` is optional (re-hashed only when present).

**Response — 200**
```json
{ "error": false, "message": "Seller updated.", "data": {} }
```

**Errors:** 422 `Name is required.` / `Email is required.` / `Mobile is required.` / `Update failed.`; 409 `Another user already has this email or mobile.`

---

### `PATCH /api/admin/sellers/:id`

**Request body:** `{ status: 0|1|2|7 }` — `0` Disabled, `1` Approved, `2` Not Approved, `7` Removed

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": { "id": 56, "status": 1 } }
```

**Errors:** 422 `status must be 0, 1, 2, or 7.`

---

### `DELETE /api/admin/sellers/:id`

**Response — 200**
```json
{ "error": false, "message": "Seller deleted.", "data": { "id": 56 } }
```

**Errors:** 409 `Cannot delete: <n> product(s) belong to this seller.`

---

### `POST /api/admin/sellers/settle-commission`

Stub — no-op.

**Request body:** none.

**Response — 200**
```json
{ "error": false, "message": "No pending commissions found.", "data": { "settled": 0 } }
```

---

### `POST /api/admin/delivery-boys`

**Request body:**
- `name` (string, required) — username
- `email` (string, required)
- `mobile` (string, required)
- `password` (string, required, min 6)
- `confirm_password` (optional)
- `bonus_type` (string, required) — e.g. `fixed` or `percentage`
- `city` (number, required) — city id
- `bonus`, `address`, `area`, `driving_license`, `country_code` (optional)
- `status` (number, optional, default `0`) — `0` Not Approved, `1` Approved, `7` Removed

```json
{
  "name": "rahul_dispatch",
  "email": "rahul@delivery.com",
  "mobile": "9123456780",
  "password": "secret123",
  "confirm_password": "secret123",
  "bonus_type": "fixed",
  "bonus": 50,
  "city": 14,
  "area": "Indiranagar",
  "address": "House 22, 5th Cross",
  "driving_license": "KA0120201234567",
  "country_code": 91,
  "status": 1
}
```

**Response — 200**
```json
{ "error": false, "message": "Delivery boy created.", "data": { "id": 142 } }
```

**Errors:** 422 various `<field> is required.` / `Passwords do not match.` / `Create failed.`; 409 `A user with this email or mobile already exists.`

---

### `GET /api/admin/delivery-boys/:id`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 142,
    "username": "rahul_dispatch",
    "email": "rahul@delivery.com",
    "mobile": "9123456780",
    "address": "House 22, 5th Cross",
    "city": "14",
    "area": "Indiranagar",
    "bonus_type": "fixed",
    "bonus": 50,
    "balance": "0.00",
    "cash_received": "0.00",
    "driving_license": "KA0120201234567",
    "country_code": 91,
    "active": 1,
    "status": 1,
    "created_on": 1714112400,
    "city_name": "Bengaluru"
  }
}
```

**Errors:** 404 `Not found.`

---

### `PUT /api/admin/delivery-boys/:id`

**Request body:** same as POST. `password` optional.

**Response — 200**
```json
{ "error": false, "message": "Delivery boy updated.", "data": {} }
```

---

### `PATCH /api/admin/delivery-boys/:id`

**Request body:** `{ status: 0|1|7 }`

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": { "id": 142, "status": 1 } }
```

**Errors:** 422 `status must be 0, 1, or 7.`

---

### `DELETE /api/admin/delivery-boys/:id`

**Response — 200**
```json
{ "error": false, "message": "Delivery boy deleted.", "data": { "id": 142 } }
```

---

## 12. Admin — Blogs / Sliders / Offers / Taxes

### `POST /api/admin/blogs`

**Request body:**
- `title` (string, required)
- `category_id` (number, required)
- `image` (string, required)
- `description` (string, required)

```json
{
  "title": "Top 10 Summer Recipes",
  "category_id": 3,
  "image": "/uploads/blogs/summer.jpg",
  "description": "<p>Try these refreshing recipes...</p>"
}
```

**Response — 200**
```json
{ "error": false, "message": "Blog added.", "data": { "id": 42 } }
```

**Errors:** 422 `Title is required.` / `Category is required.` / `Main image is required.` / `Description is required.` / `Create failed.`

---

### `GET /api/admin/blogs/:id`

**Response — 200** (full `blogs` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 42,
    "category_id": 3,
    "title": "Top 10 Summer Recipes",
    "description": "<p>Try these refreshing recipes...</p>",
    "image": "/uploads/blogs/summer.jpg",
    "slug": "top-10-summer-recipes",
    "status": 1,
    "date_added": "2026-04-27T10:30:00.000Z"
  }
}
```

**Errors:** 404 `Not found.`

---

### `PUT /api/admin/blogs/:id`

**Request body:** same as POST.

**Response — 200**
```json
{ "error": false, "message": "Blog updated.", "data": {} }
```

---

### `PATCH /api/admin/blogs/:id`

**Request body:** `{ status: 0|1 }`

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": {} }
```

**Errors:** 422 `status is required.`

---

### `DELETE /api/admin/blogs/:id`

**Response — 200**
```json
{ "error": false, "message": "Blog deleted.", "data": { "id": 42 } }
```

---

### `POST /api/admin/blog-categories`

**Request body:**
- `name` (string, required)
- `image` (string, required)
- `banner` (string, optional)

```json
{
  "name": "Recipes",
  "image": "/uploads/blog-categories/recipes.jpg",
  "banner": "/uploads/blog-categories/recipes-banner.jpg"
}
```

**Response — 200**
```json
{ "error": false, "message": "Blog category added.", "data": { "id": 7 } }
```

**Errors:** 422 `Name is required.` / `Main image is required.` / `Create failed.`

---

### `GET /api/admin/blog-categories/:id`

**Response — 200** (full `blog_categories` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 7,
    "name": "Recipes",
    "slug": "recipes",
    "image": "/uploads/blog-categories/recipes.jpg",
    "banner": "/uploads/blog-categories/recipes-banner.jpg",
    "status": 1
  }
}
```

**Errors:** 404 `Not found.`

---

### `PUT /api/admin/blog-categories/:id`

**Request body:** same as POST.

**Response — 200**
```json
{ "error": false, "message": "Blog category updated.", "data": {} }
```

---

### `PATCH /api/admin/blog-categories/:id`

**Request body:** `{ status: 0|1 }`

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": {} }
```

---

### `DELETE /api/admin/blog-categories/:id`

**Response — 200**
```json
{ "error": false, "message": "Blog category deleted.", "data": { "id": 7 } }
```

---

### `POST /api/admin/sliders`

**Request body:**
- `type` (string, required) — `default`, `categories`, `products`, or `sliderurl`
- `image` (string, required)
- `category_id` (required when `type=categories`) — alias `type_id`
- `product_id` (required when `type=products`) — alias `type_id`
- `link` (required when `type=sliderurl`)

```json
{ "type": "products", "image": "/uploads/sliders/sale.jpg", "product_id": 128 }
```

**Response — 200**
```json
{ "error": false, "message": "Slider added.", "data": { "id": 12 } }
```

**Errors:** 422 `Type is required.` / `Slider image is required.` / `Category is required.` / `Product is required.` / `Slider URL is required.` / `Create failed.`

---

### `GET /api/admin/sliders/:id`

**Response — 200** (full `sliders` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 12,
    "type": "products",
    "type_id": 128,
    "link": "",
    "image": "/uploads/sliders/sale.jpg",
    "date_added": "2026-04-27T09:00:00.000Z"
  }
}
```

---

### `PUT /api/admin/sliders/:id`

Same body as POST.

**Response — 200**
```json
{ "error": false, "message": "Slider updated.", "data": {} }
```

---

### `DELETE /api/admin/sliders/:id`

```json
{ "error": false, "message": "Slider deleted.", "data": { "id": 12 } }
```

---

### `POST /api/admin/offers`

**Request body:**
- `type` (string, required) — `default`, `categories`, `products`, `offer_url`
- `image` (string, required)
- `category_id` / `product_id` / `link` — required by type

```json
{ "type": "categories", "image": "/uploads/offers/electronics.jpg", "category_id": 5 }
```

**Response — 200**
```json
{ "error": false, "message": "Offer added.", "data": { "id": 9 } }
```

**Errors:** 422 `Type is required.` / `Offer image is required.` / `Category is required.` / `Product is required.` / `Offer URL is required.` / `Create failed.`

---

### `GET /api/admin/offers/:id`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 9,
    "type": "categories",
    "type_id": 5,
    "link": "",
    "image": "/uploads/offers/electronics.jpg",
    "date_added": "2026-04-27T09:00:00.000Z"
  }
}
```

---

### `PUT /api/admin/offers/:id`

Same body as POST.

**Response — 200**
```json
{ "error": false, "message": "Offer updated.", "data": {} }
```

---

### `DELETE /api/admin/offers/:id`

```json
{ "error": false, "message": "Offer deleted.", "data": { "id": 9 } }
```

---

### `POST /api/admin/taxes`

**Request body:**
- `title` (string, required)
- `percentage` (number/string, required)
- `status` (number, optional, default 1)

```json
{ "title": "GST", "percentage": 18, "status": 1 }
```

**Response — 200**
```json
{ "error": false, "message": "Tax created.", "data": { "id": 4 } }
```

**Errors:** 422 `Title is required.` / `Percentage is required and must be a number.` / `Create failed.`

---

### `GET /api/admin/taxes/:id`

**Response — 200**
```json
{ "error": false, "message": "success", "data": { "id": 4, "title": "GST", "percentage": "18", "status": 1 } }
```

**Errors:** 404 `Not found.`

---

### `PUT /api/admin/taxes/:id`

Same body as POST.

**Response — 200**
```json
{ "error": false, "message": "Tax updated.", "data": {} }
```

**Errors:** 404 `Not found.`; 422 same as POST.

---

### `PATCH /api/admin/taxes/:id`

**Request body:** `{ status: 0|1 }`

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": { "id": 4, "status": 0 } }
```

**Errors:** 422 `status must be 0 or 1.`; 404 `Not found.`

---

### `DELETE /api/admin/taxes/:id`

```json
{ "error": false, "message": "Tax deleted.", "data": { "id": 4 } }
```

**Errors:** 404 `Not found.`

---

## 13. Admin — Locations

### `POST /api/admin/cities`

**Request body:**
- `name` (string, required) — idempotent (returns existing id if name already exists)
- `minimum_free_delivery_order_amount` (number, optional, default 0, ≥ 0)
- `delivery_charges` (number, optional, default 0, ≥ 0)

```json
{ "name": "Mumbai", "minimum_free_delivery_order_amount": 500, "delivery_charges": 40 }
```

**Response — 200**
```json
{ "error": false, "message": "City added.", "data": { "id": 1 } }
```

**Errors:** 422 `City name is required.` / `Minimum free delivery amount must be a non-negative number.` / `Delivery charges must be a non-negative number.` / `Create failed.`

---

### `GET /api/admin/cities/:id`

**Response — 200** (full `cities` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 1,
    "name": "Mumbai",
    "minimum_free_delivery_order_amount": "500.00",
    "delivery_charges": "40.00"
  }
}
```

---

### `PUT /api/admin/cities/:id`

Same body as POST.

**Response — 200**
```json
{ "error": false, "message": "City updated.", "data": {} }
```

**Errors:** also 409 `Another city with this name already exists.`

---

### `DELETE /api/admin/cities/:id`

```json
{ "error": false, "message": "City deleted.", "data": { "id": 1 } }
```

---

### `POST /api/admin/city-groups`

**Request body:**
- `group_name` (string, required) — alias `name`
- `delivery_charges` (number, optional, default 0)
- `city_ids` (number[], required) — at least one

```json
{ "group_name": "Metro Cities", "delivery_charges": 30, "city_ids": [1, 2, 3] }
```

**Response — 200**
```json
{ "error": false, "message": "Cities group added.", "data": { "id": 5 } }
```

**Errors:** 422 `Group name is required.` / `Select at least one deliverable city.` / `Create failed.`; 409 `A cities group with this name already exists.`

---

### `GET /api/admin/city-groups/:id`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 5,
    "group_name": "Metro Cities",
    "delivery_charges": "30.00",
    "created_at": "2026-04-27T09:00:00.000Z",
    "updated_at": "2026-04-27T09:00:00.000Z",
    "city_ids": [1, 2, 3]
  }
}
```

---

### `PUT /api/admin/city-groups/:id`

Same body as POST.

**Response — 200**
```json
{ "error": false, "message": "Cities group updated.", "data": {} }
```

---

### `DELETE /api/admin/city-groups/:id`

```json
{ "error": false, "message": "Cities group deleted.", "data": { "id": 5 } }
```

---

### `POST /api/admin/zipcodes`

**Request body:**
- `zipcode` (string, required)
- `city` (number, required) — alias `city_id`
- `minimum_free_delivery_order_amount` (number, optional, default 0)
- `delivery_charges` (number, optional, default 0)

```json
{
  "zipcode": "400001",
  "city": 1,
  "minimum_free_delivery_order_amount": 500,
  "delivery_charges": 40
}
```

**Response — 200**
```json
{ "error": false, "message": "Zipcode added.", "data": { "id": 21 } }
```

**Errors:** 422 `Zipcode is required.` / `City is required.` / `Create failed.`; 409 `This zipcode already exists for the selected city.`

---

### `DELETE /api/admin/zipcodes`

Bulk delete.

**Request body:** `{ ids: number[] }`

**Response — 200**
```json
{ "error": false, "message": "3 zipcodes deleted.", "data": { "count": 3 } }
```

**Errors:** 422 `No zipcodes selected.`

---

### `GET /api/admin/zipcodes/:id`

**Response — 200** (full `zipcodes` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 21,
    "zipcode": "400001",
    "city_id": 1,
    "minimum_free_delivery_order_amount": "500.00",
    "delivery_charges": "40.00",
    "date_created": "2026-04-27T09:00:00.000Z"
  }
}
```

---

### `PUT /api/admin/zipcodes/:id`

Same body as POST.

**Response — 200**
```json
{ "error": false, "message": "Zipcode updated.", "data": {} }
```

---

### `DELETE /api/admin/zipcodes/:id`

```json
{ "error": false, "message": "success", "data": { "id": 21 } }
```

---

### `POST /api/admin/zipcode-groups`

**Request body:**
- `group_name` (string, required) — alias `name`
- `delivery_charges` (number, optional, default 0)
- `zipcode_ids` (number[], required)

```json
{ "group_name": "South Mumbai", "delivery_charges": 35, "zipcode_ids": [21, 22, 23] }
```

**Response — 200**
```json
{ "error": false, "message": "Zipcode group added.", "data": { "id": 8 } }
```

**Errors:** 422 `Group name is required.` / `Select at least one deliverable zipcode.` / `Create failed.`; 409 `A zipcode group with this name already exists.`

---

### `GET /api/admin/zipcode-groups/:id`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 8,
    "group_name": "South Mumbai",
    "delivery_charges": "35.00",
    "created_at": "2026-04-27T09:00:00.000Z",
    "updated_at": "2026-04-27T09:00:00.000Z",
    "zipcode_ids": [21, 22, 23]
  }
}
```

---

### `PUT /api/admin/zipcode-groups/:id`

Same body as POST.

**Response — 200**
```json
{ "error": false, "message": "Zipcode group updated.", "data": {} }
```

---

### `DELETE /api/admin/zipcode-groups/:id`

```json
{ "error": false, "message": "Zipcode group deleted.", "data": { "id": 8 } }
```

---

### `GET /api/admin/countries/download`

CSV export.

**Response — 200**
- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="countries.csv"`
- Columns: `ID, Numeric Code, Name, Capital, Phonecode, Currency, Currency Name, Currency Symbol, ISO2, ISO3`

```
ID,Numeric Code,Name,Capital,Phonecode,Currency,Currency Name,Currency Symbol,ISO2,ISO3
1,004,Afghanistan,Kabul,93,AFN,Afghan afghani,؋,AF,AFG
```

---

### `GET /api/admin/location/templates`

CSV template / export by kind.

**Query:** `kind` (required) — `zipcode-upload`, `zipcode-update`, `zipcode-export`, `city-upload`, `city-update`, `city-export`

**Response — 200** — CSV file:

| `kind` | filename | columns |
|---|---|---|
| `zipcode-upload` | `zipcode-bulk-upload-template.csv` | `zipcode, city_name, minimum_free_delivery_order_amount, delivery_charges` |
| `zipcode-update` | `zipcode-bulk-update-template.csv` | `id, zipcode, city_id, city_name, minimum_free_delivery_order_amount, delivery_charges` |
| `zipcode-export` | `zipcodes.csv` | same as `zipcode-update` |
| `city-upload` | `city-bulk-upload-template.csv` | `name, minimum_free_delivery_order_amount, delivery_charges` |
| `city-update` | `city-bulk-update-template.csv` | `id, name, minimum_free_delivery_order_amount, delivery_charges` |
| `city-export` | `cities.csv` | same as `city-update` |

**Errors:** 400 `Unknown template kind` (plain text body, not JSON).

---

### `POST /api/admin/location/bulk-upload`

**Request body (`multipart/form-data`):**
- `file` (File, required) — `.csv`
- `type` (string, required) — `upload` or `update`
- `locationType` (string, required) — `zipcodes` or `cities`

**Response — 200**
```json
{
  "error": false,
  "message": "9 of 10 zipcode(s) created.",
  "data": {
    "total": 10,
    "created": 9,
    "errors": [{ "row": 5, "message": "Unknown city \"Atlantis\"." }],
    "kind": "upload",
    "locationType": "zipcodes"
  }
}
```
For `type=update` data has `updated` instead of `created`.

**Errors:** 400 `Invalid multipart body.`; 415 `Only .csv files are accepted.`; 422 `No file uploaded.` / `Type must be upload or update.` / `Location Type must be zipcodes or cities.` / `CSV is empty or has no data rows.`

---

## 14. Admin — Time Slots

### `POST /api/admin/time-slots`

**Request body:**
- `title` (string, required)
- `from_time` (string, required) — `HH:MM` 24-hour
- `to_time` (string, required) — `HH:MM`
- `last_order_time` (string, required) — `HH:MM`
- `status` (number, required) — `0` or `1`

```json
{
  "title": "Morning",
  "from_time": "09:00",
  "to_time": "12:00",
  "last_order_time": "08:30",
  "status": 1
}
```

**Response — 200**
```json
{ "error": false, "message": "Time slot added.", "data": { "id": 3 } }
```

**Errors:** 422 `Title is required.` / `Time must be HH:MM (24-hour).` / `Invalid time value.` / `From, To, and Last Order time are required.` / `Status is required.` / `Create failed.`

---

### `GET /api/admin/time-slots/:id`

**Response — 200** (full `time_slots` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 3,
    "title": "Morning",
    "from_time": "09:00:00",
    "to_time": "12:00:00",
    "last_order_time": "08:30:00",
    "status": 1
  }
}
```

---

### `PUT /api/admin/time-slots/:id`

Same body as POST.

**Response — 200**
```json
{ "error": false, "message": "Time slot updated.", "data": {} }
```

---

### `DELETE /api/admin/time-slots/:id`

```json
{ "error": false, "message": "Time slot deleted.", "data": { "id": 3 } }
```

---

## 15. Admin — Tickets / Returns

### `GET /api/admin/tickets/:id`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "ticket": {
      "id": 42,
      "ticket_type_id": 3,
      "user_id": 17,
      "subject": "Order not delivered",
      "email": "buyer@example.com",
      "description": "My order #1024 never arrived.",
      "status": 2,
      "last_updated": "2026-04-25 14:32:10",
      "date_created": "2026-04-22 09:11:08",
      "ticket_type_title": "Delivery Issue",
      "user_name": "ramesh",
      "user_email": "buyer@example.com"
    },
    "messages": [
      {
        "id": 88,
        "user_type": "customer",
        "user_id": 17,
        "message": "Any update?",
        "attachments": "",
        "date_created": "2026-04-23 10:00:00",
        "user_name": "ramesh"
      }
    ]
  }
}
```

**Errors:** 404 `Not found.`

---

### `PATCH /api/admin/tickets/:id`

**Request body:**
- `status` (number, required) — `1` Pending, `2` Opened, `3` Resolved, `4` Closed, `5` Reopened

```json
{ "status": 3 }
```

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": {} }
```

**Errors:** 422 `status is required.` / `Invalid status.` / `Update failed.`

---

### `DELETE /api/admin/tickets/:id`

```json
{ "error": false, "message": "Ticket deleted.", "data": { "id": 42 } }
```

---

### `POST /api/admin/tickets/:id/messages`

**Request body:**
- `message` (string, required, non-empty after trim)
- `attachments` (string, optional) — comma-separated paths

```json
{
  "message": "Your refund has been initiated.",
  "attachments": "uploads/media/2026/refund-receipt.pdf"
}
```

**Response — 200**
```json
{ "error": false, "message": "Reply sent.", "data": {} }
```

**Errors:** 422 `Message is required.` / `Send failed.`

---

### `POST /api/admin/ticket-types`

**Request body:**
- `title` (string, required, unique)

```json
{ "title": "Refund Request" }
```

**Response — 200**
```json
{ "error": false, "message": "Ticket type added.", "data": { "id": 7 } }
```

**Errors:** 422 `Title is required.` / `Create failed.`; 409 `A ticket type with this title already exists.`

---

### `GET /api/admin/ticket-types/:id`

**Response — 200** (full `ticket_types` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 7,
    "title": "Refund Request",
    "date_created": "2026-04-20 12:00:00"
  }
}
```

**Errors:** 404 `Not found.`

---

### `PUT /api/admin/ticket-types/:id`

**Request body:** same as POST.

**Response — 200**
```json
{ "error": false, "message": "Ticket type updated.", "data": {} }
```

**Errors:** 409 `Another ticket type with this title already exists.`

---

### `DELETE /api/admin/ticket-types/:id`

```json
{ "error": false, "message": "Ticket type deleted.", "data": { "id": 7 } }
```

---

### `POST /api/admin/return-reasons`

**Request body:**
- `return_reason` (string, required)
- `message` (string, optional)
- `image` (string, optional)

```json
{
  "return_reason": "Damaged item",
  "message": "Item arrived broken or scratched.",
  "image": "uploads/media/2026/damaged.png"
}
```

**Response — 200**
```json
{ "error": false, "message": "Return reason created.", "data": { "id": 12 } }
```

**Errors:** 422 `Return reason is required.` / `Create failed.`

---

### `GET /api/admin/return-reasons/:id`

**Response — 200** (full `return_reasons` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 12,
    "return_reason": "Damaged item",
    "message": "Item arrived broken or scratched.",
    "image": "uploads/media/2026/damaged.png",
    "created_at": "2026-04-21 11:14:00",
    "updated_at": "2026-04-25 09:00:00"
  }
}
```

---

### `PUT /api/admin/return-reasons/:id`

**Request body:** same as POST.

**Response — 200**
```json
{ "error": false, "message": "Return reason updated.", "data": {} }
```

---

### `DELETE /api/admin/return-reasons/:id`

```json
{ "error": false, "message": "Return reason deleted.", "data": { "id": 12 } }
```

---

### `PATCH /api/admin/return-requests/:id`

**Request body:**
- `status` (number, required) — `0` Pending, `1` Approved, `2` Rejected, `3` Return Pickedup, `4` Returned
- `remarks` (string, optional)

```json
{ "status": 1, "remarks": "Approved after review." }
```

**Response — 200**
```json
{ "error": false, "message": "Status updated.", "data": { "id": 55, "status": 1 } }
```

**Errors:** 422 `Invalid status.`

---

### `DELETE /api/admin/return-requests/:id`

```json
{ "error": false, "message": "Return request deleted.", "data": { "id": 55 } }
```

---

## 16. Admin — Notifications & SMS Templates

### `POST /api/admin/notifications`

**Request body:**
- `title` (string, required)
- `message` (string, required)
- `type` (string, required) — `default`, `category`, or `product`
- `category_id` (required when `type=category`) — alias `type_id`
- `product_id` (required when `type=product`) — alias `type_id`
- `send_to` (string, optional, default `all`) — `all`, `customer`, `seller`, `delivery_boy`, `affiliate`
- `image` (string, optional)

```json
{
  "title": "Mega Sale This Weekend",
  "message": "Up to 50% off on all electronics.",
  "type": "category",
  "category_id": 4,
  "send_to": "customer",
  "image": "uploads/media/2026/sale-banner.jpg"
}
```

**Response — 200**
```json
{ "error": false, "message": "Notification sent.", "data": { "id": 91 } }
```

**Errors:** 422 `Title is required.` / `Message is required.` / `Type is required.` / `Category is required.` / `Product is required.` / `Send failed.`

---

### `DELETE /api/admin/notifications/:id`

```json
{ "error": false, "message": "Notification deleted.", "data": { "id": 91 } }
```

---

### `POST /api/admin/custom-notifications`

**Request body:**
- `type` (string, required) — one of: `otp`, `place_order`, `seller_place_order`, `ticket_status`, `settle_cashback_discount`, `settle_seller_commission`, `customer_order_received`, `customer_order_processed`, `delivery_boy_order_processed`, `customer_order_shipped`, `customer_order_delivered`, `customer_order_cancelled`, `customer_order_returned`, `delivery_boy_return_order_assign`, `customer_order_returned_request_decline`, `customer_order_returned_request_approved`, `delivery_boy_order_deliver`, `wallet_transaction`, `bank_transfer_receipt_status`, `bank_transfer_proof`
- `title` (string, required)
- `message` (string, required) — placeholders like `{otp}`, `{username}`, `{order_id}` are supported

```json
{
  "type": "place_order",
  "title": "Order Placed",
  "message": "Hi {username}, your order #{order_id} has been placed."
}
```

**Response — 200**
```json
{ "error": false, "message": "Custom message added.", "data": { "id": 6 } }
```

**Errors:** 422 `Type is required.` / `Invalid type.` / `Title is required.` / `Message is required.` / `Create failed.`; 409 `A custom message for this type already exists. Edit it instead.`

---

### `GET /api/admin/custom-notifications/:id`

**Response — 200** (full `custom_notifications` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 6,
    "type": "place_order",
    "title": "Order Placed",
    "message": "Hi {username}, your order #{order_id} has been placed.",
    "date_sent": "2026-04-20 09:00:00"
  }
}
```

---

### `PUT /api/admin/custom-notifications/:id`

**Request body:** same as POST.

**Response — 200**
```json
{ "error": false, "message": "Custom message updated.", "data": {} }
```

**Errors:** 409 `Another custom message already uses this type.`

---

### `DELETE /api/admin/custom-notifications/:id`

```json
{ "error": false, "message": "Custom message deleted.", "data": { "id": 6 } }
```

---

### `POST /api/admin/custom-sms`

**Request body:** same shape as custom-notifications. Type list is the same.

```json
{ "type": "otp", "title": "OTP", "message": "Your OTP is {otp}. Do not share." }
```

**Response — 200**
```json
{ "error": false, "message": "Custom SMS added.", "data": { "id": 4 } }
```

**Errors:** same as custom-notifications, with messages "Custom SMS" instead of "custom message".

---

### `GET /api/admin/custom-sms/:id`

**Response — 200** (full `custom_sms` row)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 4,
    "type": "otp",
    "title": "OTP",
    "message": "Your OTP is {otp}. Do not share.",
    "date_sent": "2026-04-22 16:32:00"
  }
}
```

---

### `PUT /api/admin/custom-sms/:id`

**Request body:** same as POST.

**Response — 200**
```json
{ "error": false, "message": "Custom SMS updated.", "data": {} }
```

---

### `DELETE /api/admin/custom-sms/:id`

```json
{ "error": false, "message": "Custom SMS deleted.", "data": { "id": 4 } }
```

---

## 17. Admin — System Notifications

### `PATCH /api/admin/system-notifications/:id`

**Request body:**
- `read_by` (number, optional, default 1) — `0` unread, `1` read

```json
{ "read_by": 1 }
```

**Response — 200**
```json
{ "error": false, "message": "success", "data": { "id": 33, "read_by": 1 } }
```

**Errors:** 404 `Notification not found.`

---

### `DELETE /api/admin/system-notifications/:id`

```json
{ "error": false, "message": "Notification deleted.", "data": { "id": 33 } }
```

**Errors:** 404 `Notification not found.`

---

### `POST /api/admin/system-notifications/mark-all-read`

**Request body:** none.

**Response — 200**
```json
{ "error": false, "message": "5 notification(s) marked as read.", "data": { "updated": 5 } }
```

---

## 18. Admin — Payment Requests / Wallet / Pickup Locations

### `GET /api/admin/payment-requests/:id`

**Response — 200** (joined row from `payment_requests` + user fields)
```json
{
  "error": false,
  "message": "success",
  "data": {
    "id": 21,
    "user_id": 17,
    "payment_type": "seller",
    "payment_address": "AC: 1234567890 / IFSC: HDFC0001234",
    "amount_requested": 1500,
    "remarks": null,
    "status": 0,
    "date_created": "2026-04-25 10:00:00",
    "username": "ramesh",
    "email": "ramesh@sarvspl.com",
    "mobile": "9999999999"
  }
}
```

**Errors:** 404 `Not found.`

---

### `PATCH /api/admin/payment-requests/:id`

**Request body:**
- `status` (number, required) — `0` Pending, `1` Approved, `2` Rejected
- `remarks` (string, optional)

```json
{ "status": 1, "remarks": "Verified and approved." }
```

**Response — 200**
```json
{ "error": false, "message": "Payment request updated.", "data": {} }
```

**Errors:** 422 `Invalid status.`; 404 `Payment request not found.`; 409 `This request is already approved.` / `This request is already rejected.` / `You cannot approve a request that has been rejected.` / `You cannot reject a request that has been approved.` / `Update failed.`

---

### `GET /api/admin/wallet-transactions`

**Query:**
- `page` (number, optional, default 1)
- `perPage` (number, optional, default 20, max 100)
- `q` (string, optional) — searches id, username, message, type
- `status` (string, optional) — `0` or `1`
- `sellerId` (number, optional)

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "rows": [
      {
        "id": 312,
        "user_id": 17,
        "type": "credit",
        "amount": 1200,
        "message": "Order #1024 commission",
        "status": 1,
        "date_created": "2026-04-25 10:14:00",
        "username": "ramesh",
        "email": "ramesh@sarvspl.com"
      }
    ],
    "total": 87,
    "page": 1,
    "perPage": 20,
    "totalPages": 5
  }
}
```

---

### `PATCH /api/admin/pickup-locations/:id`

**Request body:**
- `status` (number, required) — `0` unverified, `1` verified

```json
{ "status": 1 }
```

**Response — 200**
```json
{ "error": false, "message": "Pickup location updated.", "data": {} }
```

**Errors:** 422 `status is required.`

---

### `DELETE /api/admin/pickup-locations/:id`

```json
{ "error": false, "message": "Pickup location deleted.", "data": { "id": 14 } }
```

---

## 19. Admin — Chat

### `GET /api/admin/chat/conversations`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "conversations": [
      {
        "user_id": 17,
        "user_name": "ramesh",
        "email": "ramesh@sarvspl.com",
        "last_message": "Thanks for the help!",
        "last_at": "2026-04-26 18:42:11",
        "unread_count": 2
      }
    ]
  }
}
```

---

### `GET /api/admin/chat/messages`

**Query:**
- `userId` (number, required) — the other party
- `since` (number, optional)

Marks messages from that user to admin as read.

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "messages": [
      {
        "id": 501,
        "from_id": 17,
        "to_id": 1,
        "is_read": 1,
        "message": "Hello admin",
        "type": "person",
        "media": "",
        "date_created": "2026-04-26 18:30:00"
      }
    ]
  }
}
```

**Errors:** 422 `userId is required.`

---

### `POST /api/admin/chat/messages`

**Request body:**
- `toId` (number, required)
- `message` (string, required)

```json
{ "toId": 17, "message": "Hi, how can I help?" }
```

**Response — 200**
```json
{ "error": false, "message": "Sent.", "data": { "id": 502 } }
```

**Errors:** 422 `toId is required.` / `Message is required.` / `Send failed.`

---

## 20. Admin — Media & Uploads

### `GET /api/admin/media`

**Query:**
- `page` (number, optional, default 1)
- `perPage` (number, optional, default 10, max 100)
- `q` (string, optional) — matches id, name, title
- `kind` (string, optional) — `image`, `audio`, `video`, `archive`, `spreadsheet`, `document`
- `from`, `to` (string, optional) — `YYYY-MM-DD` bounds on `date_created`

**Response — 200**
```json
{
  "error": false,
  "message": "success",
  "data": {
    "rows": [
      {
        "id": 71,
        "seller_id": 0,
        "title": "banner.jpg",
        "name": "banner-1714134000000",
        "extension": "jpg",
        "type": "image",
        "sub_directory": "media/2026",
        "size": "204800",
        "date_created": "2026-04-26 11:00:00",
        "url": "/uploads/media/2026/banner-1714134000000.jpg"
      }
    ],
    "total": 132,
    "page": 1,
    "perPage": 10,
    "totalPages": 14
  }
}
```

---

### `DELETE /api/admin/media`

Bulk delete (DB rows + files on disk).

**Request body:** `{ ids: number[] }`

**Response — 200**
```json
{ "error": false, "message": "3 files deleted.", "data": { "count": 3 } }
```

**Errors:** 422 `No media selected.`

---

### `DELETE /api/admin/media/:id`

```json
{ "error": false, "message": "Media deleted.", "data": { "id": 71 } }
```

**Errors:** 404 `Not found.`

---

### `POST /api/admin/uploads`

Stored under `${UPLOAD_DIR}/<folder>/<year>/<basename>-<timestamp><ext>`.

**Request body (`multipart/form-data`):**
- `file` (File, required)
- `kind` (string, optional) — auto-detected from extension if omitted

Allowed extensions and size limits per kind:

| kind | extensions | max size |
|---|---|---|
| image | jpg, jpeg, png, gif, webp, avif, svg | 10 MB |
| audio | mp3, wav, ogg, m4a, flac, aac | 50 MB |
| video | mp4, webm, ogv, mov, avi, mkv | 200 MB |
| archive | zip, rar, 7z, tar, gz | 200 MB |
| spreadsheet | xls, xlsx, csv, ods | 50 MB |
| document | pdf, doc, docx, txt, odt, rtf, md | 50 MB |
| any | (unrestricted) | 200 MB |

**Response — 200**
```json
{
  "error": false,
  "message": "Uploaded.",
  "data": {
    "id": 71,
    "path": "uploads/media/2026/banner-1714134000000.jpg",
    "url": "/uploads/media/2026/banner-1714134000000.jpg",
    "name": "banner.jpg",
    "size": 204800,
    "type": "image/jpeg"
  }
}
```

**Errors:** 400 `Invalid multipart body.`; 422 `No file uploaded.` / `Unsupported file type <ext>.` / `File too large (max <N>MB).`

---

## 21. Admin — Settings

All settings PUT endpoints accept JSON unless noted; none have GET handlers (settings are loaded server-side by Next.js pages). Many merge their payload into existing settings rather than replacing.

### `PUT /api/admin/settings/store`

**Request body:**
- `system_settings` (object, optional) — merged into existing. Typical keys: `app_name`, `support_number`, `support_email`, `address`, `time_zone`, `low_stock_limit`, `decimal_points`, `online_store_url`, `app_short_description`, `tag_line`, `seo_title`, `seo_description`, `seo_keywords`
- `logo` (string, optional)
- `favicon` (string, optional)
- `currency` (string, optional)

```json
{
  "system_settings": {
    "app_name": "eShop",
    "support_email": "support@eshop.test",
    "low_stock_limit": "5"
  },
  "logo": "uploads/media/2026/logo.png",
  "favicon": "uploads/media/2026/favicon.ico",
  "currency": "INR"
}
```

**Response — 200**
```json
{ "error": false, "message": "Settings updated.", "data": {} }
```

**Errors:** 500 `Update failed.`

---

### `PUT /api/admin/settings/email`

**Request body:**
- `email` (string, required)
- `password` (string, required)
- `smtp_host` (string, required)
- `smtp_port` (string, required, numeric)
- `mail_content_type` (string, optional, default `html`) — `html` or `plain`
- `smtp_encryption` (string, optional, default `ssl`) — `ssl`, `tls`, or `none`

```json
{
  "email": "no-reply@eshop.test",
  "password": "s3cretP@ss",
  "smtp_host": "smtp.eshop.test",
  "smtp_port": "465",
  "mail_content_type": "html",
  "smtp_encryption": "ssl"
}
```

**Response — 200**
```json
{ "error": false, "message": "Email settings updated.", "data": {} }
```

**Errors:** 422 `Valid email address is required.` / `SMTP host is required.` / `SMTP port must be numeric.`

---

### `POST /api/admin/settings/smtp-test`

Sends a test email using saved settings.

**Request body:**
- `to` (string, required)

```json
{ "to": "ramesh@sarvspl.com" }
```

**Response — 200**
```json
{ "error": false, "message": "Test email sent to ramesh@sarvspl.com.", "data": {} }
```

**Errors:** 422 `Valid recipient email is required.` / `Email settings are not configured. Set them under Settings → Email Settings.`; 502 `SMTP test failed: <reason>`; 503 `nodemailer is not installed. Run \`npm i nodemailer\` and restart the server.`

---

### `PUT /api/admin/settings/payment-methods`

Merges arbitrary keys into the `payment_method` settings entry.

**Request body (typical keys, all optional):**
- `cod_payment_method` ("1"|"0"), `cod_minimum_total_order_amount` (string)
- `bank_transfer_payment_method` ("1"|"0"), `bank_account_details` (string)
- `wallet_balance_payment_method` ("1"|"0")
- Per-gateway flag + credentials, e.g.:
  - `paypal_payment_method`, `paypal_username`, `paypal_password`, `paypal_signature`, `paypal_mode`
  - `razorpay_payment_method`, `razorpay_key_id`, `razorpay_secret_key`
  - `stripe_payment_method`, `stripe_publishable_key`, `stripe_secret_key`
  - `paystack_payment_method`, `paystack_secret_key`
  - `flutterwave_payment_method`, `flutterwave_secret_key`
  - `phonepe_payment_method`, `phonepe_merchant_id`, `phonepe_salt_key`, `phonepe_salt_index`, `phonepe_environment`
  - `paytm_payment_method`, `paytm_mid`, `paytm_merchant_key`, `paytm_environment`
  - `myfatoorah_payment_method`, `myfatoorah_api_key`, `myfatoorah_environment`

```json
{
  "cod_payment_method": "1",
  "cod_minimum_total_order_amount": "100",
  "razorpay_payment_method": "1",
  "razorpay_key_id": "rzp_test_xxxxxxxxxx",
  "razorpay_secret_key": "secretxxxxxxxxxxxxxxxxxxx"
}
```

**Response — 200**
```json
{ "error": false, "message": "Payment settings updated.", "data": {} }
```

**Errors:** 400 `Invalid body.`; 500 `Update failed.`

---

### `PUT /api/admin/settings/shipping`

**Request body:**
- `local_shipping_method` (number) — `0` or `1`
- `shiprocket_shipping_method` (number) — `0` or `1`
- `email`, `password` (string, required when `shiprocket_shipping_method=1`)
- Other Shiprocket fields (`pickup_location`, etc.) merged through

```json
{
  "local_shipping_method": 1,
  "shiprocket_shipping_method": 1,
  "email": "shipping@eshop.test",
  "password": "shiprocketP@ss",
  "pickup_location": "Primary Warehouse"
}
```

**Response — 200**
```json
{ "error": false, "message": "Shipping settings updated.", "data": {} }
```

**Errors:** 400 `Invalid body.`; 422 `At least one shipping method (Local or Shiprocket) must be enabled.` / `Shiprocket email is required when Standard shipping is enabled.` / `Shiprocket password is required when Standard shipping is enabled.`; 500 `Update failed.`

---

### `PUT /api/admin/settings/time-slot-config`

**Request body:**
- `is_time_slots_enabled` (number/boolean, required)
- `delivery_starts_from` (string|number, optional, default `"0"`)
- `allowed_days` (string|number, optional, default `"7"`)

```json
{ "is_time_slots_enabled": 1, "delivery_starts_from": "1", "allowed_days": "7" }
```

**Response — 200**
```json
{ "error": false, "message": "Time slot settings updated.", "data": {} }
```

**Errors:** 422 `Delivery Starts From is invalid.` / `Allowed days must be a positive integer.`; 500 `Update failed.`

---

### `PUT /api/admin/settings/authentication`

**Request body:**
- `authentication_method` (string, required) — `firebase` or `custom_sms`

```json
{ "authentication_method": "firebase" }
```

**Response — 200**
```json
{ "error": false, "message": "Authentication settings updated.", "data": {} }
```

**Errors:** 422 `Invalid authentication method.`

---

### `PUT /api/admin/settings/firebase`

All eight fields are required and trimmed.

**Request body:**
- `apiKey`, `authDomain`, `databaseURL`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId` (all string, required)

```json
{
  "apiKey": "AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "authDomain": "eshop-app.firebaseapp.com",
  "databaseURL": "https://eshop-app.firebaseio.com",
  "projectId": "eshop-app",
  "storageBucket": "eshop-app.appspot.com",
  "messagingSenderId": "1234567890",
  "appId": "1:1234567890:web:abcdefabcdefabcdef",
  "measurementId": "G-ABC123XYZ"
}
```

**Response — 200**
```json
{ "error": false, "message": "Firebase settings updated.", "data": {} }
```

**Errors:** 422 `<fieldName> is required.`

---

### `PUT /api/admin/settings/notification-matrix`

Body is saved verbatim under `send_notification_settings`. Shape: `{ <module_key>: { <recipient_key>: 0|1, ... }, ... }`. Module/recipient keys are defined in [src/lib/notification-types.js](src/lib/notification-types.js).

```json
{
  "place_order": {
    "customer": 1,
    "notification_via_sms": 1,
    "notification_via_mail": 1
  },
  "wallet_transaction": {
    "customer": 1,
    "admin": 1,
    "seller": 0,
    "delivery_boy": 0,
    "notification_via_sms": 0,
    "notification_via_mail": 1
  }
}
```

**Response — 200**
```json
{ "error": false, "message": "Notification matrix updated.", "data": {} }
```

**Errors:** 400 `Invalid body.`

---

### `PUT /api/admin/settings/notifications`

The service-account JSON file is uploaded to `${UPLOAD_DIR}/firebase/service-account-<timestamp>.json`.

**Request body (`multipart/form-data`):**
- `vap_id_key` (string, required)
- `firebase_project_id` (string, required)
- `service_account_file` (File, optional, must be `.json`)

**Response — 200**
```json
{ "error": false, "message": "Notification settings updated.", "data": {} }
```

**Errors:** 400 `Invalid multipart body.`; 422 `VAP ID Key is required.` / `Firebase Project ID is required.` / `Service account file must be a .json file.`

---

### `PUT /api/admin/settings/sms-gateway`

Header/body/params arrays are stored as parallel `key[i]` pairs with `value[i]`.

**Request body:**
- `base_url` (string, optional)
- `sms_gateway_method` (string, optional, default `POST`) — uppercased
- `account_sid`, `auth_token` (string, optional)
- `text_format_data` (string, optional) — payload template with placeholders `{only_mobile_number}`, `{mobile_number_with_country_code}`, `{country_code}`, `{message}`, `{otp}`
- `header_key` (string[], optional), `header_value` (string[], optional)
- `body_key` (string[], optional), `body_value` (string[], optional)
- `params_key` (string[], optional), `params_value` (string[], optional)

```json
{
  "base_url": "https://api.smsprovider.test/send",
  "sms_gateway_method": "POST",
  "account_sid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "auth_token": "tokenxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "text_format_data": "{\"to\":\"{mobile_number_with_country_code}\",\"text\":\"{message}\"}",
  "header_key": ["Authorization", "Content-Type"],
  "header_value": ["Bearer tokenxxxxxxxx", "application/json"],
  "body_key": ["from"],
  "body_value": ["eShop"],
  "params_key": [],
  "params_value": []
}
```

**Response — 200**
```json
{ "error": false, "message": "SMS gateway settings updated.", "data": {} }
```

**Errors:** 400 `Invalid body.`

---

## 22. Client Integration Notes

### Web (Next.js storefront, same origin)

```js
const r = await fetch('/api/v1/auth/me');
const { error, data } = await r.json();
```

The browser sends the `session` cookie automatically. For cross-origin web (Vite dev server hitting a different host) use `credentials: 'include'`.

### Mobile (React Native / Flutter / native)

Persist the session cookie via a native cookie jar (recommended), or capture it manually from `Set-Cookie` and re-send as `Cookie`:

```js
const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity, password }),
});
const setCookie = res.headers.get('set-cookie');

await fetch(`${BASE_URL}/api/v1/auth/me`, { headers: { Cookie: storedSessionCookie } });
```

Recommended cookie-jar libs:
- React Native: `@react-native-cookies/cookies`
- Flutter (`dio`): `dio_cookie_manager` + `cookie_jar`
- Axios: `axios-cookiejar-support` + `tough-cookie`

### Multipart upload

```js
const fd = new FormData();
fd.append('file', file);
fd.append('kind', 'image');
const r = await fetch(`${BASE_URL}/api/admin/uploads`, {
  method: 'POST',
  credentials: 'include',
  body: fd,
});
```

Do NOT set `Content-Type` manually — the runtime adds the multipart boundary.

### Standard error pattern

```js
async function call(url, opts) {
  const r = await fetch(url, { credentials: 'include', ...opts });
  const body = await r.json();
  if (body.error) throw new Error(body.message);
  return body.data;
}
```

---

## 23. Known Gaps

The current API surface is admin-heavy. The following storefront/customer-facing endpoints do NOT exist yet — all currently rendered via Next.js server components:

- Public product listing / search / detail
- Public categories / brands / sliders / banners feed
- Cart (add / update / remove / list)
- Checkout (addresses, shipping methods, payment methods, place order)
- Order history / order detail / cancel / return
- Wishlist
- Customer addresses CRUD
- Customer profile update / change password
- Reviews & ratings (write)
- Apply coupon / list active offers (customer-facing)
- Wallet balance & transactions (customer-facing)
- Notifications inbox (customer-facing list, mark-read)
- OTP send / verify (auth supports `firebase` / `custom_sms` modes but no REST flow exists)
- Seller / delivery-boy / affiliate dashboards (no REST equivalents)

Add these under `/api/v1/...` following the same response envelope and cookie-session pattern when building out the mobile app.
