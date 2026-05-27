import { STORE, waLink } from "@/lib/store-config";
import { Instagram, MessageCircle, MapPin, Truck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="container mx-auto px-4 md:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-display text-2xl font-semibold tracking-tight">{STORE.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            {STORE.description} Each piece is hand-picked, photographed, and ready to find its next favourite person.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Visit</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-sage" />{STORE.location}</li>
            <li className="flex gap-2"><Truck className="h-4 w-4 mt-0.5 text-sage" />{STORE.deliveryNote}</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Say hi</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={waLink("Hi! I'm browsing your thrift store and need some help 😊")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-sage">
                <MessageCircle className="h-4 w-4" /> WhatsApp · {STORE.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={`https://instagram.com/${STORE.instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-sage">
                <Instagram className="h-4 w-4" /> @{STORE.instagram}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {STORE.name} · Pre-loved with love. ·{" "}
        <a href="/admin" className="hover:text-ink">Owner</a>
      </div>
    </footer>
  );
}