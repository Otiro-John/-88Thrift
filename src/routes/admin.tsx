import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { useProducts, refreshProducts } from "@/lib/use-products";
import { mapProduct, type Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatPrice, waLink } from "@/lib/store-config";
import { Loader2, LogOut, Package, ShoppingBag, Settings, Plus, Pencil, Trash2, Upload, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard — 88Thrift" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <AuthGate />;
  if (!isAdmin) return <NotAuthorized />;
  return <Dashboard />;
}

/* ----------------------------------------------------------------- AUTH ---- */

function AuthGate() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const redirectTo = `${window.location.origin}/admin`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm, then sign in.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card className="p-8 rounded-3xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Owner area</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" ? "Sign in to manage your store." : "Create the owner account. The first signup becomes admin."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "login" ? "No account yet? Create one" : "Already have an account? Sign in"}
        </button>
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to store</Link>
        </div>
      </Card>
    </div>
  );
}

function NotAuthorized() {
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-md">
      <h1 className="font-display text-3xl font-semibold">Not authorised</h1>
      <p className="mt-2 text-muted-foreground">This account doesn't have admin access.</p>
      <Button className="mt-6" onClick={() => supabase.auth.signOut()}>Sign out</Button>
    </div>
  );
}

/* ------------------------------------------------------------ DASHBOARD ---- */

function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="container mx-auto px-4 md:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Owner dashboard</h1>
          <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
        </div>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="mt-8">
        <TabsList>
          <TabsTrigger value="inventory"><Package className="h-4 w-4 mr-2" />Inventory</TabsTrigger>
          <TabsTrigger value="orders"><ShoppingBag className="h-4 w-4 mr-2" />Orders</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="mt-6"><InventoryTab /></TabsContent>
        <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
        <TabsContent value="settings" className="mt-6"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------- INVENTORY ---- */

function InventoryTab() {
  const { products, loaded } = useProducts();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} item{products.length === 1 ? "" : "s"}</p>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-2" />Add item</Button>
      </div>

      {!loaded ? (
        <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="p-3 rounded-2xl flex gap-3">
              <img src={p.images[0]} alt={p.title} className="h-24 w-24 object-cover rounded-xl" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium truncate">{p.title}</p>
                  <Badge variant={p.status === "available" ? "default" : "secondary"}>{p.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{p.category} · {p.size}</p>
                <p className="text-sm font-semibold mt-1">{formatPrice(p.price)}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                  <Button size="sm" variant="ghost" onClick={async () => {
                    if (!confirm(`Delete "${p.title}"?`)) return;
                    const { error } = await supabase.from("products").delete().eq("id", p.id);
                    if (error) toast.error(error.message); else { toast.success("Deleted"); refreshProducts(); }
                  }}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <ProductDialog
          product={editing}
          open={creating || !!editing}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function ProductDialog({ product, open, onClose }: { product: Product | null; open: boolean; onClose: () => void }) {
  const isEdit = !!product;
  const [form, setForm] = useState(() => ({
    title: product?.title ?? "",
    category: product?.category ?? "Women",
    type: product?.type ?? "",
    brand: product?.brand ?? "",
    size: product?.size ?? "",
    color: product?.color ?? "",
    condition: product?.condition ?? "Good" as const,
    price: product?.price?.toString() ?? "",
    compare_price: product?.comparePrice?.toString() ?? "",
    description: product?.description ?? "",
    measurements: product?.measurements ?? "",
    tags: product?.tags?.join(", ") ?? "",
    status: product?.status ?? "available" as const,
    is_featured: product?.isFeatured ?? false,
    is_new_arrival: product?.isNewArrival ?? false,
    is_on_sale: product?.isOnSale ?? false,
  }));
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setImages((prev) => [...prev, ...uploaded]);
      toast.success(`Uploaded ${uploaded.length} image${uploaded.length === 1 ? "" : "s"}`);
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title || !form.price || !form.size || !form.color || !form.type) {
      toast.error("Fill in title, type, size, colour and price");
      return;
    }
    if (images.length === 0) {
      toast.error("Add at least one image");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        slug: product?.slug ?? `${slugify(form.title)}-${Math.random().toString(36).slice(2, 6)}`,
        category: form.category,
        type: form.type,
        brand: form.brand || null,
        size: form.size,
        color: form.color,
        condition: form.condition,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        description: form.description,
        measurements: form.measurements || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        status: form.status,
        is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival,
        is_on_sale: form.is_on_sale,
        images,
      };
      const { error } = isEdit
        ? await supabase.from("products").update(payload).eq("id", product!.id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;
      toast.success(isEdit ? "Updated" : "Added");
      refreshProducts();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit item" : "Add new item"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Images</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((src, i) => (
                <div key={src} className="relative">
                  <img src={src} className="h-20 w-20 object-cover rounded-lg" alt="" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 text-xs"
                  >×</button>
                </div>
              ))}
              <label className="h-20 w-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-muted-foreground" />}
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Type (e.g. Dress)"><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></Field>
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Women", "Men", "Kids", "Dresses", "Tops", "Trousers", "Shoes", "Bags"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Brand"><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Field>
            <Field label="Size"><Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></Field>
            <Field label="Colour"><Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
            <Field label="Condition">
              <Select value={form.condition} onValueChange={(v: any) => setForm({ ...form, condition: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Excellent", "Good", "Fair"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["available", "sold", "reserved"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Price (KES)"><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
            <Field label="Compare-at price"><Input type="number" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} /></Field>
          </div>
          <Field label="Description"><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Measurements"><Input value={form.measurements} onChange={(e) => setForm({ ...form, measurements: e.target.value })} /></Field>
          <Field label="Tags (comma-separated)"><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />Featured</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_new_arrival} onChange={(e) => setForm({ ...form, is_new_arrival: e.target.checked })} />New arrival</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_on_sale} onChange={(e) => setForm({ ...form, is_on_sale: e.target.checked })} />On sale</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Save changes" : "Add item"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

