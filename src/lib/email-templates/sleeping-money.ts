import { emailBase, coralButton, heading, paragraph, divider } from "./base";

export function sleepingMoneyEmail({
  customerName,
  galleryUrl,
  coverPhotoUrl,
  discountPercent,
  discountCode,
  locationName,
}: {
  customerName: string;
  galleryUrl: string;
  coverPhotoUrl?: string;
  discountPercent?: number;
  discountCode?: string;
  locationName: string;
}) {
  const hasDiscount = discountPercent && discountCode;

  const body = `
    <!-- Nostalgic header -->
    <div style="text-align:center;margin:0 0 24px;">
      <p style="font-size:36px;margin:0 0 8px;">🌴 ☀️ 🌊</p>
    </div>

    ${heading(`Your vacation photos miss you`)}
    ${paragraph(`Hi ${customerName},`)}
    ${paragraph(`Remember those magical days at <strong>${locationName}</strong>? Your professional photos are still waiting for you \u2014 but not for much longer.`)}

    ${coverPhotoUrl ? `
    <div style="margin:24px 0;text-align:center;">
      <img src="${coverPhotoUrl}" alt="Your holiday" width="536" style="max-width:100%;border-radius:12px;display:block;margin:0 auto;" />
    </div>` : ""}

    ${hasDiscount ? `
    <div style="background:linear-gradient(135deg,#F97316,#D4A853);border-radius:12px;padding:20px 24px;text-align:center;margin:24px 0;">
      <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:1px;">Limited offer</p>
      <p style="margin:0 0 8px;font-size:28px;font-weight:700;color:#ffffff;">${discountPercent}% OFF</p>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.9);">Code: <strong style="letter-spacing:1px;">${discountCode}</strong></p>
    </div>` : ""}

    ${coralButton(galleryUrl, "View My Photos")}

    ${divider()}

    <div style="background:#FAFAF9;border-radius:8px;padding:16px;text-align:center;">
      <p style="margin:0;font-size:14px;color:#334766;">
        <strong>Did you know?</strong> 50% of our guests save their photos after their trip. Don't let yours disappear.
      </p>
    </div>
  `;

  return {
    subject: "Your vacation photos miss you 🌴",
    html: emailBase({
      preheader: `Your ${locationName} photos are still waiting${hasDiscount ? ` — ${discountPercent}% off today` : ""}`,
      body,
    }),
  };
}
