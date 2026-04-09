import { emailBase, brandButton, heading, paragraph, divider } from "./base";

export function bookingConfirmationEmail({
  customerName,
  date,
  time,
  photographerName,
  photographerPhotoUrl,
  locationName,
  packageName,
  whatToBring,
  questionnaireUrl,
}: {
  customerName: string;
  date: string;
  time: string;
  photographerName: string;
  photographerPhotoUrl?: string;
  locationName: string;
  packageName: string;
  whatToBring?: string[];
  questionnaireUrl?: string;
}) {
  const bringItems = whatToBring?.length
    ? whatToBring.map((item) => `<li style="margin:0 0 6px;font-size:14px;color:#334766;">${item}</li>`).join("")
    : "";

  const body = `
    ${heading(`Session booked! See you on ${date} 📸`)}
    ${paragraph(`Hi ${customerName}, your photography session is confirmed!`)}

    <!-- Booking details card -->
    <div style="background:#FAFAF9;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #e9e7dd;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:0 0 16px;">
            <p style="margin:0 0 4px;font-size:12px;color:#7A8EAC;text-transform:uppercase;letter-spacing:1px;">Date & Time</p>
            <p style="margin:0;font-size:18px;font-weight:700;color:#0C2E3D;">${date} at ${time}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 16px;">
            <p style="margin:0 0 4px;font-size:12px;color:#7A8EAC;text-transform:uppercase;letter-spacing:1px;">Package</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#0C2E3D;">${packageName}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 16px;">
            <p style="margin:0 0 4px;font-size:12px;color:#7A8EAC;text-transform:uppercase;letter-spacing:1px;">Location</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#0C2E3D;">${locationName}</p>
          </td>
        </tr>
        <tr>
          <td>
            <p style="margin:0 0 8px;font-size:12px;color:#7A8EAC;text-transform:uppercase;letter-spacing:1px;">Your Photographer</p>
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">
                  ${photographerPhotoUrl
                    ? `<img src="${photographerPhotoUrl}" alt="${photographerName}" width="40" height="40" style="border-radius:50%;display:block;" />`
                    : `<div style="width:40px;height:40px;background:#0EA5A5;border-radius:50%;text-align:center;line-height:40px;font-size:16px;font-weight:700;color:#fff;">${photographerName[0]}</div>`
                  }
                </td>
                <td style="padding-left:12px;vertical-align:middle;">
                  <p style="margin:0;font-size:15px;font-weight:600;color:#0C2E3D;">${photographerName}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>

    ${bringItems ? `
    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#0C2E3D;">What to bring</h3>
    <ul style="margin:0 0 24px;padding:0 0 0 20px;">${bringItems}</ul>
    ` : ""}

    ${questionnaireUrl ? `
    ${paragraph(`Please fill out a quick pre-session questionnaire so your photographer can prepare:`)}
    ${brandButton(questionnaireUrl, "Fill Out Questionnaire")}
    ` : ""}

    ${divider()}

    ${paragraph(`Need to reschedule? Reply to this email at least 24 hours before your session.`)}
  `;

  return {
    subject: `Session booked! See you on ${date}`,
    html: emailBase({ preheader: `${packageName} with ${photographerName} at ${locationName}`, body }),
  };
}
