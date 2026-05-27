import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useStore } from "@/lib/use-store";
import { useProducts } from "@/lib/use-products";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, waLink, STORE } from "@/lib/store-config";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — 88Thrift" },
      { name: "description", content: "Send your order on WhatsApp — we'll confirm and arrange delivery or pickup." },
    ],
  }),
  component: CheckoutPage,
});

const DELIVERY_ZONES = [
  { name: "Pickup (Westlands)", fee: 0 },
  { name: "Nairobi CBD", fee: 100 },
  { name: "Westlands / Kilimani / Lavington", fee: 150 },
  { name: "Karen / Runda / Other Nairobi", fee: 250 },
  { name: "Outside Nairobi (countrywide)", fee: 400 },
];

const schema = z.object({
  name: z.string().trim().min(2, "Please add your name").max(60),
  phone: z.string().trim().min(7, "Please add a valid phone").max(20),
  area: z.string().min(1, "Pick a delivery option"),
  notes: z.string().max(500).optional(),
});

function CheckoutPage() {
  const { cart } = useStore();
  const { products } = useProducts();
  const [form, setForm] = useState({ name: "", phone: "", area: DELIVERY_ZONES[0].name, notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const items = cart
    .map((c) => ({ p: products.find((x) => x.id === c.id), qty: c.qty }))
    .filter((x) => x.p) as { p: NonNullable<typeof products[number]>; qty: number }[];

  const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);
  const deliveryFee = DELIVERY_ZONES.find((z) => z.name === form.area)?.fee ?? 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary"><ShoppingBag className="h-9 w-9 text-muted-foreground" /></div>
        <h1 className="mt-4 font-display text-3xl">Cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add a few treasures, then come back.</p>
        <Link to="/shop" className="inline-block mt-6"><Button>Browse the shop</Button></Link>
      </div>
    );
  }

  const buildMessage = () => {
    const lines = items.map((i, idx) => `${idx + 1}. ${i.p.title} - Size ${i.p.size} - ${formatPrice(i.p.price)}${i.qty > 1 ? ` (x${i.qty})` : ""}`).join("\n");
    return [
      `Hi! I'd like to place an order 🛍️`,
      ``,
      `*Customer Details:*`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Delivery: ${form.area}`,
      ``,
      `*My Order:*`,
      lines,
      ``,
      `Subtotal: ${formatPrice(subtotal)}`,
      `Delivery: ${deliveryFee === 0 ? "Free pickup" : formatPrice(deliveryFee)}`,
      `*Order Total: ${formatPrice(total)}*`,
      form.notes ? `\nNotes: ${form.notes}` : "",
      ``,
      `Please confirm availability. Thank you! 😊`,
    ].filter(Boolean).join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) errs[issue.path[0] as string] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    // Log the order to the database (best-effort; don't block WhatsApp on errors)
    try {
      await supabase.from("orders").insert({
        customer_name: form.name,
        customer_phone: form.phone,
        customer_location: form.area,
        delivery_fee: deliveryFee,
        subtotal,
        total,
        items: items.map((i) => ({
          id: i.p.id, slug: i.p.slug, title: i.p.title, size: i.p.size,
          price: i.p.price, qty: i.qty,
        })),
        notes: form.notes || null,
      });
    } catch (err) {
      console.error("Order log failed", err);
    }
    window.open(waLink(buildMessage()), "_blank");
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-5xl">
      <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">We'll confirm everything on WhatsApp before you pay.</p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Full name *</label>
            <input
              type="text" required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={60}
              className="w-full h-11 rounded-lg border border-border bg-card px-4 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Phone number *</label>
            <input
              type="tel" required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0712 345 678"
              maxLength={20}
              className="w-full h-11 rounded-lg border border-border bg-card px-4 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Delivery option *</label>
            <div className="space-y-2">
              {DELIVERY_ZONES.map((z) => (
                <label key={z.name} className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${form.area === z.name ? "border-sage bg-sage/5" : "border-border hover:bg-accent/30"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio" name="area" value={z.name}
                      checked={form.area === z.name}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                      className="accent-sage"
                    />
                    <span className="text-sm font-medium">{z.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{z.fee === 0 ? "Free" : formatPrice(z.fee)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              maxLength={500} rows={3}
              placeholder="Anything we should know?"
              className="w-full rounded-lg border border-border bg-card p-3 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </form>

        <aside className="rounded-2xl border border-border bg-card p-5 shadow-card h-fit md:sticky md:top-24">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <div className="mt-4 space-y-3 max-h-72 overflow-y-auto">
            {items.map(({ p, qty }) => (
              <div key={p.id} className="flex gap-3">
                <img src={p.images[0]} alt={p.title} className="h-14 w-12 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                  <p className="text-xs text-muted-foreground">Size {p.size} · qty {qty}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(p.price * qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span></div>
            <div className="flex justify-between font-display text-lg font-bold pt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          <Button type="submit" onClick={handleSubmit} className="w-full mt-5 h-12 font-semibold bg-whatsapp text-white hover:bg-whatsapp/90">
            <MessageCircle className="h-5 w-5" /> Send order on WhatsApp
          </Button>
          <p className="mt-3 text-[11px] text-muted-foreground text-center">Order goes to {STORE.whatsappDisplay}. We confirm and arrange payment.</p>
        </aside>
      </div>
    </div>
  );
}