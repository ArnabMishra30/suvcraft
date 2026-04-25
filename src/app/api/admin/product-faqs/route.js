import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { createProductFaq } from '@/lib/repos/product-faq';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  try {
    const id = await createProductFaq({
      product_id: body.product_id,
      question: body.question,
      answer: body.answer,
      user_id: auth.session?.uid,
      answered_by: auth.session?.uid,
    });
    return ok({ id }, { message: 'FAQ created.' });
  } catch (e) {
    return fail(e.message || 'Create failed.', 422);
  }
}