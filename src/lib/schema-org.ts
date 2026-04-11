const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://fotiqo.com";

export function photographerJsonLd(profile: {
  name: string;
  username: string;
  bio?: string | null;
  location?: string | null;
  specialties?: string[];
  socialInstagram?: string | null;
  socialWebsite?: string | null;
  avatarUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: `${BASE_URL}/p/${profile.username}`,
    description: profile.bio || undefined,
    jobTitle: "Photographer",
    image: profile.avatarUrl || undefined,
    address: profile.location ? { "@type": "PostalAddress", addressLocality: profile.location } : undefined,
    knowsAbout: profile.specialties || [],
    sameAs: [
      profile.socialInstagram ? `https://instagram.com/${profile.socialInstagram}` : null,
      profile.socialWebsite || null,
    ].filter(Boolean),
  };
}

export function imageGalleryJsonLd(gallery: {
  name: string;
  photographerName: string;
  imageUrls: string[];
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: gallery.name,
    url: gallery.url,
    creator: { "@type": "Person", name: gallery.photographerName },
    image: gallery.imageUrls.slice(0, 10).map((url) => ({
      "@type": "ImageObject",
      contentUrl: url,
    })),
  };
}

export function productJsonLd(product: {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.imageUrl || undefined,
    url: product.url,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "EUR",
      availability: "https://schema.org/InStock",
    },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Fotiqo",
    url: BASE_URL,
    description: "Professional photography platform for independent photographers",
    priceRange: "$$",
    serviceType: "Photography",
  };
}
