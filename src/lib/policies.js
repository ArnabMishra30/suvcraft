// Catalog of policy "documents" surfaced on the admin Policies hub.
// Each entry maps to one or more rows in the `settings` table.
// `docs` lets us combine related policies (e.g. Privacy + Terms) onto a single page with tabs.

export const POLICIES = [
  {
    slug: 'about-us',
    title: 'About Us',
    description: 'Manage the content for the "About Us" page to share information about your company, mission, and team.',
    docs: [{ key: 'about_us', label: 'About Us' }],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'Edit the customer-facing privacy policy that outlines how user data is collected, used and protected.',
    docs: [
      { key: 'privacy_policy', label: 'Privacy Policy' },
      { key: 'terms_conditions', label: 'Terms & Conditions' },
    ],
  },
  {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    description: 'Define terms related to product delivery, shipping timelines, fees, and logistics.',
    docs: [{ key: 'shipping_policy', label: 'Shipping Policy' }],
  },
  {
    slug: 'return-policy',
    title: 'Return Policy',
    description: 'Configure your rules regarding product returns, exchanges, and refund conditions.',
    docs: [{ key: 'return_policy', label: 'Return Policy' }],
  },
  {
    slug: 'admin-policies',
    title: 'Admin Policies',
    description: 'Set internal policies and privacy rules specifically applicable to admin users.',
    docs: [
      { key: 'admin_privacy_policy', label: 'Privacy Policy' },
      { key: 'admin_terms_conditions', label: 'Terms & Conditions' },
    ],
  },
  {
    slug: 'seller-policies',
    title: 'Seller Policies',
    description: 'Define guidelines, responsibilities, and legal obligations for marketplace sellers.',
    docs: [
      { key: 'seller_privacy_policy', label: 'Privacy Policy' },
      { key: 'seller_terms_conditions', label: 'Terms & Conditions' },
    ],
  },
  {
    slug: 'delivery-boy-policies',
    title: 'Delivery Boy Policies',
    description: 'Manage the terms, conduct guidelines, and operational policies for delivery personnel.',
    docs: [
      { key: 'delivery_boy_privacy_policy', label: 'Privacy Policy' },
      { key: 'delivery_boy_terms_conditions', label: 'Terms & Conditions' },
    ],
  },
  {
    slug: 'affiliate-policies',
    title: 'Affiliate Terms & Policies',
    description: 'Privacy policy and terms shown to affiliate partners during signup and on their dashboard.',
    docs: [
      { key: 'affiliate_privacy_policy', label: 'Privacy Policy' },
      { key: 'affiliate_terms_conditions', label: 'Terms & Conditions' },
    ],
  },
];

export const POLICY_BY_SLUG = Object.fromEntries(POLICIES.map((p) => [p.slug, p]));

const ALLOWED_KEYS = new Set(POLICIES.flatMap((p) => p.docs.map((d) => d.key)));
export function isAllowedPolicyKey(k) {
  return ALLOWED_KEYS.has(String(k || ''));
}