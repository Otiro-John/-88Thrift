import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { STORE } from "@/lib/store-config";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${STORE.name}` },
      { name: "description", content: `${STORE.name} is a curated thrift store for fresh, pre-loved finds. Hand-picked, photographed and delivered.` },
      { property: "og:title", content: `About — ${STORE.name}` },
      { property: "og:description", content: "Pre-loved fashion, curated with love." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-3xl">
      <span className="inline-block rounded-full bg-mustard px-3 py-1 text-xs font-bold uppercase tracking-widest text-ink">Hello there 👋</span>
      <h1 className="mt-4 font-display text-4xl md:text-6xl font-semibold tracking-tight">
        Pre-loved with <span className="text-sage italic">love</span>.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
        {STORE.name} is a small, joyful thrift shop based in {STORE.location.split("·")[0].trim()}. We hunt down the best pre-loved pieces, give each one a glow-up, and photograph them so you can shop from your couch.
      </p>
      <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
        We believe great style shouldn't cost the earth — literally or financially. Every order keeps clothes out of landfills and helps build a more conscious wardrobe.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { n: "1", t: "Browse", d: "Scroll our latest drops." },
          { n: "2", t: "Add to cart", d: "Save the pieces you love." },
          { n: "3", t: "Order on WhatsApp", d: "We confirm and deliver." },
        ].map((s) => (
          <div key={s.n} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-white font-display text-lg font-bold">{s.n}</div>
            <h3 className="mt-3 font-display text-lg font-semibold">{s.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link to="/shop"><Button size="lg">Start exploring →</Button></Link>
      </div>
    </div>
  );
}