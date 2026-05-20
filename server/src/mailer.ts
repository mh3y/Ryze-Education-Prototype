import nodemailer from 'nodemailer';

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, auth: { user, pass } });
}

export async function sendInviteEmail(
  to: string,
  name: string,
  inviteLink: string,
): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.log(`[mailer] SMTP not configured — invite for ${name} <${to}>:\n  ${inviteLink}`);
    return;
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? '"Ryze Education" <noreply@ryzeeducation.com.au>',
    to,
    subject: 'Your Ryze Education Parent Portal invite',
    html: `
      <p>Hi ${name},</p>
      <p>An account has been created for you on the <strong>Ryze Education Parent Portal</strong>.</p>
      <p>Click the link below to set your password and access the portal:</p>
      <p><a href="${inviteLink}" style="background:#FFB000;color:#050510;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Activate My Account</a></p>
      <p style="color:#666;font-size:13px">Or copy this link: ${inviteLink}</p>
      <p style="color:#666;font-size:13px">This link expires in 48 hours.</p>
      <p>— The Ryze Education Team</p>
    `,
  });
}
