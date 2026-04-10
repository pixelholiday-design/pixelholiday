import { Globe } from "lucide-react";
import ProductPage from "../ProductPage";
export const metadata = { title: "Website Builder \ — Fotiqo", description: "Build a stunning portfolio website with 17 block types, custom fonts, and SEO tools." };
export default function Page() {
  return <ProductPage icon={<Globe className="h-4 w-4" />} badge="Website Builder" headline="A portfolio website that sells for you" subheadline="Drag-and-drop block editor with 17 block types. Custom fonts, custom domain, blog, contact form, and built-in SEO." color="from-purple-500 to-purple-400" features={[
    { title: "17 block types", description: "Hero, gallery grid, about, services, testimonials, contact form, FAQ, CTA, stats, booking widget, blog feed, and more." },
    { title: "Custom domain", description: "Connect your own domain (e.g., photos.yourname.com) with step-by-step DNS instructions." },
    { title: "Custom fonts", description: "Upload .woff2, .ttf, or .otf fonts. Use your brand typography on headings and body text." },
    { title: "Built-in blog", description: "Publish blog posts to improve your Google ranking. AI can help generate content." },
    { title: "Contact form", description: "Every inquiry auto-captures as a lead in your CRM. Get email notifications instantly." },
    { title: "SEO tools", description: "Set page titles, meta descriptions, and Open Graph images for every page. Sitemap included." },
  ]} highlights={["Drag-and-drop block editor", "17 content block types", "Custom domain support", "Custom font upload", "Built-in blog", "Contact form with CRM", "SEO settings per page", "Mobile responsive", "SSL certificate included", "5 page types (Home, About, Portfolio, Services, Contact)"]} ctaText="Build your website free" />;
}
