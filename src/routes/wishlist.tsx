import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/use-store";
import { useProducts } from "@/lib/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — 88Thrift" },
      { name: "description", content: "Your saved pre-loved finds." },
      { property: "og:title", content: "Wishlist — 88Thrift" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useStore();
  const { products } = useProducts();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Your Wishlist 💛</h1>
      <p className="mt-1 text-sm text-muted-foreground">{items.length} saved {items.length === 1 ? "treasure" : "treasures"}</p>

      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary"><Heart className="h-9 w-9 text-muted-foreground" /></div>
          <p className="mt-4 font-display text-xl">Nothing saved yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any item to save it for later.</p>
          <Link to="/shop" className="inline-block mt-6"><Button>Browse the shop</Button></Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}