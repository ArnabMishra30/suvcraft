import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getSettings } from '@/lib/settings';

export const runtime = 'nodejs';

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => ({}));
  const to = String(body?.to || '').trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return fail('Valid recipient email is required.', 422);

  const settings = await getSettings('email_settings');
  if (!settings || !settings.smtp_host) return fail('Email settings are not configured. Set them under Settings → Email Settings.', 422);

  let nodemailer;
  try { nodemailer = (await import('nodemailer')).default; }
  catch { return fail('nodemailer is not installed. Run `npm i nodemailer` and restart the server.', 503); }

  try {
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: Number(settings.smtp_port) || 465,
      secure: String(settings.smtp_encryption || 'ssl').toLowerCase() === 'ssl' || Number(settings.smtp_port) === 465,
      auth: { user: settings.email, pass: settings.password },
    });
    await transporter.verify();
    await transporter.sendMail({
      from: settings.email,
      to,
      subject: 'SMTP test from eShop admin',
      text: 'If you can read this, your SMTP settings are working correctly.',
    });
    return ok({}, { message: `Test email sent to ${to}.` });
  } catch (e) {
    return fail(`SMTP test failed: ${e.message}`, 502);
  }
}