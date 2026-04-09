import { emailBase, coralButton, heading, paragraph, divider } from "./base";

export function welcomeEmail({
  name,
  dashboardUrl = "https://fotiqo.com/admin/dashboard",
}: {
  name: string;
  dashboardUrl?: string;
}) {
  const body = `
    ${heading(`Welcome to Fotiqo! 🎉`)}
    ${paragraph(`Hi ${name}, we're thrilled to have you on board.`)}
    ${paragraph(`You now have full access to the complete photography platform — galleries, store, website builder, bookings, and more. No limits, no trial period, no credit card required.`)}

    ${divider()}

    <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0C2E3D;">Get started in 3 steps</h2>

    <!-- Step 1 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      <tr>
        <td style="width:40px;vertical-align:top;">
          <div style="width:32px;height:32px;background:#0EA5A5;border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">1</div>
        </td>
        <td style="padding:4px 0 0 12px;vertical-align:top;">
          <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#0C2E3D;">Create your first gallery</p>
          <p style="margin:0;font-size:14px;color:#334766;">Upload photos, set watermarking, and share with your clients via magic link.</p>
        </td>
      </tr>
    </table>

    <!-- Step 2 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      <tr>
        <td style="width:40px;vertical-align:top;">
          <div style="width:32px;height:32px;background:#0EA5A5;border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">2</div>
        </td>
        <td style="padding:4px 0 0 12px;vertical-align:top;">
          <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#0C2E3D;">Set up your store</p>
          <p style="margin:0;font-size:14px;color:#334766;">Connect Stripe, choose products (prints, canvas, albums), set your prices.</p>
        </td>
      </tr>
    </table>

    <!-- Step 3 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      <tr>
        <td style="width:40px;vertical-align:top;">
          <div style="width:32px;height:32px;background:#0EA5A5;border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">3</div>
        </td>
        <td style="padding:4px 0 0 12px;vertical-align:top;">
          <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#0C2E3D;">Build your website</p>
          <p style="margin:0;font-size:14px;color:#334766;">Pick a theme, add your portfolio, connect your custom domain, and go live.</p>
        </td>
      </tr>
    </table>

    ${coralButton(dashboardUrl, "Go to Dashboard")}

    ${divider()}

    ${paragraph(`Need help? Reply to this email or visit our <a href="https://fotiqo.com/contact" style="color:#0EA5A5;text-decoration:none;font-weight:600;">Help Center</a>.`)}
    ${paragraph(`Happy shooting!<br /><strong>The Fotiqo Team</strong>`)}
  `;

  return {
    subject: "Welcome to Fotiqo!",
    html: emailBase({ preheader: "Your photography platform is ready — here's how to get started", body }),
  };
}
