import { createFileRoute, Link } from "@tanstack/react-router";
import { useProduct, useProducts } from "@/lib/use-products";
import { formatPrice, waLink, STORE } from "@/lib/store-config";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, ShoppingBag, Share2, Truck, ShieldCheck } from "lucide-react";
import { useStore, cartActions, wishlistActions } from "@/lib/use-store";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({
    meta: [
      { title: `Product — ${STORE.name}` },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-6 py-20 text-center">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { product, loaded } = useProduct(slug);
  const { products } = useProducts();
  const { wishlist } = useStore();

  if (!loaded) {
    return <div className="container mx-auto px-6 py-20 text-center text-muted-foreground">Loading…</div>;
  }
  if (!product) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-4xl">Item not found 🧐</h1>
        <p className="mt-2 text-muted-foreground">It may have been sold or moved.</p>
        <Link to="/shop" className="inline-block mt-6"><Button>Back to shop</Button></Link>
      </div>
    );
  }

  const liked = wishlist.includes(product.id);
  const sold = product.status === "sold";

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const enquireMsg = `Hi! I'm interested in this item:\n\n👗 *${product.title}*\nSize: ${product.size} | Price: ${formatPrice(product.price)}\nCondition: ${product.condition}\n\nIs it still available?`;

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary shadow-soft">
            <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
            {sold && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/30">
                <span className="rotate-[-8deg] rounded-md bg-ink px-6 py-2 font-display text-2xl font-bold text-cream shadow-pop">Sold</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="rounded-full bg-sage/15 text-sage px-3 py-1 text-xs font-semibold">{product.condition}</span>
            {product.isOnSale && <span className="rounded-full bg-rose text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">Sale</span>}
            {product.isNewArrival && <span className="rounded-full bg-mustard text-ink px-3 py-1 text-xs font-bold uppercase tracking-wider">New</span>}
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{product.title}</h1>
          {product.brand && <p className="mt-1 text-sm text-muted-foreground">{product.brand}</p>}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-ink">{formatPrice(product.price)}</span>
            {product.comparePrice && <span className="text-lg text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5 text-sm">
            <div><dt className="text-muted-foreground text-xs uppercase tracking-wider">Size</dt><dd className="mt-1 font-semibold">{product.size}</dd></div>
            <div><dt className="text-muted-foreground text-xs uppercase tracking-wider">Colour</dt><dd className="mt-1 font-semibold">{product.color}</dd></div>
            <div><dt className="text-muted-foreground text-xs uppercase tracking-wider">Category</dt><dd className="mt-1 font-semibold">{product.category}</dd></div>
            <div><dt className="text-muted-foreground text-xs uppercase tracking-wider">Type</dt><dd className="mt-1 font-semibold">{product.type}</dd></div>
          </dl>

          <p className="mt-6 text-base text-foreground/90 leading-relaxed">{product.description}</p>
          {product.measurements && (
            <p className="mt-3 text-sm"><span className="font-semibold">Measurements:</span> <span className="text-muted-foreground">{product.measurements}</span></p>
          )}
          {product.conditionNotes && (
            <p className="mt-2 text-sm"><span className="font-semibold">Condition notes:</span> <span className="text-muted-foreground">{product.conditionNotes}</span></p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              disabled={sold}
              onClick={() => cartActions.add(product.id)}
              className="flex-1 h-12 font-semibold"
            >
              <ShoppingBag className="h-5 w-5" />
              {sold ? "Sold out" : "Add to Cart"}
            </Button>
            <a href={waLink(enquireMsg)} target="_blank" rel="noreferrer" className="flex-1">
              <Button size="lg" variant="outline" className="w-full h-12 font-semibold border-whatsapp text-whatsapp hover:bg-whatsapp hover:text-white">
                <MessageCircle className="h-5 w-5" /> Enquire
              </Button>
            </a>
            <button
              onClick={() => wishlistActions.toggle(product.id)}
              aria-label="Save"
              className="h-12 w-12 rounded-md border border-border flex items-center justify-center hover:bg-accent/40"
            >
              <Heart className={liked ? "h-5 w-5 fill-rose text-rose" : "h-5 w-5"} />
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              aria-label="Share"
              className="h-12 w-12 rounded-md border border-border flex items-center justify-center hover:bg-accent/40"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4 text-sage" /> Delivery available</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-sage" /> Quality checked</span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">You might also love</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}