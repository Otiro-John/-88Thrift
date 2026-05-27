import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { CATEGORIES } from "@/lib/products";
import { useProducts } from "@/lib/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  q: z.string().optional(),
  cat: z.string().optional(),
  sale: z.boolean().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc"]).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop All — 88Thrift" },
      { name: "description", content: "Browse our curated selection of pre-loved fashion. Filter by category, size, condition and price." },
      { property: "og:title", content: "Shop All — 88Thrift" },
      { property: "og:description", content: "Hand-picked thrift treasures, ready for their next person." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const { products } = useProducts();
  const [query, setQuery] = useState(search.q ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [condition, setCondition] = useState<string | null>(null);
  const [sort, setSort] = useState<string>(search.sort ?? "newest");

  const items = useMemo(() => {
    let list = [...products];
    if (search.cat) list = list.filter((p) => p.category === search.cat || p.type === search.cat);
    if (search.sale) list = list.filter((p) => p.isOnSale);
    if (condition) list = list.filter((p) => p.condition === condition);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, search.cat, search.sale, condition, query, sort]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
          {search.sale ? "On Sale 🔥" : search.cat ?? "Shop everything"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} treasures found</p>
      </div>

      {/* Search + sort bar */}
      <div className="sticky top-16 z-20 -mx-4 md:mx-0 px-4 md:px-0 py-3 bg-background/85 backdrop-blur border-b border-border/50 mb-6">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name, brand, colour..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 rounded-full border border-border bg-card pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="h-10 px-4 rounded-full border border-border bg-card text-sm font-medium inline-flex items-center gap-2 hover:bg-accent/30"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="hidden md:block h-10 rounded-full border border-border bg-card px-4 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>

        {/* Category chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <Link to="/shop" className="shrink-0 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium hover:bg-accent/40">
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/shop"
              search={{ cat: c.name }}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                search.cat === c.name ? "bg-ink text-cream border-ink" : "border-border bg-card hover:bg-accent/40"
              }`}
            >
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>

        {showFilters && (
          <div className="mt-3 rounded-xl border border-border bg-card p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Condition</h3>
              <button onClick={() => setShowFilters(false)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["Excellent", "Good", "Fair"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCondition(condition === c ? null : c)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    condition === c ? "bg-sage text-white border-sage" : "border-border"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-2xl">Hmm, nothing found 🧐</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different filter or search term.</p>
          <Button className="mt-6" onClick={() => { setQuery(""); setCondition(null); }}>Clear filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}