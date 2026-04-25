import { ok } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { listSellerWalletTransactions } from '@/lib/repos/wallet-transaction';

export async function GET(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const sp = new URL(req.url).searchParams;
  const result = await listSellerWalletTransactions({
    page: Number(sp.get('page') || 1),
    perPage: Number(sp.get('perPage') || 20),
    search: sp.get('q') || '',
    status: sp.get('status') ?? '',
    sellerId: sp.get('sellerId') || '',
  });
  return ok(result);
}