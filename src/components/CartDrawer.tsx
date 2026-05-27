import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useStore, cartActions } from "@/lib/use-store";
import { useProducts } from "@/lib/use-products";
import { formatPrice, STORE } from "@/lib/store-config";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { cart, cartOpen } = useStore();
  const { products } = useProducts();

  const items = cart
    .map((c) => {
      const p = products.find((x) => x.id === c.id);
      return p ? { product: p, qty: c.qty } : null;
    })
    .filter(Boolean) as { product: NonNullable<ReturnType<typeof products.find>>; qty: number }[];

  const subtotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.qty, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity ${cartOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => cartActions.close()}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 h-dvh w-full max-w-md bg-background shadow-pop transition-transform duration-300 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!cartOpen}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-xl font-semibold">Your Cart</h2>
          <button
            onClick={() => cartActions.close()}
            className="rounded-full p-2 hover:bg-accent/40"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
              <ShoppingBag className="h-9 w-9 text-muted-foreground" />
            </div>
            <p className="font-display text-lg">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Let's go find some treasures 🛍️</p>
            <Link to="/shop" onClick={() => cartActions.close()} className="mt-6">
              <Button>Browse the shop</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: "calc(100dvh - 220px)" }}>
              {items.map(({ product, qty }) => (
                <div key={product.id} className="flex gap-3 border-b border-border/50 pb-4">
                  <img src={product.images[0]} alt={product.title} className="h-24 w-20 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium line-clamp-1">{product.title}</h3>
                    <p className="text-xs text-muted-foreground">Size {product.size} · {product.condition}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => cartActions.setQty(product.id, qty - 1)} className="h-7 w-7 rounded-md border border-border flex items-center justify-center hover:bg-accent/40"><Minus className="h-3 w-3" /></button>
                      <span className="text-sm w-6 text-center">{qty}</span>
                      <button onClick={() => cartActions.setQty(product.id, qty + 1)} className="h-7 w-7 rounded-md border border-border flex items-center justify-center hover:bg-accent/40"><Plus className="h-3 w-3" /></button>
                      <span className="ml-auto font-semibold text-sm">{formatPrice(product.price * qty)}</span>
                    </div>
                  </div>
                  <button onClick={() => cartActions.remove(product.id)} aria-label="Remove" className="self-start text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-5 py-4 space-y-3 bg-secondary/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{STORE.deliveryNote} — confirmed on WhatsApp.</p>
              <Link to="/checkout" onClick={() => cartActions.close()}>
                <Button className="w-full bg-whatsapp text-white hover:bg-whatsapp/90 h-11 font-semibold">
                  Checkout via WhatsApp →
                </Button>
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}