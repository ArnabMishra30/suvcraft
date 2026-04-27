// Client-safe catalog of admin modules and the CRUD actions each one supports.
// Mirrors the legacy CI3 config['system_modules'] so the JSON stored in
// user_permissions.permissions stays compatible with the older PHP admin.

export const SYSTEM_MODULES = [
  { key: 'orders', label: 'Orders', actions: ['read', 'update', 'delete'] },
  { key: 'profile', label: 'Profile', actions: ['read', 'update', 'delete'] },
  { key: 'categories', label: 'Categories', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'brands', label: 'Brands', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'category_order', label: 'Category Order', actions: ['read', 'update'] },
  { key: 'product', label: 'Products', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'media', label: 'Media', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'product_order', label: 'Product Order', actions: ['read', 'update'] },
  { key: 'tax', label: 'Tax', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'attribute', label: 'Attributes', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'attribute_set', label: 'Attribute Sets', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'attribute_value', label: 'Attribute Values', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'home_slider_images', label: 'Home Slider Images', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'new_offer_images', label: 'New Offer Images', actions: ['create', 'read', 'delete'] },
  { key: 'promo_code', label: 'Promo Codes', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'featured_section', label: 'Featured Sections', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'customers', label: 'Customers', actions: ['read', 'update'] },
  { key: 'return_request', label: 'Return Requests', actions: ['read', 'update'] },
  { key: 'delivery_boy', label: 'Delivery Boys', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'fund_transfer', label: 'Fund Transfer', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'send_notification', label: 'Send Notification', actions: ['create', 'read', 'delete'] },
  { key: 'notification_setting', label: 'Notification Settings', actions: ['read', 'update'] },
  { key: 'sms-gateway-settings', label: 'SMS Gateway Settings', actions: ['read', 'update'] },
  { key: 'client_api_keys', label: 'Client API Keys', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'area', label: 'Areas', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'city', label: 'Cities', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'faq', label: 'FAQ', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'zipcodes', label: 'Zipcodes', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'support_tickets', label: 'Support Tickets', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'settings', label: 'Settings', actions: ['read', 'update'] },
  { key: 'affiliate_system', label: 'Affiliate System', actions: ['read'] },
  { key: 'affiliate_settings', label: 'Affiliate Settings', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'affiliate_users', label: 'Affiliate Users', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'system_update', label: 'System Update', actions: ['update'] },
  { key: 'seller', label: 'Sellers', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'shipping_settings', label: 'Shipping Settings', actions: ['read', 'update'] },
  { key: 'pickup_location', label: 'Pickup Location', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'chat', label: 'Chat', actions: ['create', 'read', 'delete'] },
  { key: 'system_user', label: 'System Users', actions: ['create', 'read', 'update', 'delete'] },
];

export const SYSTEM_ROLES = [
  { value: 0, label: 'Super Admin', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
  { value: 1, label: 'Admin', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
  { value: 2, label: 'Editor', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  { value: 3, label: 'Supporter', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
];

export const ROLE_LABEL = Object.fromEntries(SYSTEM_ROLES.map((r) => [r.value, r.label]));
export const ROLE_CLASS = Object.fromEntries(SYSTEM_ROLES.map((r) => [r.value, r.cls]));

// Drop unknown modules / unsupported actions before saving so the JSON stays clean.
export function sanitizePermissions(input) {
  if (!input || typeof input !== 'object') return {};
  const out = {};
  for (const mod of SYSTEM_MODULES) {
    const raw = input[mod.key];
    if (!Array.isArray(raw)) continue;
    const filtered = raw.filter((a) => mod.actions.includes(a));
    if (filtered.length) out[mod.key] = filtered;
  }
  return out;
}