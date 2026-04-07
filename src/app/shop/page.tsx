const PRODUCTS = [
  { id: "album-lux", name: "Luxury Printed Album", price: 150, image: "📕", desc: "Hardcover, 30 pages, premium paper" },
  { id: "canvas-large", name: "Large Canvas Print", price: 85, image: "🖼️", desc: "60×90cm gallery wrap" },
  { id: "digital-gallery", name: "Full Digital Gallery", price: 49, image: "💾", desc: "All photos, high-res" },
  { id: "social-pack", name: "Social Media Package", price: 35, image: "📱", desc: "Photos + auto-reel video" },
];

export default function ShopPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">PixelHoliday Shop</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {PRODUCTS.map((p) => (
          <div key={p.id} className="border rounded-lg p-4 hover:shadow-lg transition">
            <div className="text-6xl text-center py-6 bg-gray-100 rounded">{p.image}</div>
            <h3 className="font-bold mt-3">{p.name}</h3>
            <p className="text-sm text-gray-600">{p.desc}</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xl font-bold">€{p.price}</span>
              <form action="/api/shop/checkout" method="POST">
                <input type="hidden" name="productId" value={p.id} />
                <button className="bg-black text-white px-3 py-1 rounded">Buy</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
