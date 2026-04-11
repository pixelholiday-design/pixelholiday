import { NextRequest, NextResponse } from "next/server";

/* ── brand colours ─────────────────────────────── */
const NAVY = "#0C2E3D";
const TEAL = "#0EA5A5";
const ORANGE = "#F97316";
const WHITE = "#FFFFFF";
const LIGHT = "#F0FAFA";

/* ── audience-specific content ─────────────────── */

interface SlideContent {
  cover: { title: string; tagline: string };
  problems: string[];
  solution: string[];
  features: { title: string; desc: string }[];
  extraPages?: { heading: string; items: { title: string; desc: string }[] }[];
  cta: { headline: string; body: string };
}

const content: Record<string, SlideContent> = {
  wedding: {
    cover: {
      title: "Fotiqo for Wedding Photographers",
      tagline: "Deliver stunning galleries. Book more couples. Grow your brand.",
    },
    problems: [
      "Juggling Pixieset for galleries, Calendly for bookings, and Stripe for payments",
      "Spending hours watermarking and organising hundreds of wedding photos",
      "Losing revenue because clients forget to purchase prints after the big day",
      "No automated follow-up when couples view but don't buy",
      "Difficult to showcase your portfolio in a way that books new enquiries",
    ],
    solution: [
      "Beautiful, branded client galleries with built-in e-commerce",
      "Integrated booking calendar so couples book directly from your site",
      "Automatic abandoned-cart follow-ups that recover lost sales",
      "Server-side watermarking that protects every image until payment",
      "One dashboard for uploads, sales, bookings, and client communication",
    ],
    features: [
      { title: "Luxury Client Galleries", desc: "Pinterest-style masonry grids with favourites, downloads, and FOMO countdown timers that drive urgency." },
      { title: "Integrated Booking", desc: "Couples pick a date, select a package, and pay a deposit — all without leaving your site." },
      { title: "Smart Watermarking", desc: "Cloudinary-powered server-side watermarks. No CSS hacks, no right-click tricks — truly secure." },
      { title: "Automated Sales Funnel", desc: "Abandoned-cart emails, 7-day sweep-up discounts, and WhatsApp reminders recover revenue on autopilot." },
      { title: "Print Lab Integration", desc: "Offer albums, canvases, and fine-art prints directly from the gallery. You set the markup." },
      { title: "Portfolio & SEO", desc: "AI-optimised portfolio website with blog, reviews, and keywords that rank on Google." },
    ],
    cta: {
      headline: "Start free. Upgrade when you're ready.",
      body: "Join thousands of wedding photographers who deliver faster, sell more, and spend less time on admin.",
    },
  },

  portrait: {
    cover: {
      title: "Fotiqo for Portrait & Family Photographers",
      tagline: "From session to sale — all in one place.",
    },
    problems: [
      "Clients love the photos but never get around to ordering prints",
      "Managing mini-session slots across multiple spreadsheets",
      "Watermarking photos manually in Lightroom before every upload",
      "No easy way for families to favourite and share images",
      "Separate tools for gallery delivery, invoicing, and print fulfilment",
    ],
    solution: [
      "Client galleries with one-click print ordering built in",
      "Session booking with automated reminders and deposits",
      "Instant server-side watermarking on every upload",
      "Favourites and sharing so families involve grandparents in the purchase",
      "Single platform: upload, deliver, sell, and track — done",
    ],
    features: [
      { title: "Client Proofing", desc: "Families heart their favourites, leave comments, and create a shortlist — all inside the gallery." },
      { title: "Mini-Session Scheduler", desc: "Set available dates, let clients pick a slot, collect deposits automatically." },
      { title: "Print Store", desc: "Offer prints, albums, and holiday cards with fulfilment handled for you." },
      { title: "Automated Upsells", desc: "After partial purchases, the system offers remaining images at a discount — boosting average order value." },
      { title: "Gallery Expiry & FOMO", desc: "Countdown timers encourage timely decisions. No more galleries sitting unpurchased for months." },
      { title: "Mobile-First Design", desc: "Galleries look stunning on phones — where 80% of your clients will view them." },
    ],
    cta: {
      headline: "Your next family session deserves better delivery.",
      body: "Try Fotiqo free and see how a modern gallery platform increases your print sales.",
    },
  },

  event: {
    cover: {
      title: "Fotiqo for Event Photographers",
      tagline: "Deliver thousands of photos. Let guests find theirs instantly.",
    },
    problems: [
      "Uploading 2,000 event photos and hoping attendees find themselves",
      "No way for guests to self-serve and purchase their favourites",
      "Face recognition tools are expensive and hard to integrate",
      "Event organisers want same-day delivery but your workflow can't keep up",
      "Revenue left on the table because there's no post-event follow-up",
    ],
    solution: [
      "AI face recognition lets every guest find their photos in seconds",
      "QR code access — scan a wristband or badge, see your images instantly",
      "Real-time upload pipeline: shoot, upload, deliver — same hour",
      "Built-in e-commerce so guests buy prints and downloads on the spot",
      "Automated follow-up emails and WhatsApp messages after the event",
    ],
    features: [
      { title: "Face Recognition", desc: "Guests take a selfie and instantly see every photo they appear in — even in crowds." },
      { title: "QR & Wristband Access", desc: "Scan a code, see your photos. Perfect for conferences, galas, and sporting events." },
      { title: "Bulk Upload Pipeline", desc: "Upload hundreds of photos at once with AI culling that removes blinks and blurs automatically." },
      { title: "Instant Sales", desc: "Guests purchase downloads or prints right from their phone while the excitement is fresh." },
      { title: "Event Organiser Dashboard", desc: "Share a branded gallery link with the organiser. They see engagement stats and can feature highlights." },
      { title: "Post-Event Revenue", desc: "Automated discount campaigns re-engage attendees days after the event, recovering missed sales." },
    ],
    cta: {
      headline: "Deliver faster. Sell smarter. Impress organisers.",
      body: "Start with a free event gallery and see the difference Fotiqo makes.",
    },
  },

  hotel: {
    cover: {
      title: "Fotiqo for Hotels & Resorts",
      tagline: "Turn every guest stay into a premium photo experience.",
    },
    problems: [
      "Photography service is inconsistent and hard to manage across properties",
      "No system to identify which photos belong to which guest",
      "Revenue leakage: guests take phone photos of the display screens",
      "Staff scheduling and commission tracking done manually",
      "No post-checkout follow-up to capture additional sales",
    ],
    solution: [
      "End-to-end platform: upload, identify, display, sell, and deliver",
      "Multiple guest identification: face AI, QR wristbands, NFC, room number",
      "Anti-piracy watermarking that prevents phone-camera theft",
      "Automated staff scheduling, performance tracking, and commission payouts",
      "Post-trip sleeping money engine that sells photos weeks after checkout",
    ],
    features: [
      { title: "Kiosk POS System", desc: "Touch-screen displays in the lobby show guests their photos. Stripe Terminal or cash — payment is instant." },
      { title: "Guest Identification", desc: "Face recognition, QR wristbands, NFC tags, or room numbers — flexible per property." },
      { title: "Anti-Piracy Watermark", desc: "Moving, server-side watermarks on display screens that defeat phone cameras." },
      { title: "Commission Model", desc: "Configurable partner commission per property. Track revenue share in real time." },
      { title: "Automated Sales Funnel", desc: "WhatsApp and email follow-ups after checkout offer remaining photos at a discount." },
      { title: "Staff Management", desc: "Shift scheduling, performance leaderboards, and automated commission calculation." },
    ],
    extraPages: [
      {
        heading: "Venue-Specific Capabilities",
        items: [
          { title: "Welcome Archway", desc: "Capture a family portrait at check-in. Hand them a QR card. They're hooked from day one." },
          { title: "Pre-Arrival Funnel", desc: "Sell Digital Photo Passes before guests arrive — guaranteed revenue before they step on property." },
          { title: "Offline-First Kiosk", desc: "Kiosks work without internet via local network. Transactions sync to the cloud overnight." },
          { title: "B2B Media Barter", desc: "Deliver 10 free promo photos/month to the hotel. Negotiate 10-15% off yearly rent." },
        ],
      },
    ],
    cta: {
      headline: "A turnkey photo revenue stream for your property.",
      body: "Contact us for a custom demo tailored to your hotel or resort.",
    },
  },

  waterpark: {
    cover: {
      title: "Fotiqo for Water Parks & Attractions",
      tagline: "Capture the thrill. Deliver the memory. Monetise every ride.",
    },
    problems: [
      "Speed cameras generate thousands of images with no efficient delivery system",
      "Guests can't find their ride photos among hundreds of strangers",
      "Printed photo booths are slow, expensive, and wasteful",
      "No way to sell digital packages or follow up after the visit",
      "Staff management across multiple ride stations is chaotic",
    ],
    solution: [
      "Speed camera integration with instant cloud pipeline",
      "QR wristband identification links every ride photo to the right guest",
      "Digital-first delivery: guests buy and download from their phone",
      "Automated post-visit campaigns turn one-day visitors into buyers",
      "Centralised staff management across every station in the park",
    ],
    features: [
      { title: "Speed Camera Pipeline", desc: "Nikon D7000 tethered shooting pushes ride photos to the cloud in seconds." },
      { title: "QR Wristband System", desc: "Waterproof wristband with QR code. Photographer scans it, guest scans it at exit — done." },
      { title: "Face Recognition", desc: "Guests take a selfie at the entrance kiosk. Every ride photo is auto-matched to their account." },
      { title: "Real-Time Mobile Delivery", desc: "Digital Pass holders get a WhatsApp notification before they even get off the ride." },
      { title: "Auto-Reel Engine", desc: "AI stitches burst photos into 3-second video reels. Sells as a digital add-on at zero production cost." },
      { title: "Kiosk Network", desc: "Multiple touch screens across the park, all connected on a local network. Works offline." },
    ],
    extraPages: [
      {
        heading: "Attraction-Specific Features",
        items: [
          { title: "Magic Shots & AR", desc: "Overlay 3D characters — pirate parrots, dragons, mascots — onto guest photos. Premium add-on revenue." },
          { title: "Digital Day Pass", desc: "Sell an Unlimited Photo Pass at the gate. Every photo from every ride, automatically delivered." },
          { title: "Multi-Station Management", desc: "Assign photographers to stations, track performance per ride, and rotate shifts automatically." },
          { title: "Seasonal Campaigns", desc: "AI-powered marketing campaigns for holidays, school breaks, and special events." },
        ],
      },
    ],
    cta: {
      headline: "Modernise your ride photo experience.",
      body: "Request a demo to see Fotiqo in action at your attraction.",
    },
  },

  studio: {
    cover: {
      title: "Fotiqo for Photography Studios",
      tagline: "Manage your team, your clients, and your revenue — all in one place.",
    },
    problems: [
      "Multiple photographers means multiple workflows and no consistency",
      "Tracking who shot what, who sold what, and who's owed commission is painful",
      "Client galleries scattered across Dropbox, Google Drive, and email",
      "No centralised booking system — double-bookings happen",
      "Print orders managed through spreadsheets and manual fulfilment",
    ],
    solution: [
      "One platform for every photographer in your studio",
      "Automated commission tracking and monthly payroll reports",
      "Branded client galleries with built-in proofing and sales",
      "Studio-wide booking calendar with conflict detection",
      "Integrated print lab with automated fulfilment",
    ],
    features: [
      { title: "Multi-Photographer Dashboard", desc: "See every photographer's uploads, sales, and conversion rate in one view." },
      { title: "Commission Engine", desc: "Define commission rules per photographer or per shoot type. Payroll reports generated automatically." },
      { title: "Studio Booking Calendar", desc: "Clients book online. The system assigns the right photographer based on availability and skill." },
      { title: "Equipment Tracking", desc: "Know who has which camera, lens, or light kit. Track costs and maintenance schedules." },
      { title: "Client Portal", desc: "Each client gets a branded gallery with proofing, favourites, and direct purchasing." },
      { title: "Performance Analytics", desc: "Leaderboards, conversion rates, and revenue per photographer — data-driven studio management." },
    ],
    cta: {
      headline: "Run your studio like a business, not a hobby.",
      body: "Start your free trial and onboard your team in minutes.",
    },
  },

  freelance: {
    cover: {
      title: "Fotiqo for Freelance Photographers",
      tagline: "Look professional. Sell effortlessly. Stay free to create.",
    },
    problems: [
      "Sending WeTransfer links feels unprofessional",
      "Clients ghost after receiving proofs — no way to follow up",
      "Building a portfolio website is expensive and time-consuming",
      "No simple way to sell prints or digital downloads",
    ],
    solution: [
      "Beautiful branded galleries that make you look like a premium studio",
      "Automated follow-ups that nudge clients to purchase",
      "Built-in portfolio website with SEO — no coding required",
      "One-click print and download sales from every gallery",
    ],
    features: [
      { title: "Free Gallery Hosting", desc: "Start with generous free hosting. Your clients see a premium experience from day one." },
      { title: "Custom Branding", desc: "Your logo, your colours, your domain. Clients never see the Fotiqo brand." },
      { title: "Simple Online Sales", desc: "Set prices for downloads and prints. Stripe handles payments. You get paid instantly." },
      { title: "Portfolio Website", desc: "SEO-optimised portfolio generated from your best work. Attracts new clients organically." },
      { title: "Booking Page", desc: "Share a link. Clients pick a date and pay a deposit. No back-and-forth emails." },
      { title: "Mobile App", desc: "Upload straight from your phone after a shoot. Gallery goes live in minutes." },
    ],
    cta: {
      headline: "Free to start. Built to grow with you.",
      body: "Create your free account at fotiqo.com and deliver your next gallery in style.",
    },
  },
};

