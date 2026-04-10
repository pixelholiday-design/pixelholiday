import { ShoppingBag } from "lucide-react";
import ProductPage from "../ProductPage";
export const metadata = { title: "Online Store \u2014 Fotiqo", description: "Sell 187 products worldwide. Prints, canvas, albums, gifts \u2014 auto-fulfilled by Prodigi and Printful." };
export default function Page() {
  return <ProductPage icon={<ShoppingBag className="h-4 w-4" />} badge="Online Store" headline="Sell prints worldwide \u2014 we handle the rest" subheadline="187 products from prints to photo books to mugs. Auto-fulfilled by Prodigi and Printful. You set the markup, we ship to your clients." color="from-coral-500 to-coral-400" features={[
    { title: "187 products", description: "Prints (21 sizes), canvas (42 options), photo books (16 types), gifts, cards, souvenirs, wall art, and display items." },
    { title: "Dual print labs", description: "Prodigi and Printful handle printing and shipping. Orders auto-route to the best lab." },
    { title: "Photo book builder", description: "Clients design their own softcover, hardcover, or premium layflat photo books from their gallery." },
    { title: "Gift cards", description: "Sell gift cards that clients can redeem in your store. Deferred revenue tracking included." },
    { title: "Coupons & discounts", description: "Create percentage or fixed-amount coupons with limits, expiry dates, and minimum order amounts." },
    { title: "You set prices", description: "See cost price, set your retail price, and know your profit per product. Full margin control." },
  ]} highlights={["187 products across 10 categories", "Auto-fulfillment (Prodigi + Printful)", "Photo book builder (3 types)", "Gift cards and store credits", "Coupons with limits and expiry", "Volume pricing", "Prints from wallet to 24\u00d736 poster", "Canvas, metal, acrylic wall art", "Mugs, phone cases, magnets", "Shipping worldwide"]} ctaText="Open your store free" />;
}
