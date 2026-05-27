import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/store-config";
import { useStore, wishlistActions } from "@/lib/use-store";
import { cn } from "@/lib/utils";

const conditionStyle: Record<string, string> = {
  Excellent: "bg-sage/15 text-sage",
  Good: "bg-mustard/25 text-ink",
  Fair: "bg-rose/15 text-rose",
};

export function ProductCard({ product }: { product: Product }) {
  const { wishlist } = useStore();
  const liked = wishlist.includes(product.id);
  const sold = product.status === "sold";

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary shadow-card">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105",
            sold && "grayscale opacity-70",
          )}
        />

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isOnSale && !sold && (
            <span className="rounded-full bg-rose px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft">
              Sale
            </span>
          )}
          {product.isNewArrival && !sold && (
            <span className="rounded-full bg-mustard px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink shadow-soft">
              New
            </span>
          )}
        </div>

        {/* Wishlist heart */}
        <button
          onClick={(e) => {
            e.preventDefault();
            wishlistActions.toggle(product.id);
          }}
          aria-label="Save to wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur shadow-soft hover:scale-110 transition-transform"
        >
          <Heart className={cn("h-4 w-4", liked ? "fill-rose text-rose" : "text-ink")} />
        </button>

        {sold && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rotate-[-8deg] rounded-md bg-ink/90 px-4 py-1 font-display text-lg font-bold text-cream shadow-pop">
              Sold
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 px-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-tight line-clamp-1">{product.title}</h3>
          <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold", conditionStyle[product.condition])}>
            {product.size}
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-base font-semibold text-ink">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}