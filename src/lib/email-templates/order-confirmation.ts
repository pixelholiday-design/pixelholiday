import { emailBase, brandButton, heading, paragraph, divider } from "./base";

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  thumbnailUrl?: string;
}

export function orderConfirmationEmail({
  customerName,
  orderNumber,
  items,
  total,
  currency = "EUR",
  galleryUrl,
  shippingEstimate,
}: {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  currency?: string;
  galleryUrl?: string;
  shippingEstimate?: string;
}) {
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "GBP" ? "\u00A3" : "$";

  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e9e7dd;vertical-align:top;">
        ${item.thumbnailUrl ? `<img src="${item.thumbnailUrl}" alt="${item.name}" width="56" height="56" style="border-radius:8px;display:block;" />` : `<div style="width:56px;height:56px;background:#E8F6FC;border-radius:8px;"></div>`}
      </td>
      <td style="padding:12px 12px;border-bottom:1px solid #e9e7dd;vertical-align:top;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#0C2E3D;">${item.name}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#7A8EAC;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #e9e7dd;text-align:right;vertical-align:top;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#0C2E3D;">${currencySymbol}${(item.unitPrice * item.quantity).toFixed(2)}</p>
      </td>
    </tr>`,
    )
    .join("");

  const body = `
    ${heading(`Order confirmed! 🎉`)}
    ${paragraph(`Hi ${customerName}, thank you for your purchase!`)}

    <!-- Order number -->
    <div style="background:#FAFAF9;border-radius:8px;padding:16px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 4px;font-size:12px;color:#7A8EAC;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
      <p style="margin:0;font-size:18px;font-weight:700;color:#0C2E3D;letter-spacing:1px;">${orderNumber}</p>
    </div>

    <!-- Items -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemRows}
      <tr>
        <td colspan="2" style="padding:16px 0;font-size:16px;font-weight:700;color:#0C2E3D;">Total</td>
        <td style="padding:16px 0;text-align:right;font-size:18px;font-weight:700;color:#0C2E3D;">${currencySymbol}${total.toFixed(2)}</td>
      </tr>
    </table>

    ${shippingEstimate ? `
    ${divider()}
    <p style="margin:0;font-size:14px;color:#334766;">
      📦 <strong>Estimated delivery:</strong> ${shippingEstimate}
    </p>` : ""}

    ${galleryUrl ? brandButton(galleryUrl, "View Your Gallery") : ""}

    ${paragraph(`If you have any questions about your order, simply reply to this email.`)}
  `;

  return {
    subject: "Order confirmed! 🎉",
    html: emailBase({ preheader: `Order ${orderNumber} confirmed — ${currencySymbol}${total.toFixed(2)}`, body }),
  };
}
