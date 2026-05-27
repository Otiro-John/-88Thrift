import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Search, Menu } from "lucide-react";
import { useState } from "react";
import { STORE } from "@/lib/store-config";
import { useStore, cartActions } from "@/lib/use-store";
import { Button } from "@/components/ui/button";
import logoUrl from "@/assets/logo.png";

export function Header() {
  const { cart, wishlist } = useStore();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-foreground"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={logoUrl}
              alt={`${STORE.name} logo`}
              className="h-10 w-10 rounded-full bg-white object-contain shadow-soft group-hover:animate-wiggle"
            />
            <span className="font-display text-xl font-semibold tracking-tight">
              {STORE.name}
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-ink" }} className="text-muted-foreground hover:text-ink transition-colors">Home</Link>
          <Link to="/shop" activeProps={{ className: "text-ink" }} className="text-muted-foreground hover:text-ink transition-colors">Shop</Link>
          <Link to="/shop" search={{ sale: true } as any} className="text-muted-foreground hover:text-ink transition-colors">Sale</Link>
          <Link to="/about" activeProps={{ className: "text-ink" }} className="text-muted-foreground hover:text-ink transition-colors">About</Link>
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/shop" aria-label="Search" className="hidden sm:inline-flex">
            <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative">
            <Button variant="ghost" size="icon"><Heart className="h-5 w-5" /></Button>
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => cartActions.open()}
            aria-label="Cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent/40 transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-cream">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-border/60 bg-background px-4 py-3 flex flex-col gap-3 text-sm font-medium animate-fade-in">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
        </nav>
      )}
    </header>
  );
}