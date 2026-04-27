import Link from 'next/link';
import { POLICY_BY_SLUG } from '@/lib/policies';
import { getSettings } from '@/lib/settings';
import PolicyEditor from '@/components/admin/policy-editor';

export const dynamic = 'force-dynamic';

export default async function AffiliatePoliciesPage() {
  const policy = POLICY_BY_SLUG['affiliate-policies'];
  const contents = {};
  await Promise.all(policy.docs.map(async (d) => {
    const v = await getSettings(d.key, false).catch(() => null);
    contents[d.key] = v || '';
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">{policy.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{policy.description}</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/affiliate" className="hover:text-slate-700 dark:hover:text-slate-300">Affiliate</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Terms &amp; Policies</span>
        </nav>
      </div>

      <PolicyEditor policy={policy} contents={contents} />
    </div>
  );
}