/* ── HTML builder helpers ──────────────────────── */

function pageWrapper(inner: string, bg: string = WHITE, textColor: string = NAVY): string {
  return `<div style="min-height:100vh;padding:60px 56px;box-sizing:border-box;background:${bg};color:${textColor};page-break-after:always;display:flex;flex-direction:column;justify-content:center;">${inner}</div>`;
}

function coverPage(title: string, tagline: string): string {
  return pageWrapper(
    `<div style="text-align:center;">
      <div style="font-size:48px;font-weight:800;letter-spacing:-1px;margin-bottom:8px;color:${TEAL};">fotiqo</div>
      <div style="width:60px;height:4px;background:${ORANGE};margin:24px auto 32px;border-radius:2px;"></div>
      <h1 style="font-size:36px;font-weight:700;margin:0 0 16px;line-height:1.2;">${title}</h1>
      <p style="font-size:20px;opacity:0.75;margin:0;">${tagline}</p>
      <p style="margin-top:48px;font-size:14px;opacity:0.5;">The all-in-one photography platform</p>
    </div>`,
    NAVY,
    WHITE,
  );
}

function problemPage(problems: string[]): string {
  const items = problems
    .map(
      (p) =>
        `<li style="margin-bottom:14px;padding-left:8px;line-height:1.5;font-size:17px;">${p}</li>`,
    )
    .join("");
  return pageWrapper(
    `<p style="text-transform:uppercase;font-size:13px;letter-spacing:2px;color:${ORANGE};font-weight:600;margin-bottom:8px;">The problem</p>
    <h2 style="font-size:32px;font-weight:700;margin:0 0 32px;">You're juggling too many tools</h2>
    <ul style="list-style:none;padding:0;margin:0;">${items.replace(/<li/g, '<li style="position:relative;padding-left:28px;" ').replace(/<li style="/g, '<li style="position:relative;padding-left:28px;')}</ul>`,
    WHITE,
    NAVY,
  );
}