/* ----------------------------------------------------------------- ORDERS ---- */

type OrderRow = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_location: string | null;
  items: any;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
};

function OrdersTab() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setOrders((data ?? []) as OrderRow[]);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: OrderRow["status"]) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Updated"); load(); }
  };

  if (orders === null) return <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (orders.length === 0) return <p className="py-16 text-center text-muted-foreground">No orders yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const items = Array.isArray(o.items) ? o.items : [];
        return (
          <Card key={o.id} className="p-4 rounded-2xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{o.customer_name} · {o.customer_phone}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString()} {o.customer_location ? ` · ${o.customer_location}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={o.status} onValueChange={(v) => setStatus(o.id, v as OrderRow["status"])}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <a
                  href={waLink(`Hi ${o.customer_name}, about your order from 88Thrift ✨`, o.customer_phone.replace(/\D/g, ""))}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-sage text-sage-foreground h-9 px-3 text-sm hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                </a>
              </div>
            </div>
            <ul className="mt-3 text-sm space-y-1">
              {items.map((it: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span>{it.qty}× {it.title}</span>
                  <span>{formatPrice(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery {formatPrice(o.delivery_fee)}</span>
              <span className="font-semibold">Total {formatPrice(o.total)}</span>
            </div>
            {o.notes && <p className="mt-2 text-xs text-muted-foreground italic">"{o.notes}"</p>}
          </Card>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------- SETTINGS ---- */

function SettingsTab() {
  const [settings, setSettings] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [s, z] = await Promise.all([
      supabase.from("store_settings").select("*").limit(1).maybeSingle(),
      supabase.from("delivery_zones").select("*").order("fee"),
    ]);
    setSettings(s.data);
    setZones(z.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const saveSettings = async () => {
    setBusy(true);
    const { error } = await supabase.from("store_settings").update({
      name: settings.name,
      tagline: settings.tagline,
      description: settings.description,
      whatsapp: settings.whatsapp,
      whatsapp_display: settings.whatsapp_display,
      instagram: settings.instagram,
      location: settings.location,
      delivery_note: settings.delivery_note,
    }).eq("id", settings.id);
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  const addZone = async () => {
    const { error } = await supabase.from("delivery_zones").insert({ name: "New zone", fee: 0, estimated_time: "" });
    if (error) toast.error(error.message); else load();
  };

  const updateZone = async (id: string, patch: any) => {
    const { error } = await supabase.from("delivery_zones").update(patch).eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  const deleteZone = async (id: string) => {
    if (!confirm("Delete this delivery zone?")) return;
    const { error } = await supabase.from("delivery_zones").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  if (!settings) return <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6 rounded-2xl space-y-3">
        <h3 className="font-display text-xl font-semibold">Store details</h3>
        <Field label="Store name"><Input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} /></Field>
        <Field label="Tagline"><Input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} /></Field>
        <Field label="Description"><Textarea rows={2} value={settings.description} onChange={(e) => setSettings({ ...settings, description: e.target.value })} /></Field>
        <Field label="WhatsApp number (digits only)"><Input value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} /></Field>
        <Field label="WhatsApp display"><Input value={settings.whatsapp_display} onChange={(e) => setSettings({ ...settings, whatsapp_display: e.target.value })} /></Field>
        <Field label="Instagram handle"><Input value={settings.instagram ?? ""} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} /></Field>
        <Field label="Location"><Input value={settings.location} onChange={(e) => setSettings({ ...settings, location: e.target.value })} /></Field>
        <Field label="Delivery note"><Input value={settings.delivery_note} onChange={(e) => setSettings({ ...settings, delivery_note: e.target.value })} /></Field>
        <Button onClick={saveSettings} disabled={busy} className="w-full">
          {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save store details
        </Button>
      </Card>

      <Card className="p-6 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">Delivery zones</h3>
          <Button size="sm" onClick={addZone}><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>
        {zones.length === 0 && <p className="text-sm text-muted-foreground">No zones yet.</p>}
        {zones.map((z) => (
          <div key={z.id} className="grid grid-cols-[1fr_90px_120px_auto_auto] gap-2 items-center">
            <Input defaultValue={z.name} onBlur={(e) => e.target.value !== z.name && updateZone(z.id, { name: e.target.value })} />
            <Input type="number" defaultValue={z.fee} onBlur={(e) => Number(e.target.value) !== z.fee && updateZone(z.id, { fee: Number(e.target.value) })} />
            <Input defaultValue={z.estimated_time ?? ""} placeholder="ETA" onBlur={(e) => e.target.value !== (z.estimated_time ?? "") && updateZone(z.id, { estimated_time: e.target.value })} />
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={z.active} onChange={(e) => updateZone(z.id, { active: e.target.checked })} />on
            </label>
            <Button size="sm" variant="ghost" onClick={() => deleteZone(z.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        ))}
      </Card>
    </div>
  );
}