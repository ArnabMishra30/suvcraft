'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
  {
    label: 'Orders',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    children: [
      { href: '/admin/orders', label: 'All Orders' },
      { href: '/admin/orders/tracking', label: 'Order Tracking' },
      { href: '/admin/system-notifications', label: 'System Notifications' },
    ],
  },
  {
    label: 'Products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    children: [
      { href: '/admin/products', label: 'Manage Products' },
      { href: '/admin/products/new', label: 'Add Product' },
      { href: '/admin/products/bulk-upload', label: 'Bulk Upload' },
      { href: '/admin/products/affiliate', label: 'Product Affiliate' },
      { href: '/admin/products/attribute-sets', label: 'Attribute Sets' },
      { href: '/admin/products/attributes', label: 'Attributes' },
      { href: '/admin/products/attribute-values', label: 'Attribute Values' },
      { href: '/admin/products/tax', label: 'Tax' },
      { href: '/admin/products/faqs', label: 'Product FAQs' },
      { href: '/admin/products/ratings', label: 'Product Ratings' },
    ],
  },
  {
    label: 'Categories',
    icon: 'M4 6h16M4 12h16M4 18h7',
    children: [
      { href: '/admin/categories', label: 'Manage Categories' },
      { href: '/admin/categories/order', label: 'Category Order' },
      { href: '/admin/categories/bulk-upload', label: 'Bulk Upload' },
    ],
  },
  {
    label: 'Brands',
    icon: 'M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z',
    children: [
      { href: '/admin/brands', label: 'Manage Brands' },
      { href: '/admin/brands/bulk-upload', label: 'Bulk Upload' },
    ],
  },
  {
    label: 'Customers',
    icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z',
    children: [
      { href: '/admin/customers', label: 'View Customers' },
      { href: '/admin/customers/addresses', label: 'Addresses' },
      { href: '/admin/customers/transactions', label: 'Transactions' },
      { href: '/admin/customers/wallet', label: 'Wallet Transactions' },
    ],
  },
  {
    label: 'Sellers',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    children: [
      { href: '/admin/sellers', label: 'Manage Sellers' },
      { href: '/admin/sellers/wallet', label: 'Wallet Transactions' },
    ],
  },
  {
    label: 'Return Requests',
    icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
    children: [
      { href: '/admin/return-requests', label: 'Manage Return Requests' },
      { href: '/admin/return-requests/reasons', label: 'Reasons For Return' },
    ],
  },
  {
    label: 'Delivery Boys',
    icon: 'M3 8l4-4 4 4M7 4v12m0 0l4 4 4-4m6-12v12',
    children: [
      { href: '/admin/delivery-boys', label: 'Manage Delivery Boys' },
      { href: '/admin/delivery-boys/cash-collection', label: 'Manage Cash Collection' },
      { href: '/admin/delivery-boys/fund-transfer', label: 'Fund Transfer' },
    ],
  },
  {
    label: 'Location',
    icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
    children: [
      { href: '/admin/location/pickup-locations', label: 'Pickup Locations' },
      { href: '/admin/location/zipcodes', label: 'Zipcodes' },
      { href: '/admin/location/cities', label: 'Cities' },
      { href: '/admin/location/countries', label: 'Countries' },
      { href: '/admin/location/zipcodes-group', label: 'Zipcodes Group' },
      { href: '/admin/location/cities-group', label: 'Cities Group' },
      { href: '/admin/location/bulk-upload', label: 'Bulk Upload' },
    ],
  },
  { href: '/admin/manage-stock', label: 'Manage Stock', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { href: '/admin/media', label: 'Media', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: '/admin/payment-request', label: 'Payment Request', icon: 'M3 10h18M7 15h.01M11 15h2m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z' },
  {
    label: 'Offers & Sliders',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    children: [
      { href: '/admin/offers-sliders/sliders', label: 'Sliders' },
      { href: '/admin/offers-sliders/offers', label: 'Offers' },
    ],
  },
  { href: '/admin/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const next = {};
    for (const item of NAV) {
      if (item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'))) {
        next[item.label] = true;
      }
    }
    setExpanded((prev) => ({ ...prev, ...next }));
  }, [pathname]);

  function toggle(label) {
    setExpanded((s) => ({ ...s, [label]: !s[label] }));
  }

  function isActive(href, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <span className="inline-block w-7 h-7 rounded-md bg-indigo-600" />
            eShop Admin
          </Link>
          <button type="button" onClick={onClose} className="lg:hidden p-2 -mr-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close menu">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {NAV.map((item) => {
            if (item.children) {
              const groupActive = item.children.some((c) => isActive(c.href));
              const isOpen = expanded[item.label] ?? groupActive;
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => toggle(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      groupActive
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className="flex-1 text-left">{item.label}</span>
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="ml-7 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-800 pl-3">
                      {item.children.map((c) => {
                        const active = isActive(c.href, c.href.split('/').length === 3);
                        return (
                          <Link
                            key={c.href}
                            href={c.href}
                            onClick={onClose}
                            className={`block px-3 py-2 rounded-lg text-sm transition ${
                              active
                                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {c.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = isActive(item.href, item.href === '/admin');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}