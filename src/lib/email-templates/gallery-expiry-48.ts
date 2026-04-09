import { emailBase, coralButton, heading, paragraph, divider } from "./base";

export function galleryExpiry48Email({
  customerName,
  galleryUrl,
  discountCode = "LASTCHANCE",
  discountPercent = 20,
  coverPhotoUrl,
}: {
  customerName: string;
  galleryUrl: string;
  discountCode?: string;
  discountPercent?: number;
  coverPhotoUrl?: string;
}) {
  const body = `
    ${heading(`Last chance! Your photos expire tomorrow`)}
    ${paragraph(`Hi ${customerName},`)}
    ${paragraph(`Your photo gallery <strong>expires in less than 48 hours</strong>. Once it's gone, these memories can't be recovered.`)}

    ${coverPhotoUrl ? `
    <div style="margin:24px 0;text-align:center;">
      <img src="${coverPhotoUrl}" alt="Your photos" width="536" style="max-width:100%;border-radius:12px;display:block;margin:0 auto;" />
    </div>` : ""}

    <!-- Discount banner -->
    <div style="background:linear-gradient(135deg,#F97316,#EA580C);border-radius:12px;padding:20px 24px;text-align:center;margin:24px 0;">
      <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:1px;">Special offer</p>
      <p style="margin:0 0 8px;font-size:28px;font-weight:700;color:#ffffff;">${discountPercent}% OFF</p>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.9);">Use code: <strong style="letter-spacing:1px;">${discountCode}</strong></p>
    </div>

    ${coralButton(galleryUrl, "Save My Photos Now")}

    ${divider()}

    <p style="margin:0;font-size:13px;color:#EA580C;font-weight:600;text-align:center;">
      ⚠️ This offer expires when your gallery does — in less than 48 hours.
    </p>
  `;

  return {
    subject: "Last chance! Your photos expire tomorrow",
    html: emailBase({ preheader: `${discountPercent}% off before your gallery expires forever`, body }),
  };
}
