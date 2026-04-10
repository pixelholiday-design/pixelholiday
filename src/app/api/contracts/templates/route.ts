import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEFAULT_TEMPLATES = [
  {
    name: "Wedding Photography Contract",
    category: "WEDDING",
    content: `<h1>Wedding Photography Agreement</h1>
<p>This agreement is between <strong>{{photographer_name}}</strong> ("Photographer") and <strong>{{client_name}}</strong> ("Client") for wedding photography services.</p>
<h2>Event Details</h2><p>Date: {{session_date}}<br>Location: To be confirmed</p>
<h2>Services</h2><p>The Photographer will provide professional photography coverage of the wedding ceremony and reception, including:</p>
<ul><li>Full day coverage (up to 10 hours)</li><li>Minimum {{photo_count}} edited photographs</li><li>Online gallery delivery within 4-6 weeks</li><li>Print rights for personal use</li></ul>
<h2>Investment</h2><p>Total: {{total_price}}<br>Deposit (non-refundable): {{deposit}} due upon signing<br>Balance due: 7 days before event</p>
<h2>Cancellation</h2><p>The deposit is non-refundable. Cancellation within 30 days of the event forfeits the full payment.</p>
<h2>Copyright</h2><p>The Photographer retains copyright of all images. Client receives a personal use license.</p>`,
  },
  {
    name: "Portrait Session Agreement",
    category: "PORTRAIT",
    content: `<h1>Portrait Session Agreement</h1>
<p>This agreement is between <strong>{{photographer_name}}</strong> and <strong>{{client_name}}</strong>.</p>
<h2>Session Details</h2><p>Date: {{session_date}}<br>Duration: {{duration}} minutes<br>Location: To be confirmed</p>
<h2>Deliverables</h2><ul><li>{{photo_count}}+ professionally edited images</li><li>Online gallery with download access</li><li>Print ordering available through online store</li></ul>
<h2>Investment</h2><p>Session fee: {{total_price}}</p>
<h2>Usage Rights</h2><p>Client receives personal use license. The Photographer may use images for portfolio and marketing with client consent.</p>`,
  },
  {
    name: "Event Photography Contract",
    category: "EVENT",
    content: `<h1>Event Photography Contract</h1>
<p>Between <strong>{{photographer_name}}</strong> and <strong>{{client_name}}</strong>.</p>
<h2>Event</h2><p>Date: {{session_date}}<br>Coverage: {{duration}} hours</p>
<h2>Deliverables</h2><ul><li>Professional event coverage</li><li>Online gallery within 2 weeks</li><li>Minimum {{photo_count}} edited photos</li></ul>
<h2>Investment</h2><p>Total: {{total_price}}<br>50% deposit required to confirm booking.</p>
<h2>Extra Time</h2><p>Additional coverage: {{hourly_rate}}/hour.</p>`,
  },
  {
    name: "Commercial Photography License",
    category: "COMMERCIAL",
    content: `<h1>Commercial Photography License Agreement</h1>
<p>Between <strong>{{photographer_name}}</strong> ("Licensor") and <strong>{{client_name}}</strong> ("Licensee").</p>
<h2>Scope</h2><p>License for commercial use of photographs as described below.</p>
<h2>Usage Rights</h2><ul><li>Web and social media use</li><li>Print marketing materials</li><li>Duration: 12 months from delivery</li></ul>
<h2>Investment</h2><p>License fee: {{total_price}}</p>
<h2>Restrictions</h2><p>Images may not be resold, sublicensed, or used for purposes not specified above without written consent.</p>`,
  },
  {
    name: "Mini Session Agreement",
    category: "MINI_SESSION",
    content: `<h1>Mini Session Agreement</h1>
<p>Between <strong>{{photographer_name}}</strong> and <strong>{{client_name}}</strong>.</p>
<h2>Session</h2><p>Date: {{session_date}}<br>Duration: 20 minutes<br>Photos: 10 edited digital images</p>
<h2>Fee</h2><p>{{total_price}} — due upon booking (non-refundable)</p>
<h2>Gallery</h2><p>Delivered via online gallery within 7 days. Personal use license included.</p>`,
  },
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  let templates = await prisma.contractTemplate.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  // If no templates, seed defaults
  if (templates.length === 0) {
    for (const t of DEFAULT_TEMPLATES) {
      await prisma.contractTemplate.create({
        data: { organizationId: orgId, name: t.name, content: t.content, category: t.category },
      });
    }
    templates = await prisma.contractTemplate.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json({ templates });
}
