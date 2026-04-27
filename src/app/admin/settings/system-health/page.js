import Link from 'next/link';
import { getSystemHealth } from '@/lib/system-health';
import SmtpTestButton from '@/components/admin/smtp-test-button';

export const dynamic = 'force-dynamic';

const PAYMENT_GATEWAYS = [
  { key: 'paypal', name: 'PayPal Payments', accent: 'sky', url: 'https://www.paypal.com/business' },
  { key: 'razorpay', name: 'Razorpay Payments', accent: 'indigo', url: 'https://dashboard.razorpay.com/' },
  { key: 'paystack', name: 'Paystack Payments', accent: 'emerald', url: 'https://dashboard.paystack.com/' },
  { key: 'stripe', name: 'Stripe Payments', accent: 'slate', url: 'https://dashboard.stripe.com/' },
  { key: 'flutterwave', name: 'Flutterwave Payments', accent: 'amber', url: 'https://dashboard.flutterwave.com/' },
  { key: 'paytm', name: 'Paytm Payments', accent: 'sky', url: 'https://business.paytm.com/' },
  { key: 'midtrans', name: 'Midtrans Payments', accent: 'rose', url: 'https://dashboard.midtrans.com/' },
  { key: 'myfatoorah', name: 'Myfatoorah Payments', accent: 'sky', url: 'https://portal.myfatoorah.com/' },
  { key: 'instamojo', name: 'Instamojo Payments', accent: 'sky', url: 'https://www.instamojo.com/dashboard/' },
  { key: 'phonepe', name: 'PhonePe Payments', accent: 'emerald', url: 'https://business.phonepe.com/' },
];

const ACCENT_BG = {
  sky: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300',
  indigo: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300',
  emerald: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  amber: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300',
  rose: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300',
};