function solutionPage(points: string[]): string {
  const items = points
    .map(
      (p) =>
        `<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:18px;">
          <span style="color:${TEAL};font-size:22px;line-height:1;">&#10003;</span>
          <span style="font-size:17px;line-height:1.5;">${p}</span>
        </div>`,
    )
    .join("");
  return pageWrapper(
    `<p style="text-transform:uppercase;font-size:13px;letter-spacing:2px;color:${TEAL};font-weight:600;margin-bottom:8px;">The solution</p>
    <h2 style="font-size:32px;font-weight:700;margin:0 0 32px;color:${WHITE};">One platform. Everything you need.</h2>
    ${items}`,
    NAVY,
    WHITE,
  );
}

function featuresPages(features: { title: string; desc: string }[]): string[] {
  const half = Math.ceil(features.length / 2);
  const pages: string[] = [];

  [features.slice(0, half), features.slice(half)].forEach((group, idx) => {
    const cards = group
      .map(
        (f) =>
          `<div style="background:${WHITE};border-radius:10px;padding:24px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <h3 style="font-size:18px;font-weight:600;margin:0 0 8px;color:${NAVY};">${f.title}</h3>
            <p style="font-size:15px;margin:0;color:#555;line-height:1.5;">${f.desc}</p>
          </div>`,
      )
      .join("");
    pages.push(
      pageWrapper(
        `<p style="text-transform:uppercase;font-size:13px;letter-spacing:2px;color:${TEAL};font-weight:600;margin-bottom:8px;">Key features${idx > 0 ? " (cont.)" : ""}</p>
        <h2 style="font-size:28px;font-weight:700;margin:0 0 28px;color:${NAVY};">Built for your workflow</h2>
        ${cards}`,
        LIGHT,
        NAVY,
      ),
    );
  });

  return pages;
}

