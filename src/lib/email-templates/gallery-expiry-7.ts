import { emailBase, coralButton, heading, paragraph } from "./base";

export function galleryExpiry7Email({
  customerName,
  galleryUrl,
  coverPhotoUrl,
}: {
  customerName: string;
  galleryUrl: string;
  coverPhotoUrl?: string;
}) {
  const body = `
    ${heading(`Only 7 days left, ${customerName}`)}
    ${paragraph(`Time is running out! Your holiday photo gallery <strong>expires in just 7 days</strong>.`)}
    ${paragraph(`After that, your photos will be permanently removed and can't be recovered. Don't let these memories disappear.`)}

    ${coverPhotoUrl ? `
    <div style="margin:24px 0;text-align:center;">
      <img src="${coverPhotoUrl}" alt="Your photos" width="536" style="max-width:100%;border-radius:12px;display:block;margin:0 auto;" />
    </div>` : ""}

    <!-- Urgency banner -->
    <div style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:12px;padding:16px 20px;text-align:center;margin:24px 0;">
      <p style="margin:0;font-size:14px;color:#92400E;">
        ⏰ <strong>7 days remaining</strong> — view and download your photos before they're gone
      </p>
    </div>

    ${coralButton(galleryUrl, "View My Photos")}

    <p style="margin:24px 0 0;font-size:13px;color:#7A8EAC;text-align:center;">
      Photos are permanently deleted after the gallery expires.
    </p>
  `;

  return {
    subject: `Only 7 days left to grab your photos, ${customerName}`,
    html: emailBase({ preheader: "Your gallery expires in 7 days — save your memories now", body }),
  };
}
