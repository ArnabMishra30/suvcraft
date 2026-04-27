import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { setSetting } from '@/lib/settings';

export async function PUT(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));

  const email = String(body?.email || '').trim();
  const smtpHost = String(body?.smtp_host || '').trim();
  const smtpPort = String(body?.smtp_port || '').trim();
  const password = String(body?.password ?? '');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Valid email address is required.', 422);
  if (!smtpHost) return fail('SMTP host is required.', 422);
  if (!smtpPort || !/^\d+$/.test(smtpPort)) return fail('SMTP port must be numeric.', 422);

  const next = {
    email,
    password,
    smtp_host: smtpHost,
    smtp_port: smtpPort,
    mail_content_type: ['html', 'plain'].includes(String(body?.mail_content_type || '').toLowerCase())
      ? String(body.mail_content_type).toLowerCase() : 'html',
    smtp_encryption: ['ssl', 'tls', 'none'].includes(String(body?.smtp_encryption || '').toLowerCase())
      ? String(body.smtp_encryption).toLowerCase() : 'ssl',
  };

  await setSetting('email_settings', next);
  return ok({}, { message: 'Email settings updated.' });
}