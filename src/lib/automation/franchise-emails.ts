/**
 * Franchise email templates — welcome email with login credentials.
 */
import { Resend } from "resend";

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.FROM_EMAIL || "noreply@pixelvo.com";
const resend = KEY ? new Resend(KEY) : null;

interface WelcomeEmailArgs {
  to: string;
  name: string;
  businessName: string;
  tempPassword: string;
  loginUrl: string;
}

export async function sendWelcomeEmail({ to, name, businessName, tempPassword, loginUrl }: WelcomeEmailArgs) {
  const subject = `Welcome to Pixelvo — ${businessName} is live!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #29ABE2;">Welcome to Pixelvo!</h1>
      <p>Hi ${name},</p>
      <p>Your franchise <strong>${businessName}</strong> has been created and is ready to go.</p>
      <p>Here are your login credentials:</p>
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Email:</strong> ${to}</p>
        <p style="margin: 4px 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
      </div>
      <p>Please change your password after your first login.</p>
      <a href="${loginUrl}" style="display: inline-block; background: #29ABE2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
        Log In Now
      </a>
      <p style="margin-top: 24px; color: #666; font-size: 14px;">
        Need help? Reply to this email or contact our support team.
      </p>
    </div>
  `;

  if (!resend) {
    console.log(`[Email MOCK -> ${to}] ${subject}\nTemp password: ${tempPassword}`);
    return { mocked: true };
  }

  return resend.emails.send({ from: FROM, to, subject, html });
}
