import { emailBase, coralButton, heading, paragraph, divider } from "./base";

export function digitalPassOfferEmail({
  guestName,
  hotelName,
  passPrice = 49,
  currency = "EUR",
  purchaseUrl,
}: {
  guestName: string;
  hotelName: string;
  passPrice?: number;
  currency?: string;
  purchaseUrl: string;
}) {
  const sym = currency === "EUR" ? "\u20AC" : currency === "GBP" ? "\u00A3" : "$";

  const body = `
    ${heading(`Unlimited photos during your stay \u2014 from ${sym}${passPrice}`)}
    ${paragraph(`Hi ${guestName},`)}
    ${paragraph(`Make the most of your stay at <strong>${hotelName}</strong> with our <strong>Digital Photo Pass</strong>. Every photo taken by our professional photographers \u2014 delivered instantly to your phone.`)}

    <!-- Pass benefits -->
    <div style="background:#E8F6FC;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #C5E9F7;">
      <h3 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0C2E3D;text-align:center;">Digital Photo Pass</h3>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${[
          "Unlimited professional photos during your stay",
          "Instant delivery via WhatsApp \u2014 no waiting",
          "Full high-resolution downloads",
          "Access your gallery anytime, forever",
          "Priority booking for sunset & VIP sessions",
        ]
          .map(
            (b) => `
          <tr>
            <td style="padding:6px 0;vertical-align:top;width:24px;">
              <span style="color:#0EA5A5;font-size:16px;">\u2713</span>
            </td>
            <td style="padding:6px 0 6px 8px;font-size:14px;color:#334766;">${b}</td>
          </tr>`,
          )
          .join("")}
      </table>
    </div>

    <!-- Price -->
    <div style="text-align:center;margin:24px 0;">
      <p style="margin:0 0 4px;font-size:13px;color:#7A8EAC;">Starting from</p>
      <p style="margin:0;font-size:36px;font-weight:700;color:#0C2E3D;">${sym}${passPrice}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#7A8EAC;">per stay</p>
    </div>

    ${coralButton(purchaseUrl, "Buy Your Pass")}

    ${divider()}

    ${paragraph(`50% of our guests purchase the Digital Pass \u2014 it's the easiest way to capture your entire holiday without thinking about it.`)}
  `;

  return {
    subject: `Unlimited photos during your stay \u2014 from ${sym}${passPrice}`,
    html: emailBase({ preheader: `Get unlimited professional photos at ${hotelName} with our Digital Pass`, body }),
  };
}