function StatusCard({ label, value, sublabel, kind = 'info' }) {
  const palette = {
    info: { tint: 'text-indigo-100 dark:text-indigo-950/30', icon: 'M16 18l6-6-6-6M8 6l-6 6 6 6', iconClr: 'text-indigo-500/70' },
    ok: { tint: 'text-emerald-100 dark:text-emerald-950/40', icon: 'M5 13l4 4L19 7', iconClr: 'text-emerald-500/70' },
    warn: { tint: 'text-amber-100 dark:text-amber-950/40', icon: 'M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z', iconClr: 'text-amber-500/70' },
    error: { tint: 'text-rose-100 dark:text-rose-950/40', icon: 'M6 18L18 6M6 6l12 12', iconClr: 'text-rose-500/70' },
  }[kind];
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</div>
      <div className="mt-1 text-4xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</div>
      {sublabel && <div className="mt-1 text-xs text-slate-500">{sublabel}</div>}
      <svg className={`w-24 h-24 absolute -right-3 -top-3 ${palette.iconClr}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d={palette.icon} />
      </svg>
    </div>
  );
}

function StatusPill({ ok, optional, customLabel }) {
  if (customLabel) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">{customLabel}</span>;
  if (optional && !ok) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Optional</span>;
  if (ok) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Active</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Required</span>;
}

function Section({ title, icon, children, action }) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
          {title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function SetupCard({ icon, accent, title, subtitle, link, steps }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${ACCENT_BG[accent] || ACCENT_BG.slate}`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
        {link && <a href={link} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>}
      </div>
      {steps && (
        <div className="p-3 bg-white dark:bg-slate-900">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Setup Steps:</div>
          <ol className="list-decimal pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
            {steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}

export default async function SystemHealthPage() {
  const health = await getSystemHealth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">System Health</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor and manage your system requirements and configurations.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">System Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">System Health</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard label="Current Node Version" value={health.node.current} sublabel="Currently running version" kind="info" />
        <StatusCard label="Minimum Required" value={health.node.min} sublabel={health.node.minOk ? 'Minimum supported version — OK' : 'Below the minimum supported version'} kind={health.node.minOk ? 'ok' : 'error'} />
        <StatusCard label="Maximum Tested" value={health.node.max} sublabel={health.node.maxOk ? 'Maximum supported version' : 'Above the maximum tested version'} kind={health.node.maxOk ? 'warn' : 'error'} />
      </div>

      <Section title="System Requirements & Modules" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-center w-10">#</th>
                <th className="px-4 py-2 text-left">Extension / Service</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 text-center text-slate-400 tabular-nums">0</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Database (MySQL)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{health.database.message}</td>
                <td className="px-4 py-3 text-center"><StatusPill ok={health.database.ok} customLabel={health.database.ok ? null : 'Down'} /></td>
              </tr>
              {health.checks.map((c, i) => (
                <tr key={c.name}>
                  <td className="px-4 py-3 text-center text-slate-400 tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.desc}</td>
                  <td className="px-4 py-3 text-center"><StatusPill ok={c.ok} optional={c.optional} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Notification Settings" icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9">
        <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-4">
          <div className="text-sm text-blue-900 dark:text-blue-200 mb-2">
            <span className="font-semibold">Firebase Push Notifications Setup</span> — To enable Application Push Notifications, please complete these steps:
          </div>
          <ol className="list-decimal pl-5 text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>Set your VAP ID key from Firebase account (Firebase → Project Settings → Cloud Messaging → Web Configuration → here you have to generate it).</li>
            <li>Set your Firebase project ID (Firebase → Project Settings → General → Project ID).</li>
            <li>Upload the service account JSON file associated with your Firebase account (Firebase → Project Settings → Service Account → Generate new private key).</li>
          </ol>
        </div>
      </Section>

      <Section title="Email Settings" icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
        <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 p-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">SMTP Configuration Required</div>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
              You need to set SMTP Email Settings for Email Notification. For this setting you need to check your server SMTP Email settings. If that is not working then ask your support to check your SMTP settings.
            </p>
          </div>
          <SmtpTestButton />
        </div>
      </Section>

      <Section title="Payment Gateway Settings" icon="M3 10h18M7 15h.01M11 15h2m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PAYMENT_GATEWAYS.map((g) => (
            <div key={g.key} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${ACCENT_BG[g.accent] || ACCENT_BG.slate}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{g.name}</div>
                <div className="text-xs text-slate-500">Create {g.name.replace(' Payments', '')} business account</div>
              </div>
              <a href={g.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600" title="Open dashboard">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Shipping Settings" icon="M9 17a2 2 0 11-4 0 2 2 0 014 0zm0 0h6m-6 0a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 11-4 0 2 2 0 014 0zm0 0h2m-2 0a2 2 0 100-4 2 2 0 000 4zM5 9h14l1 7H4l1-7z">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SetupCard
            icon="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
            accent="sky" title="Local Shipping" subtitle="Configure local delivery system"
            steps={[
              <>Set deliverability system from admin panel → System → <Link href="/admin/settings/store" className="text-indigo-600 hover:text-indigo-500">store setting</Link> (enable zipcode wise or city wise).</>,
              <>Add cities in admin panel → <Link href="/admin/location/cities" className="text-indigo-600 hover:text-indigo-500">Location → Cities</Link>.</>,
              <>Add zipcodes in admin panel → <Link href="/admin/location/zipcodes" className="text-indigo-600 hover:text-indigo-500">Location → Zipcodes</Link> (for zipcode-wise deliverability).</>,
            ]}
          />
          <SetupCard
            icon="M9 17a2 2 0 11-4 0 2 2 0 014 0zm0 0h6m-6 0a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 11-4 0 2 2 0 014 0zm0 0h2m-2 0a2 2 0 100-4 2 2 0 000 4zM5 9h14l1 7H4l1-7z"
            accent="emerald" title="Shiprocket Integration" subtitle="Standard delivery method"
            link="https://app.shiprocket.in/"
            steps={[
              'Set your Shiprocket API credentials.',
              'Set your Shiprocket warehouse ID.',
            ]}
          />
        </div>
      </Section>

      <Section title="Authentication Settings" icon="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SetupCard
            icon="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3"
            accent="amber" title="Firebase Configuration" subtitle="Setup Firebase authentication"
            steps={[
              <>Set Firebase settings from admin panel → Web settings → Firebase Settings.</>,
              <>Add &quot;test&quot; in <code>databaseURL</code> and <code>measurementId</code>.</>,
            ]}
          />
          <SetupCard
            icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            accent="emerald" title="SMS Gateway" subtitle="Custom SMS Gateway configuration"
            steps={[
              'Set your custom SMS gateway settings from Admin panel → System → SMS Gateway Settings.',
              'In base URL add your SMS gateway base URL.',
              'Add authorization token in header.',
              'Add body data in Body.',
            ]}
          />
        </div>
      </Section>
    </div>
  );
}