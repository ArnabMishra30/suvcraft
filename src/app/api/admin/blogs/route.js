import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createBlog } from '@/lib/repos/blog';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createBlog(body);
    return ok({ id }, { message: 'Blog added.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}