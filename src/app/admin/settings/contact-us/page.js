import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import ContactUsForm from '@/components/admin/contact-us-form';

export const dynamic = 'force-dynamic';

const DEFAULT_HTML = `<h2><strong>Contact Us</strong></h2>
<p>For any kind of queries related to products, orders or services feel free to contact us on our official email address or phone number as given below :</p>
<p><strong>Areas we deliver :</strong></p>
<p><strong>Delivery Timings :</strong></p>
<ol>
  <li>8:00 AM To 10:30 AM</li>
  <li>10:30 AM To 12:30 PM</li>
  <li>4:00 PM To 7:00 PM</li>
</ol>
<p><strong>Note :</strong> You can order for maximum 2 days in advance. i.e., Today &amp; Tomorrow only.</p>`;

export default async function ContactUsPage() {
  const initial = (await getSettings('contact_us', false).catch(() => null)) || DEFAULT_HTML;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Contact Us</h1>
          <p className="mt-1 text-sm text-slate-500">Storefront contact information shown on the public Contact page.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">Policies</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Contact Us</span>
        </nav>
      </div>

      <ContactUsForm initial={initial} />
    </div>
  );
}