/**
 * Shared email template base for Fotiqo.
 * All templates use inline CSS for email client compatibility.
 */

const BRAND = "#0EA5A5";
const CORAL = "#F97316";
const NAVY = "#0C2E3D";
const CREAM = "#FAFAF9";

export function emailBase({
  preheader = "",
  body,
}: {
  preheader?: string;
  body: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Fotiqo</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${CREAM};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM};">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">

          <!-- Brand Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND},${NAVY});border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
              <img src="https://fotiqo.com/fotiqo-icon.svg" alt="Fotiqo" width="40" height="40" style="display:inline-block;vertical-align:middle;border:0;" />
              <span style="display:inline-block;vertical-align:middle;margin-left:10px;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Fotiqo</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:32px 32px 24px;border-left:1px solid #e9e7dd;border-right:1px solid #e9e7dd;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${NAVY};border-radius:0 0 12px 12px;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.6);">
                &copy; ${new Date().getFullYear()} Fotiqo. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;">
                <a href="https://fotiqo.com/privacy" style="color:rgba(255,255,255,0.4);text-decoration:underline;">Privacy</a>
                &nbsp;&middot;&nbsp;
                <a href="https://fotiqo.com/terms" style="color:rgba(255,255,255,0.4);text-decoration:underline;">Terms</a>
                &nbsp;&middot;&nbsp;
                <a href="{{unsubscribe_url}}" style="color:rgba(255,255,255,0.4);text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function coralButton(href: string, text: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
    <tr>
      <td style="background-color:${CORAL};border-radius:12px;">
        <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

export function brandButton(href: string, text: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
    <tr>
      <td style="background-color:${BRAND};border-radius:12px;">
        <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

export function heading(text: string) {
  return `<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:${NAVY};line-height:1.3;">${text}</h1>`;
}

export function paragraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334766;">${text}</p>`;
}

export function divider() {
  return `<hr style="border:none;border-top:1px solid #e9e7dd;margin:24px 0;" />`;
}
