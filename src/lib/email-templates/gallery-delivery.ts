import { emailBase, coralButton, heading, paragraph, divider } from "./base";

export function galleryDeliveryEmail({
  customerName,
  galleryUrl,
  photographerName,
  locationName,
  coverPhotoUrl,
  photoCount,
  expiryDays = 30,
}: {
  customerName: string;
  galleryUrl: string;
  photographerName: string;
  locationName: string;
  coverPhotoUrl?: string;
  photoCount: number;
  expiryDays?: number;
}) {
  const body = `
    ${heading(`Your photos are ready! 📸`)}
    ${paragraph(`Hi ${customerName},`)}
    ${paragraph(`Great news! Your ${photoCount} photos from <strong>${locationName}</strong> are ready to view. ${photographerName} captured some truly beautiful moments for you.`)}

    ${coverPhotoUrl ? `
    <div style="margin:24px 0;text-align:center;">
      <img src="${coverPhotoUrl}" alt="Your photos" width="536" style="max-width:100%;border-radius:12px;display:block;margin:0 auto;" />
    </div>` : ""}

    ${coralButton(galleryUrl, "View Your Gallery")}

    ${divider()}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:12px 16px;background-color:#FAFAF9;border-radius:8px;">
          <p style="margin:0 0 4px;font-size:13px;color:#7A8EAC;">Photographer</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#0C2E3D;">${photographerName}</p>
        </td>
        <td style="padding:12px 16px;background-color:#FAFAF9;border-radius:8px;">
          <p style="margin:0 0 4px;font-size:13px;color:#7A8EAC;">Location</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#0C2E3D;">${locationName}</p>
        </td>
      </tr>
    </table>

    ${divider()}

    <p style="margin:0;font-size:13px;color:#EA580C;font-weight:600;text-align:center;">
      ⏰ Available for ${expiryDays} days — don't miss out!
    </p>
  `;

  return {
    subject: "Your photos are ready! 📸",
    html: emailBase({ preheader: `${photoCount} photos from ${locationName} are ready to view`, body }),
  };
}
