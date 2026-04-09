import { emailBase, coralButton, heading, paragraph } from "./base";

export function galleryExpiry14Email({
  customerName,
  galleryUrl,
  coverPhotoUrl,
}: {
  customerName: string;
  galleryUrl: string;
  coverPhotoUrl?: string;
}) {
  const body = `
    ${heading(`${customerName}, your photos expire in 14 days`)}
    ${paragraph(`Your holiday photo gallery will be removed in <strong>14 days</strong>. After that, your photos will no longer be available for viewing or download.`)}
    ${paragraph(`Don't let these memories slip away — take a moment to view and save your photos now.`)}

    ${coverPhotoUrl ? `
    <div style="margin:24px 0;text-align:center;">
      <img src="${coverPhotoUrl}" alt="Your photos" width="536" style="max-width:100%;border-radius:12px;display:block;margin:0 auto;" />
    </div>` : ""}

    ${coralButton(galleryUrl, "View Gallery")}

    <p style="margin:24px 0 0;font-size:13px;color:#7A8EAC;text-align:center;">
      After expiry, photos cannot be recovered.
    </p>
  `;

  return {
    subject: `${customerName}, your photos expire in 14 days`,
    html: emailBase({ preheader: "Your gallery will be removed in 14 days — view your photos now", body }),
  };
}
