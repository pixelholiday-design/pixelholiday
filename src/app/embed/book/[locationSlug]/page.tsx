import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Camera, Clock, Users, MapPin, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locationSlug: string } }) {
  return { title: `Book a Session — Fotiqo` };
}

export default async function EmbedBookPage({ params }: { params: { locationSlug: string } }) {
  // Try to find location by slug (using name as a fallback lookup)
  const location = await prisma.location.findFirst({
    where: {
      OR: [
        { id: params.locationSlug },
        { name: { contains: params.locationSlug.replace(/-/g, " "), mode: "insensitive" } },
      ],
    },
  });

  // Get active packages for this location (or global packages if no location match)
  const packages = await prisma.photoPackage.findMany({
    where: {
      isActive: true,
      ...(location ? { locationId: location.id } : {}),
    },
    include: { addOns: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    take: 10,
  });

  const locationName = location?.name ?? params.locationSlug.replace(/-/g, " ");

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #fafafa;
            color: #1e293b;
            line-height: 1.5;
          }
          .embed-root { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
          .embed-header {
            text-align: center;
            margin-bottom: 24px;
          }
          .embed-header h1 {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
          }
          .embed-header p { font-size: 14px; color: #64748b; }
          .embed-location {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            color: #0EA5A5;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .pkg-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 12px;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .pkg-card:hover {
            border-color: #0EA5A5;
            box-shadow: 0 2px 8px rgba(14, 165, 165, 0.08);
          }
          .pkg-card.featured {
            border-color: #0EA5A5;
            background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);
          }
          .pkg-badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            background: #0EA5A5;
            color: white;
            padding: 2px 8px;
            border-radius: 100px;
            margin-bottom: 8px;
          }
          .pkg-name { font-size: 18px; font-weight: 700; color: #0f172a; }
          .pkg-desc { font-size: 13px; color: #64748b; margin-top: 4px; }
          .pkg-meta {
            display: flex;
            gap: 16px;
            margin-top: 12px;
            flex-wrap: wrap;
          }
          .pkg-meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #64748b;
          }
          .pkg-meta-item svg { width: 14px; height: 14px; color: #94a3b8; }
          .pkg-price-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #f1f5f9;
          }
          .pkg-price {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
          }
          .pkg-price span { font-size: 14px; font-weight: 400; color: #94a3b8; }
          .book-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #0EA5A5;
            color: white;
            font-size: 14px;
            font-weight: 600;
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            text-decoration: none;
            transition: background 0.2s;
          }
          .book-btn:hover { background: #0d9494; }
          .book-btn svg { width: 16px; height: 16px; }
          .includes-list {
            margin-top: 12px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .includes-tag {
            font-size: 11px;
            background: #f1f5f9;
            color: #475569;
            padding: 3px 10px;
            border-radius: 100px;
          }
          .empty-state {
            text-align: center;
            padding: 48px 16px;
            color: #94a3b8;
          }
          .empty-state svg { width: 48px; height: 48px; margin: 0 auto 12px; opacity: 0.4; }
          .embed-footer {
            text-align: center;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
          }
          .embed-footer a {
            font-size: 12px;
            color: #94a3b8;
            text-decoration: none;
          }
          .embed-footer a:hover { color: #0EA5A5; }
        `}</style>
      </head>
      <body>
        <div className="embed-root">
          <div className="embed-header">
            <div className="embed-location">
              <MapPin style={{ width: 14, height: 14 }} />
              {locationName}
            </div>
            <h1>Book a Photography Session</h1>
            <p>Choose a package and pick your preferred date and time.</p>
          </div>

          {packages.length === 0 ? (
            <div className="empty-state">
              <Camera style={{ width: 48, height: 48 }} />
              <p style={{ fontSize: 14 }}>No packages available at this time.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Please check back later or contact us directly.</p>
            </div>
          ) : (
            packages.map((pkg) => (
              <div key={pkg.id} className={`pkg-card ${pkg.isFeatured ? "featured" : ""}`}>
                {pkg.isFeatured && <div className="pkg-badge">Most Popular</div>}
                <div className="pkg-name">{pkg.name}</div>
                {pkg.shortDescription && <div className="pkg-desc">{pkg.shortDescription}</div>}
                <div className="pkg-meta">
                  <div className="pkg-meta-item">
                    <Clock style={{ width: 14, height: 14 }} />
                    {pkg.duration} min
                  </div>
                  <div className="pkg-meta-item">
                    <Camera style={{ width: 14, height: 14 }} />
                    {pkg.deliveredPhotos}+ photos
                  </div>
                  <div className="pkg-meta-item">
                    <Users style={{ width: 14, height: 14 }} />
                    Up to {pkg.maxGroupSize} people
                  </div>
                </div>
                {pkg.whatsIncluded.length > 0 && (
                  <div className="includes-list">
                    {pkg.whatsIncluded.slice(0, 5).map((item, i) => (
                      <span key={i} className="includes-tag">{item}</span>
                    ))}
                  </div>
                )}
                <div className="pkg-price-row">
                  <div className="pkg-price">
                    {pkg.currency === "EUR" ? "\u20AC" : pkg.currency}
                    {pkg.price.toFixed(0)}
                    {pkg.depositAmount != null && (
                      <span> &middot; {"\u20AC"}{pkg.depositAmount.toFixed(0)} deposit</span>
                    )}
                  </div>
                  <a
                    href={`/book/${pkg.slug}`}
                    className="book-btn"
                    target="_top"
                  >
                    Book Now
                    <ChevronRight style={{ width: 16, height: 16 }} />
                  </a>
                </div>
              </div>
            ))
          )}

          <div className="embed-footer">
            <a href="https://fotiqo.com" target="_blank" rel="noopener noreferrer">
              Powered by Fotiqo
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
