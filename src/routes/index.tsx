import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/products";
import { useProducts } from "@/lib/use-products";
import { STORE } from "@/lib/store-config";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, ShoppingBag, MessageCircle, Truck } from "lucide-react";
import heroImg from "@/assets/hero-thrift.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { products } = useProducts();
  const visible = products.filter((p) => p.status !== "sold");
  const featured = visible.filter((p) => p.isFeatured).slice(0, 4);
  const newArrivals = visible.filter((p) => p.isNewArrival).slice(0, 8);
  const onSale = visible.filter((p) => p.isOnSale).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-2 md:gap-12 md:px-6 md:py-20 items-center">
          <div className="order-2 md:order-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-mustard/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-ink">
              ✨ New drops every Friday
            </span>
            <h1 className="mt-4 font-display text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] text-balance">
              Fresh Finds. <br />
              <span className="italic text-sage">Unbeatable</span> Prices.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-md">
              Hand-picked pre-loved fashion, ready for its next favourite person. Browse, save, and order on WhatsApp.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button size="lg" className="h-12 px-7 font-semibold rounded-full">
                  Shop New Arrivals <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/shop" search={{ sale: true }}>
                <Button size="lg" variant="outline" className="h-12 px-7 font-semibold rounded-full border-ink/20">
                  See the sale 🔥
                </Button>
              </Link>
            </div>
          </div>

          <div className="order-1 md:order-2 relative">
            <div className="absolute -top-4 -left-4 h-20 w-20 rounded-full bg-mustard/60 blur-2xl" />
            <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-sage/30 blur-3xl" />
            <div className="relative aspect-[4/5] md:aspect-square rounded-[2rem] overflow-hidden shadow-pop ring-1 ring-border/40">
              <img src={heroImg} alt="Curated vintage thrift collection" className="h-full w-full object-cover" width={1536} height={1024} />
            </div>
            <div className="absolute -bottom-3 -left-3 md:-bottom-5 md:-left-5 rounded-2xl bg-cream border border-border shadow-soft px-4 py-3 animate-float">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">This week</p>
              <p className="font-display text-lg font-bold">+24 new pieces</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category quick-links */}
      <section className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-8 md:gap-4 md:overflow-visible">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/shop"
              search={{ cat: c.name }}
              className="shrink-0 group flex flex-col items-center gap-2 rounded-2xl bg-card border border-border px-5 py-4 hover:bg-accent/40 hover:-translate-y-0.5 transition-all shadow-card md:px-2"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{c.emoji}</span>
              <span className="text-xs font-semibold whitespace-nowrap">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-sage">Owner's picks</span>
            <h2 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tight">Featured Finds</h2>
          </div>
          <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold story-link">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Sale strip */}
      {onSale.length > 0 && (
        <section className="bg-gradient-warm py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="inline-block rounded-full bg-rose px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">🔥 Flash deals</span>
                <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">On sale, going fast</h2>
              </div>
              <Link to="/shop" search={{ sale: true }} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold story-link">All deals <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {onSale.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* New arrivals */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-sage">Just dropped</span>
            <h2 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tight">New Arrivals</h2>
          </div>
          <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold story-link">Browse all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/40 border-y border-border/60 py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="text-center font-display text-3xl md:text-4xl font-semibold tracking-tight">How it works</h2>
          <p className="text-center text-muted-foreground mt-2">Fast, friendly, no faff.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              { icon: Search, t: "Browse", d: "Scroll our latest finds." },
              { icon: ShoppingBag, t: "Add to cart", d: "Save the pieces you love." },
              { icon: MessageCircle, t: "Order on WhatsApp", d: "We confirm availability." },
              { icon: Truck, t: "We deliver", d: "Or pick up from Westlands." },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-6 shadow-card text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage">
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 font-display text-lg font-semibold">{s.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        <h2 className="font-display text-4xl md:text-6xl font-semibold tracking-tight max-w-2xl mx-auto text-balance">
          Ready to find your <span className="italic text-sage">next favourite</span>?
        </h2>
        <p className="mt-4 text-muted-foreground">No accounts, no fuss. Just good clothes and a quick chat.</p>
        <Link to="/shop" className="inline-block mt-8">
          <Button size="lg" className="h-12 px-8 rounded-full font-semibold">Start shopping <ArrowRight className="h-4 w-4" /></Button>
        </Link>
        <p className="mt-6 text-xs text-muted-foreground">Reach us on WhatsApp · {STORE.whatsappDisplay}</p>
      </section>
    </div>
  );
}
