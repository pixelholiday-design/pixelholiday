import { emailBase, coralButton, heading, paragraph, divider } from "./base";

export function hotelWelcomeEmail({
  guestName,
  hotelName,
  bookingUrl,
  qrCodeUrl,
  photographerName,
}: {
  guestName: string;
  hotelName: string;
  bookingUrl: string;
  qrCodeUrl?: string;
  photographerName?: string;
}) {
  const body = `
    <!-- Holiday header banner -->
    <div style="background:linear-gradient(135deg,#0EA5A5 0%,#0A7373 50%,#064040 100%);border-radius:12px;padding:32px 24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:32px;">🌴 📸 ☀️</p>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Welcome to ${hotelName}!</h1>
      <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);">Your photo session awaits</p>
    </div>

    ${paragraph(`Hi ${guestName},`)}
    ${paragraph(`Welcome to paradise! We're <strong>${hotelName}</strong>'s professional photography partner, and we'd love to capture the unforgettable moments of your stay.`)}

    ${divider()}

    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#0C2E3D;">What's included</h3>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${[
        { emoji: "📸", text: "Complimentary welcome portrait at check-in" },
        { emoji: "🏖️", text: "Professional beach & resort photo sessions" },
        { emoji: "🎬", text: "Video reels and magic shots available" },
        { emoji: "📱", text: "Photos delivered instantly via WhatsApp" },
      ]
        .map(
          (item) => `
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:32px;font-size:18px;">${item.emoji}</td>
          <td style="padding:8px 0 8px 8px;font-size:14px;color:#334766;">${item.text}</td>
        </tr>`,
        )
        .join("")}
    </table>

    ${coralButton(bookingUrl, "Book Your Session")}

    ${qrCodeUrl ? `
    <div style="text-align:center;margin:24px 0;">
      <p style="margin:0 0 12px;font-size:13px;color:#7A8EAC;">Or scan this QR code at reception:</p>
      <img src="${qrCodeUrl}" alt="Booking QR" width="160" height="160" style="display:block;margin:0 auto;border-radius:8px;" />
    </div>` : ""}

    ${photographerName ? `
    ${divider()}
    ${paragraph(`Your photographer: <strong>${photographerName}</strong>. Feel free to ask them about available packages at any time during your stay.`)}
    ` : ""}

    ${divider()}

    <p style="margin:0;font-size:14px;color:#334766;text-align:center;font-style:italic;">
      Capture every moment of your escape ✨
    </p>
  `;

  return {
    subject: `Welcome to ${hotelName}! Your photo session awaits 📸`,
    html: emailBase({ preheader: `Professional photography is available during your stay at ${hotelName}`, body }),
  };
}