function extraPage(heading: string, items: { title: string; desc: string }[]): string {
  const cards = items
    .map(
      (f) =>
        `<div style="background:${LIGHT};border-left:4px solid ${TEAL};padding:20px 24px;margin-bottom:14px;border-radius:0 8px 8px 0;">
          <h3 style="font-size:17px;font-weight:600;margin:0 0 6px;color:${NAVY};">${f.title}</h3>
          <p style="font-size:15px;margin:0;color:#555;line-height:1.5;">${f.desc}</p>
        </div>`,
    )
    .join("");
  return pageWrapper(
    `<p style="text-transform:uppercase;font-size:13px;letter-spacing:2px;color:${ORANGE};font-weight:600;margin-bottom:8px;">Deep dive</p>
    <h2 style="font-size:28px;font-weight:700;margin:0 0 28px;">${heading}</h2>
    ${cards}`,
    WHITE,
    NAVY,
  );
}

function pricingPage(): string {
  const plans = [
    { name: "Starter", price: "Free", features: ["5 galleries/month", "Basic watermarking", "Download delivery", "1 photographer"] },
    { name: "Pro", price: "\u20AC9/mo", features: ["Unlimited galleries", "Advanced watermarking", "Print store", "Booking calendar", "Automated follow-ups"] },
    { name: "Studio", price: "\u20AC19/mo", features: ["Everything in Pro", "Multi-photographer", "Commission engine", "Kiosk POS", "API access", "Priority support"] },
  ];
  const cols = plans
    .map(
      (p, i) =>
        `<div style="flex:1;background:${i === 1 ? NAVY : WHITE};color:${i === 1 ? WHITE : NAVY};border-radius:12px;padding:28px 24px;text-align:center;border:${i === 1 ? "none" : "1px solid #e5e7eb"};">
          <p style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;color:${i === 1 ? TEAL : TEAL};">${p.name}</p>
          <p style="font-size:36px;font-weight:800;margin:0 0 20px;">${p.price}</p>
          ${p.features.map((f) => `<p style="font-size:14px;margin:6px 0;opacity:0.85;">&#10003; ${f}</p>`).join("")}
        </div>`,
    )
    .join("");
  return pageWrapper(
    `<p style="text-transform:uppercase;font-size:13px;letter-spacing:2px;color:${ORANGE};font-weight:600;margin-bottom:8px;">Pricing</p>
    <h2 style="font-size:28px;font-weight:700;margin:0 0 32px;">Simple, transparent plans</h2>
    <div style="display:flex;gap:20px;">${cols}</div>`,
    LIGHT,
    NAVY,
  );
}

function comparisonPage(): string {
  const features = [
    "Client galleries",
    "Server-side watermarking",
    "Integrated booking",
    "Print store",
    "Automated follow-ups",
    "Face recognition",
    "Kiosk POS",
    "Commission tracking",
    "AI photo culling",
    "Auto-reels",
  ];
  const check = `<span style="color:${TEAL};font-weight:700;">&#10003;</span>`;
  const cross = `<span style="color:#ccc;">&mdash;</span>`;
  const fotiqo = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  const pixieset = [1, 1, 0, 1, 0, 0, 0, 0, 0, 0];
  const zno = [1, 1, 0, 1, 0, 0, 0, 0, 0, 0];

  const rows = features
    .map(
      (f, i) =>
        `<tr style="border-bottom:1px solid #eee;">
          <td style="padding:10px 12px;font-size:14px;">${f}</td>
          <td style="padding:10px 12px;text-align:center;">${fotiqo[i] ? check : cross}</td>
          <td style="padding:10px 12px;text-align:center;">${pixieset[i] ? check : cross}</td>
          <td style="padding:10px 12px;text-align:center;">${zno[i] ? check : cross}</td>
        </tr>`,
    )
    .join("");

  return pageWrapper(
    `<p style="text-transform:uppercase;font-size:13px;letter-spacing:2px;color:${TEAL};font-weight:600;margin-bottom:8px;">Comparison</p>
    <h2 style="font-size:28px;font-weight:700;margin:0 0 28px;">Fotiqo vs. the competition</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="border-bottom:2px solid ${NAVY};">
          <th style="text-align:left;padding:10px 12px;font-weight:600;">Feature</th>
          <th style="text-align:center;padding:10px 12px;font-weight:700;color:${TEAL};">Fotiqo</th>
          <th style="text-align:center;padding:10px 12px;font-weight:600;">Pixieset</th>
          <th style="text-align:center;padding:10px 12px;font-weight:600;">Zno</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`,
    WHITE,
    NAVY,
  );
}

function ctaPage(headline: string, body: string): string {
  return pageWrapper(
    `<div style="text-align:center;">
      <div style="font-size:48px;font-weight:800;color:${TEAL};margin-bottom:32px;">fotiqo</div>
      <h2 style="font-size:34px;font-weight:700;margin:0 0 16px;">${headline}</h2>
      <p style="font-size:18px;opacity:0.8;margin:0 0 40px;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.6;">${body}</p>
      <div style="display:inline-block;background:${ORANGE};color:${WHITE};padding:14px 40px;border-radius:8px;font-size:18px;font-weight:600;">Start Free at fotiqo.com</div>
      <p style="margin-top:48px;font-size:14px;opacity:0.5;">hello@fotiqo.com &middot; fotiqo.com</p>
    </div>`,
    NAVY,
    WHITE,
  );
}

/* ── main handler ──────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const { audience } = await req.json();
    const data = content[audience as string];

    if (!data) {
      return NextResponse.json({ error: "Unknown audience" }, { status: 400 });
    }

    const pages: string[] = [
      coverPage(data.cover.title, data.cover.tagline),
      problemPage(data.problems),
      solutionPage(data.solution),
      ...featuresPages(data.features),
      pricingPage(),
      comparisonPage(),
    ];

    if (data.extraPages) {
      for (const ep of data.extraPages) {
        pages.push(extraPage(ep.heading, ep.items));
      }
    }

    pages.push(ctaPage(data.cta.headline, data.cta.body));

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.cover.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
    @media print {
      body { margin: 0; }
      div[style*="page-break-after"] { page-break-after: always; break-after: page; }
    }
    @page { size: A4 landscape; margin: 0; }
  </style>
</head>
<body>${pages.join("")}</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate presentation" }, { status: 500 });
  }
}
