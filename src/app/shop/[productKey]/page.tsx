import { notFound } from "next/navigation";
import { STATIC_PRODUCTS, type StaticProduct } from "@/lib/staticProducts";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

/* ── Server-side product lookup ────────────────────────────── */
async function getProduct(productKey: string) {
  let allProducts: StaticProduct[] = [];

  // Try DB first
  try {
    const { prisma } = await import("@/lib/db");
    const dbProducts = await prisma.shopProduct.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { isFeatured: "desc" }, { name: "asc" }],
    });
    if (dbProducts.length > 0) {
      allProducts = dbProducts as unknown as StaticProduct[];
    }
  } catch { /* DB unavailable */ }

  // Fallback: static catalog
  if (allProducts.length === 0) {
    allProducts = [...STATIC_PRODUCTS]
      .filter((p) => p.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder || (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || a.name.localeCompare(b.name));
  }

  const product = allProducts.find((p) => p.productKey === productKey) ?? null;

  // Build related products
  let related: StaticProduct[] = [];
  if (product) {
    const sameSubcat = product.subcategory
      ? allProducts.filter(
          (p) => p.productKey !== product.productKey && p.category === product.category && p.subcategory === product.subcategory
        )
      : [];
    if (sameSubcat.length >= 4) {
      related = sameSubcat.slice(0, 4);
    } else {
      const sameCat = allProducts.filter(
        (p) =>
          p.productKey !== product.productKey &&
          p.category === product.category &&
          !sameSubcat.some((s) => s.productKey === p.productKey)
      );
      related = [...sameSubcat, ...sameCat].slice(0, 4);
    }
  }

  return { product, related };
}

/* ── Dynamic metadata ──────────────────────────────────────── */
export async function generateMetadata({ params }: { params: { productKey: string } }) {
  const { product } = await getProduct(params.productKey);
  if (!product) return { title: "Product Not Found — Fotiqo Shop" };
  return {
    title: `${product.name} — Fotiqo Shop`,
    description: product.description,
  };
}

/* ── Page ───────────────────────────────────────────────────── */
export default async function ProductPage({ params }: { params: { productKey: string } }) {
  const { product, related } = await getProduct(params.productKey);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient
      initialProduct={product as any}
      initialRelated={related as any[]}
    />
  );
}
