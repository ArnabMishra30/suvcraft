import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getProductFaq, updateProductFaq, deleteProductFaq } from '@/lib/repos/product-faq';

export async function GET(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const row = await getProductFaq(id);
  if (!row) return fail('Not found.', 404);
  return ok(row);
}

export async function PUT(req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const okRow = await updateProductFaq(id, {
      question: body.question,
      answer: body.answer,
      answered_by: auth.session?.uid,
    });
    if (!okRow) return fail('Not found.', 404);
    return ok({}, { message: 'FAQ updated.' });
  } catch (e) {
    return fail(e.message || 'Update failed.', 422);
  }
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const { id } = await params;
  const okRow = await deleteProductFaq(id);
  if (!okRow) return fail('Not found.', 404);
  return ok({ id: Number(id) }, { message: 'FAQ deleted.' });
}