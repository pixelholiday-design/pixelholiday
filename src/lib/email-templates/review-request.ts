import { emailBase, coralButton, heading, paragraph, divider } from "./base";

export function reviewRequestEmail({
  customerName,
  photographerName,
  reviewUrl,
  galleryThumbnailUrl,
}: {
  customerName: string;
  photographerName: string;
  reviewUrl: string;
  galleryThumbnailUrl?: string;
}) {
  const starButtons = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<td style="padding:0 4px;text-align:center;">
          <a href="${reviewUrl}?rating=${n}" style="display:inline-block;width:44px;height:44px;line-height:44px;text-align:center;font-size:24px;text-decoration:none;background:#FAFAF9;border-radius:8px;border:1px solid #e9e7dd;">
            ${"★".repeat(n)}
          </a>
        </td>`,
    )
    .join("");

  const body = `
    ${heading(`How was your session with ${photographerName}?`)}
    ${paragraph(`Hi ${customerName}, we hope you loved your photos! Your feedback helps ${photographerName} improve and helps other guests make great choices.`)}

    ${galleryThumbnailUrl ? `
    <div style="margin:24px 0;text-align:center;">
      <img src="${galleryThumbnailUrl}" alt="Your session" width="536" style="max-width:100%;border-radius:12px;display:block;margin:0 auto;" />
    </div>` : ""}

    <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#0C2E3D;text-align:center;">Tap a star to rate your experience:</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>${starButtons}</tr>
    </table>

    ${coralButton(reviewUrl, "Leave a Review")}

    ${divider()}

    ${paragraph(`Your review means the world to us. It takes less than 2 minutes and helps our photographer community thrive.`)}
  `;

  return {
    subject: `How was your session with ${photographerName}?`,
    html: emailBase({ preheader: `Rate your photo session with ${photographerName}`, body }),
  };
}
