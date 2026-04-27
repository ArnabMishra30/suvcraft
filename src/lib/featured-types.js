// Client-safe constants for the Featured Sections page (no DB imports).

export const FEATURED_PRODUCT_TYPES = [
  { value: 'new_added_products', label: 'New Added Products' },
  { value: 'products_on_sale', label: 'Products On Sale' },
  { value: 'top_rated_products', label: 'Top Rated Products' },
  { value: 'most_selling_products', label: 'Most Selling Products' },
  { value: 'custom_products', label: 'Custom Products' },
  { value: 'digital_product', label: 'Digital Product' },
];

export const FEATURED_PRODUCT_TYPE_LABEL = Object.fromEntries(
  FEATURED_PRODUCT_TYPES.map((t) => [t.value, t.label])
);

export const FEATURED_STYLES = [
  { value: 'default', label: 'Default' },
  { value: 'style_1', label: 'Style 1' },
  { value: 'style_2', label: 'Style 2' },
  { value: 'style_3', label: 'Style 3' },
  { value: 'style_4', label: 'Style 4' },
];

export const FEATURED_STYLE_LABEL = Object.fromEntries(
  FEATURED_STYLES.map((t) => [t.value, t.label])
);